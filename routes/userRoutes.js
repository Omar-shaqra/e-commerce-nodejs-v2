const express = require("express");
const {
  getuserValidator,
  createuserValidator,
  updateuserValidator,
  ChangeUserPasswordValidator,
  updatemeValidator,
} = require("../utils/validator/uservalidation");
const Authservices = require("../controllers/authservices");

const userclass = require("../controllers/userservices");
const userobject = new userclass();

const router = express.Router();

router
  .route("/getme")
  .get(Authservices.protect, Authservices.getloggedData, userobject.getoneUser);
router
  .route("/updatemypassword")
  .put(Authservices.protect, Authservices.updateLoggedUserPassword);
router
  .route("/updateme")
  .put(
    Authservices.protect,
    updatemeValidator,
    Authservices.updateLoggedUserData
  );
router.route("/deleteme").delete(
  Authservices.protect,

  Authservices.deleteLoggedUserData
);

router
  .route("/")
  .get(
    Authservices.protect,
    Authservices.allowedto("admin", "manager"),
    userobject.getUsers
  )
  .post(
    Authservices.protect,
    Authservices.allowedto("admin"),
    createuserValidator,
    userobject.createUser
  );
router
  .route("/:id")
  .get(
    Authservices.protect,
    Authservices.allowedto("admin"),
    getuserValidator,
    userobject.getoneUser
  )
  .put(
    Authservices.protect,
    Authservices.allowedto("admin"),
    updateuserValidator,
    userobject.updateUser
  )
  .delete(
    Authservices.protect,
    Authservices.allowedto("admin"),
    userobject.deleteUser
  );
router
  .route("/changepassword/:id")
  .put(ChangeUserPasswordValidator, userobject.updateUserPassword);

module.exports = router;
