const slugify = require("slugify");
const categrymodel = require("../models/categorymodel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const { uploadSingleImage } = require("../middlewares/uploadImagemiddleware");

const multer = require("multer");

// const multerStorage = multer.diskStorage({
//   destination: function (req, res, cb) {
//     cb(null, "uploads/categories");
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split("/")[1];
//     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, filename);
//   },
// });// memory storage engine
// const multerStorage = multer.memoryStorage();

// const multerfilter = function (req, file, cb) {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new ApiError("only images format allowed", 400));
//   }
// };

// const upload = multer({ storage: multerStorage, fileFilter: multerfilter });

const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

class catigories {
  // @desc  get list catigory
  // @route get /api/v1/categories
  //@ access public

  uploadcategoryimage = uploadSingleImage("image");

  resizeImage = asyncHandler(async (req, res, next) => {
    if (req.file) {
      await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/categories/${filename}`);

      req.body.image = filename;
    }

    next();
  });

  getCategories = asyncHandler(async (req, res) => {
    const DocumentsCounts = await categrymodel.countDocuments();

    const apiFeatures = new ApiFeatures(categrymodel.find(), req.query)
      .paginate(DocumentsCounts)
      .search()
      .filter()

      .limitFields()
      .sort();

    const { mongooseQuery, PaginationResult } = apiFeatures;

    const getcat = await mongooseQuery;

    res
      .status(200)
      .json({ results: getcat.length, PaginationResult, data: getcat });

    /* 
    const newCategory = new categrymodel({name});
    newCategory.save()
    .then((doc)=>{
        res.json(doc);
    })
    .catch((err)=>{
        res.json(err);
    })
*/
  });

  getonecategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const getcategory = await categrymodel.findById(id);
    if (!getcategory) {
      //    res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: getcategory });
  });

  // @desc  create catigory
  // @route post /api/v1/categories
  //@ access private
  createCategory = asyncHandler(async (req, res) => {
    const name = req.body.name;
    req.body.slug = slugify(name);
    const category = await categrymodel.create(req.body);
    res.status(201).json({ data: category });

    /*categrymodel.create({name,slug:slugify(name)})
    .then ((category)=>
        res.status(201).json({data:category}))
    .catch((err)=> 
         res.status(400).send(err));*/
  });

  updatecategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    req.body.slug = slugify(name);
    const updatedata = await categrymodel.findOneAndUpdate(
      { _id: id },
      { name, slug: slugify(name) },
      { new: true }
    );
    if (!updatedata) {
      //  res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: updatedata });
  });

  deletecategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletecategory = await categrymodel.findByIdAndDelete(id);
    if (!deletecategory) {
      //   res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(204).send();
  });
}

module.exports = catigories;
