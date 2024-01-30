const slugify = require("slugify");
const Brandmodel = require("../models/brandmodel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const { uploadSingleImage } = require("../middlewares/uploadImagemiddleware");

const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

class Brands {
  // @desc  get list catigory
  // @route get /api/v1/categories
  //@ access public

  uploadcategoryimage = uploadSingleImage("image");

  resizeImage = asyncHandler(async (req, res, next) => {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/brands/${filename}`);

    req.body.image = filename;

    next();
  });

  getBrands = asyncHandler(async (req, res) => {
    const DocumentsCounts = await Brandmodel.countDocuments();

    const apiFeatures = new ApiFeatures(Brandmodel.find(), req.query)
      .paginate(DocumentsCounts)
      .search()
      .filter()

      .limitFields()
      .sort();

    const { mongooseQuery, PaginationResult } = apiFeatures;

    const getbrand = await mongooseQuery;

    res
      .status(200)
      .json({ results: getbrand.length, PaginationResult, data: getbrand });

    /* 
    const newCategory = new Brandmodel({name});
    newCategory.save()
    .then((doc)=>{
        res.json(doc);
    })
    .catch((err)=>{
        res.json(err);
    })
*/
  });

  getoneBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const getbrand = await Brandmodel.findById(id);
    if (!getbrand) {
      //    res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: getbrand });
  });

  // @desc  create catigory
  // @route post /api/v1/categories
  //@ access private
  createBrand = asyncHandler(async (req, res) => {
    const name = req.body.name;
    req.body.slug = slugify(name);
    const brand = await Brandmodel.create(req.body);
    res.status(201).json({ data: brand });

    /*Brandmodel.create({name,slug:slugify(name)})
    .then ((brand)=>
        res.status(201).json({data:brand}))
    .catch((err)=> 
         res.status(400).send(err));*/
  });

  updateBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    req.body.slug = slugify(name);
    const updatedata = await Brandmodel.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true }
    );
    if (!updatedata) {
      //  res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: updatedata });
  });

  deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletebrand = await Brandmodel.findByIdAndDelete(id);
    if (!deletebrand) {
      //   res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(204).send();
  });
}

module.exports = Brands;
