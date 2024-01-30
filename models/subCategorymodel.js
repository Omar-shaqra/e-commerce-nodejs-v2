const mongoose = require("mongoose");

const subCategoryschema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "subcategory must be unique"],
      trim: true,
      minlength: [2, "subcategory name is too short"],
      maxlength: [32, "subcategory name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "subcategory nust be belong to parent category"],
    },
  },
  { timestamps: true }
);

const subcategorymodel = mongoose.model("subcategory", subCategoryschema);

module.exports = subcategorymodel;
