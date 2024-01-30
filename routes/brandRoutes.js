const express = require("express");
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validator/brandvalidation");

const Authservices = require("../controllers/authservices");
const brandclass = require("../controllers/brandservices");
const brandobject = new brandclass();

const router = express.Router();

router
  .route("/")
  .get(brandobject.getBrands)
  .post(
    Authservices.protect,
    Authservices.allowedto("admin", "manager"),
    brandobject.uploadcategoryimage,
    brandobject.resizeImage,
    createBrandValidator,
    brandobject.createBrand
  );
router
  .route("/:id")
  .get(getBrandValidator, brandobject.getoneBrand)
  .put(
    Authservices.protect,
    Authservices.allowedto("admin", "manager"),
    brandobject.uploadcategoryimage,
    brandobject.resizeImage,
    updateBrandValidator,
    brandobject.updateBrand
  )
  .delete(
    Authservices.protect,
    Authservices.allowedto("admin"),
    deleteBrandValidator,
    brandobject.deleteBrand
  );

module.exports = router;
