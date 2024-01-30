const express = require("express");

const subcatigoriesClass = require("../controllers/subcategoryservices");
const subcatigoriesObj = new subcatigoriesClass();
const Authservices = require("../controllers/authservices");

//mergeparams : allow us to access the parameters on other routes
const router = express.Router({ mergeParams: true });

const {
  createsubcategory,
  getonesubcategory,
  updateonesubcategory,
  deleteonesubcategory,
} = require("../utils/validator/subcategoryvalidation");

//router.get('/',catigoriesObj.createCategory);
router
  .route("/")
  .post(
    Authservices.protect,
    Authservices.allowedto("admin", "manager"),
    subcatigoriesObj.setcategoryidtobody,
    createsubcategory,
    subcatigoriesObj.createsubCategory
  )
  .get(subcatigoriesObj.filterobject, subcatigoriesObj.getsubCategories);
router
  .route("/:id")
  .get(getonesubcategory, subcatigoriesObj.getonesubcategory)
  .put(
    Authservices.protect,
    Authservices.allowedto("admin", "manager"),
    updateonesubcategory,
    subcatigoriesObj.updatesubcategory
  )
  .delete(
    Authservices.protect,
    Authservices.allowedto("admin"),
    deleteonesubcategory,
    subcatigoriesObj.deletesubcategory
  );
module.exports = router;
