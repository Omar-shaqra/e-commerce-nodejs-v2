const slugify = require("slugify");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Subcategrymodel = require("../models/subCategorymodel");

class subcategories {
  // @desc  create catigory
  // @route post /api/v1/categories
  //@ access private
  setcategoryidtobody = (req, res, next) => {
    if (!req.body.category) req.body.category = req.params.categoryid;
    next();
  };

  createsubCategory = asyncHandler(async (req, res) => {
    const { name, category } = req.body;
    const subcategory = await Subcategrymodel.create({
      name: name,
      slug: slugify(name),
      category: category,
    });
    res.status(201).json({ data: subcategory });
  });

  //newsted route
  filterobject = (req, res, next) => {
    let filter = {};
    if (req.params.categoryid) {
      filter = { category: req.params.categoryid };
    }
    req.filterobj = filter;
    next();
  };

  getsubCategories = asyncHandler(async (req, res) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;

    //  console.log(req.params.categoryid);

    const getsubcat = await Subcategrymodel.find(req.filterobj)
      .skip(skip)
      .limit(limit)
      .populate({ path: "category", select: "name -_id" });
    res.status(200).json({ results: getsubcat.length, page, data: getsubcat });
  });

  getonesubcategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const getsubcategory = await Subcategrymodel.findById(id).populate({
      path: "category",
      select: "name -_id",
    });
    if (!getsubcategory) {
      //    res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: getsubcategory });
  });

  updatesubcategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, category } = req.body;
    const updatedata = await Subcategrymodel.findOneAndUpdate(
      { _id: id },
      { name, slug: slugify(name), category: category },
      { new: true }
    );
    if (!updatedata) {
      //  res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(200).json({ result: updatedata });
  });

  deletesubcategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletecategory = await Subcategrymodel.findByIdAndDelete(id);
    if (!deletecategory) {
      //   res.status(404).json({msg : "error : id is not found"});
      return next(new ApiError("error : id is not found", 404));
    }
    res.status(204).send("deleted");
  });
}

module.exports = subcategories;
