const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("../utils/validator/authvalidator");
const {
  signup,
  login,
  forgetpassword,
  verifypassResetCode,
  resetpassword,
} = require("../controllers/authservices");

const router = express.Router();

router.route("/signup").post(signupValidator, signup);

router.route("/login").post(loginValidator, login);

router.route("/forgotpassword").post(forgetpassword);

router.route("/verifyResetCode").post(verifypassResetCode).put(resetpassword);

module.exports = router;
