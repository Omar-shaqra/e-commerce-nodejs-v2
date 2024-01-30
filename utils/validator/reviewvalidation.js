const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatormiddleware");
const reviewModel = require("../../models/reviewmodel");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional(),
  check("rating")
    .notEmpty()
    .withMessage("rating is required")
    .isFloat({ min: 1, max: 5 })
    .isLength({ min: 1 })
    .withMessage("min length is 1")
    .isLength({ max: 5 })
    .withMessage("max length is 5"),
  check("user").isMongoId().withMessage("Invalid user id"),
  check("product")
    .isMongoId()
    .withMessage("Invalid user id")
    .custom((val, { req }) =>
      reviewModel
        .findOne({ user: req.user._id, product: req.body.product })
        .then((review) => {
          if (review) {
            return Promise.reject(
              new Error("you are already did a review on this product before")
            );
          }
        })
    ),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      reviewModel.findById(val).then((review) => {
        if (!review)
          return Promise.reject(
            new Error(`there is no review with this ${val}`)
          );
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`you are not allowed to PERFORM THIS ACTION`)
          );
        }
      })
    ),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) => {
      if (req.user.role == "user") {
        return reviewModel.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`there is no review with this ${val}`)
            );
          }
          if (review.user.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`you are not allowed to PERFORM THIS ACTION`)
            );
          }
        });
      }
    }),
  validatorMiddleware,
];
