const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatormiddleware");
const User = require("../../models/usermodel");
const bcrypt = require("bcryptjs");

exports.getuserValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  validatorMiddleware,
];

exports.createuserValidator = [
  check("name")
    .notEmpty()
    .withMessage("user required")
    .isLength({ min: 3 })
    .withMessage("Too user Brand name")
    .isLength({ max: 32 })
    .withMessage("Too long user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in used"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("password confirmation required"),
  check("profileImage").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number only accept EG and SA phone numbers"),
  validatorMiddleware,
];

exports.updateuserValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in used"));
        }
      })
    ),
  check("profileImage").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number only accept EG and SA phone numbers"),
  validatorMiddleware,
];

exports.updatemeValidator = [
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in used"));
        }
      })
    ),
  check("profileImage").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number only accept EG and SA phone numbers"),
  validatorMiddleware,
];

exports.ChangeUserPasswordValidator = [
  check("id").notEmpty().withMessage("you must enter your current password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("you must enter the password confirm"),
  body("currentPassword")
    .notEmpty()
    .withMessage("you must enter Password")
    .custom(async (val, { req }) => {
      //1- check the current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("there is no user for this id");
      }
      console.log(user.password);
      const iscorrectpassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!iscorrectpassword) {
        throw new Error("Invalid current password");
      }
      //2 check the confirmatrion
      if (req.body.password != req.body.passwordConfirm) {
        console.log(val + req.body.passwordConfirm);
        throw new Error("Invalid password confirmation");
      }
      return true;
    }),
  validatorMiddleware,
];
