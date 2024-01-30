const { check } = require("express-validator");

const validatemiddleware = require("../../middlewares/validatormiddleware");

createcategory = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2 })
    .withMessage("too short")
    .isLength({ max: 32 })
    .withMessage("too long"),
  validatemiddleware,
];
