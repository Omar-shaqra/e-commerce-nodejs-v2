const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const User = require("../models/usermodel");
const bcrypt = require("bcryptjs");

const sendEmail = require("../utils/sendEmail");
const { default: slugify } = require("slugify");

const createToken = (payload) =>
  jwt.sign({ userid: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRETIME,
  });

exports.signup = asyncHandler(async (req, res, next) => {
  if (req.body.password == req.body.passwordConfirm) {
    req.body.password = await bcrypt.hash(req.body.password, 12);
  } else {
    throw new ApiError("Invalid password confirmation");
  }
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRETIME,
  });

  res.status(201).json({ data: user, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("incorrect password or email", 401));
  }
  const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRETIME,
  });
  res.status(200).json({ data: user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  console.log(req.headers);
  //1- check if token exists , if exists Get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not login,please login to get access this route",
        401
      )
    );
  }
  //2- verify token (no change happens , expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  //3-check if users exists
  const CurrentUser = await User.findById(decoded.userid);
  if (!CurrentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }
  //4- check If yser change his password after token created
  if (CurrentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      CurrentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(passChangedTimestamp + " " + decoded.iat);
    //password changed after token created
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError("User recently changed his password , please login again")
      );
    }
  }
  req.user = CurrentUser;
  next();
});

exports.allowedto = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route", 403)
      );
    }
    next();
  });

//@desc     forget password
//@route    Post /api/v1/auth/forgotpassword
//@access   public
exports.forgetpassword = asyncHandler(async (req, res, next) => {
  //1- get  user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with that email : ${req.body.user}`, 404)
    );
  }
  //2- if user exist , Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashresetcode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //save hashed password reset code into db
  user.passwordResetCode = hashresetcode;
  // add epiration time for password  reset code (10 mins)
  user.passwordResetTime = Date.now() + 10 * 60 * 1000;
  user.passwordresetVerified = false;
  await user.save();

  //3-send the reset code via email

  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset code ( valid in 10 mins )",
      message: `Hi ${user.email},\n We received a request to reset password on your E-shop Account.\n
    ${resetCode} \n Enter this code to complete the reset.\n`,
    });
  } catch (e) {
    user.passwordResetCode = undefined;
    user.passwordResetTime = undefined;
    user.passwordresetVerified = undefined;

    await user.save();
    return next(new ApiError("there is an error in sending email : " + e, 500));
  }

  res.status(200).json({
    status: "success",
    message: "Your password reset code send to email",
  });
});

exports.verifypassResetCode = asyncHandler(async (req, res, next) => {
  //1- get useer based on reeset code

  const hashresetcode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashresetcode,
    passwordResetTime: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset Code Invalid or Expired"));
  }
  // 2 - reset code valid
  user.passwordresetVerified = true;
  await user.save();

  res.status(200).json({ status: " Success" });
});

exports.resetpassword = asyncHandler(async (req, res, next) => {
  //1-get user ppaed on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with that email : ${req.body.user}`, 404)
    );
  }
  //2- chek reset code verified
  if (!user.passwordresetVerified) {
    return next(new ApiError("Reset Code not verified", 400));
  }
  user.password = await bcrypt.hash(req.body.newpassword, 12);
  user.passwordChangedAt = Date.now();

  user.passwordResetCode = undefined;
  user.passwordResetTime = undefined;
  user.passwordresetVerified = false;
  await user.save();

  //3- Generate a new token
  const token = createToken(user._id);
  res.status(200).json({ token });
});

exports.getloggedData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.name);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
    },
    {
      new: true,
    }
  );

  res.status(200).json({ data: user });
});

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success" });
});
