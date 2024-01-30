const express = require("express");

const productsClass = require("../controllers/productservices");
const productsObj = new productsClass();

const Authservices = require("../controllers/authservices");

const ReviewRoute = require("./reviewRoutes");
//mergeparams : allow us to access the parameters on other routes
const router = express.Router({ mergeParams: true });

const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validator/productvalidation");

router.use("/:productid/rivews", ReviewRoute);

//router.get('/',catigoriesObj.createCategory);
router
  .route("/")
  .post(
    Authservices.protect,
    Authservices.allowedto("admin", "manager"),
    productsObj.uploadProductImages,
    productsObj.resizeProductImages,
    createProductValidator,
    productsObj.createproduct
  )
  .get(productsObj.getproducts);
router
  .route("/:id")
  .get(getProductValidator, productsObj.getoneproduct)
  .put(
    Authservices.protect,
    Authservices.allowedto("admin", "manager"),
    productsObj.uploadProductImages,
    productsObj.resizeProductImages,
    updateProductValidator,
    productsObj.updateproduct
  )
  .delete(
    Authservices.protect,
    Authservices.allowedto("admin"),
    deleteProductValidator,
    productsObj.deleteproduct
  );

module.exports = router;
