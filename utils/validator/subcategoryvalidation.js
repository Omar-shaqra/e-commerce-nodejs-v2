const { check } = require("express-validator");

const validatemiddleware = require("../../middlewares/validatormiddleware");

exports.createsubcategory = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2 })
    .withMessage("too short")
    .isLength({ max: 32 })
    .withMessage("too long"),
  check("category").notEmpty().isMongoId().withMessage("invalid mongo id "),
  validatemiddleware,
];

exports.getonesubcategory = [
  check("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("invalid mongo id"),

  validatemiddleware,
];

exports.updateonesubcategory = [
  check("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("invalid mongo id"),

  validatemiddleware,
];

exports.deleteonesubcategory = [
  check("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("invalid mongo id"),

  validatemiddleware,
];
