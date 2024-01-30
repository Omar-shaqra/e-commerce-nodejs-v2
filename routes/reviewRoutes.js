const express = require("express");
const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewvalidation");

const Authservices = require("../controllers/authservices");
const reviewclass = require("../controllers/reviewservices");
const reviewobject = new reviewclass();

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewobject.getReviews)
  .post(
    Authservices.protect,
    Authservices.allowedto("user"),
    createReviewValidator,
    reviewobject.createReview
  );
router
  .route("/:id")
  .get(getReviewValidator, reviewobject.filterobject, reviewobject.getoneReview)
  .put(
    Authservices.protect,
    Authservices.allowedto("user"),
    updateReviewValidator,
    reviewobject.updateReview
  )
  .delete(
    Authservices.protect,
    Authservices.allowedto("user", "manager", "admin"),
    deleteReviewValidator,
    reviewobject.deleteReview
  );

module.exports = router;
