const slugify = require("slugify");
const Usermodel = require("../models/usermodel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const bcrypt = require("bcryptjs");

class Users {
  // @desc  get list catigory
  // @route get /api/v1/categories
  //@ access public
  getUsers = asyncHandler(async (req, res) => {
    const DocumentsCounts = await Usermodel.countDocuments();

    const apiFeatures = new ApiFeatures(Usermodel.find(), req.query)
      .paginate(DocumentsCounts)
      .search()
      .filter()

      .limitFields()
      .sort();

    const { mongooseQuery, PaginationResult } = apiFeatures;

    const getUser = await mongooseQuery;

    res
      .status(200)
      .json({ results: getUser.length, PaginationResult, data: getUser });

    /* 
    const newCategory = new Usermodel({name});
    newCategory.save()
    .then((doc)=>{
        res.json(doc);
    })
    .catch((err)=>{
        res.json(err);
    })
*/
  });

  getoneUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const getUser = await Usermodel.findById(id);
    if (!getUser) {
      //    res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: getUser });
  });

  // @desc  create catigory
  // @route post /api/v1/categories
  //@ access private
  createUser = asyncHandler(async (req, res) => {
    req.body.slug = slugify(req.body.name);
    if (req.body.password == req.body.passwordConfirm) {
      req.body.password = await bcrypt.hash(req.body.password, 12);
      const User = await Usermodel.create(req.body);

      res.status(201).json({ data: User });
    } else {
      throw new Error("password confirmation incorrect");
    }

    /*Usermodel.create({name,slug:slugify(name)})
    .then ((User)=>
        res.status(201).json({data:User}))
    .catch((err)=> 
         res.status(400).send(err));*/
  });

  updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    req.body.slug = slugify(req.body.name);
    const updatedata = await Usermodel.findOneAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        slug: req.body.slug,
        phone: req.body.phone,
        email: req.body.email,
        profileImg: req.body.profileImg,
        role: req.body.role,
      },
      {
        new: true,
      }
    );
    if (!updatedata) {
      //  res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: updatedata });
  });

  updateUserPassword = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updatedata = await Usermodel.findOneAndUpdate(
      { _id: id },
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );
    if (!updatedata) {
      //  res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: updatedata });
  });

  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleteUser = await Usermodel.findByIdAndUpdate(id, { active: false });
    if (!deleteUser) {
      //   res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(204).send();
  });
}

module.exports = Users;
