const slugify = require("slugify");
const Productmodel = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const { uploadMiximages } = require("../middlewares/uploadImagemiddleware");

class products {
  // @desc  get list catigory
  // @route get /api/v1/categories
  //@ access public

  uploadProductImages = uploadMiximages([
    {
      name: "imageCover",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 5,
    },
  ]);

  resizeProductImages = async (req, res, next) => {
    //1- processing for imageCover
    if (req.files.imageCover) {
      const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 13333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/products/${imageCoverFilename}`);

      req.body.imageCover = imageCoverFilename;
    }
    //2- processing for images

    if (req.files.images) {
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (image, index) => {
          const imageFilename = `product-${uuidv4()}-${Date.now()}-${[
            index,
          ]}.jpeg`;

          await sharp(image.buffer)
            .resize(2000, 13333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`uploads/products/${imageFilename}`);

          req.body.images.push(imageFilename);
        })
      );
    }
    next();
  };

  getproducts = asyncHandler(async (req, res) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;

    //build query
    let query = {};
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
      console.log(query);
      const test = await Productmodel.find(query);
      console.log(test);
    }

    const DocumentsCounts = await Productmodel.countDocuments();

    const apiFeatures = new ApiFeatures(Productmodel.find(), req.query)
      .paginate(DocumentsCounts)
      .search()
      .filter()

      .limitFields()
      .sort();

    const { mongooseQuery, PaginationResult } = apiFeatures;

    const products = await mongooseQuery;

    res
      .status(200)
      .json({ results: products.length, PaginationResult, data: products });

    // const getproduct = await productmodel
    //   .find(querystr)
    //   .skip(skip)
    //   .limit(limit)
    //   .sort(sortby)
    //   .select(fields);
    // res
    //   .status(200)
    //   .json({ results: getproduct.length, page, data: getproduct });
  });

  getoneproduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Productmodel.findById(id);
    query = query.populate("reviews");

    const getproduct = await query;
    if (!getproduct) {
      //    res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: getproduct });
  });

  // @desc  create catigory
  // @route post /api/v1/categories
  //@ access private
  createproduct = asyncHandler(async (req, res) => {
    req.body.slug = slugify(req.body.title);
    console.log(req.body);
    const product = await Productmodel.create(req.body);
    res.status(201).json({ data: product });
  });

  updateproduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const updatedata = await Productmodel.findOneAndUpdate(
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

  deleteproduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletecategory = await Productmodel.findByIdAndDelete(id);
    if (!deletecategory) {
      //   res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(204).send();
  });
}

module.exports = products;
