const slugify = require("slugify");
const Reviewmodel = require("../models/reviewmodel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

class Reviews {
  // @desc  get list catigory
  // @route get /api/v1/categories
  //@ access public

  filterobject = (req, res, next) => {
    let filter = {};
    if (req.params.productid) {
      filter = { product: req.params.productid };
    }
    req.filterobj = filter;
    next();
  };

  getReviews = asyncHandler(async (req, res) => {
    let filter = {};

    if (req.filterobj) {
      filter = req.filterobj;
    }

    const DocumentsCounts = await Reviewmodel.countDocuments();

    const apiFeatures = new ApiFeatures(Reviewmodel.find(filter), req.query)
      .paginate(DocumentsCounts)
      .search()
      .filter()

      .limitFields()
      .sort();

    const { mongooseQuery, PaginationResult } = apiFeatures;

    const getReview = await mongooseQuery;

    res
      .status(200)
      .json({ results: getReview.length, PaginationResult, data: getReview });
  });

  getoneReview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const getReview = await Reviewmodel.findById(id);
    if (!getReview) {
      //    res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: getReview });
  });

  // @desc  create catigory
  // @route post /api/v1/categories
  //@ access private
  createReview = asyncHandler(async (req, res) => {
    req.body.user = req.user._id;
    const Review = await Reviewmodel.create(req.body);
    res.status(201).json({ data: Review });
  });

  updateReview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const updatedata = await Reviewmodel.findOneAndUpdate(
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

  deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleteReview = await Reviewmodel.findByIdAndDelete(id);
    if (!deleteReview) {
      //   res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(204).send();
  });
}

module.exports = Reviews;
