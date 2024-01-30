const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewsSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, "min ratings value is 1.0"],
      max: [5, "max rating value is 5.0"],
      required: [true, " rating is required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to user"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "review must belong to Product"],
    },
  },
  { timestamps: true }
);

reviewsSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name profileImg" });
  next();
});

reviewsSchema.statics.calcAverageRatingsAndQuantity = async function (
  productID
) {
  const result = await this.aggregate([
    { $match: { product: productID } },
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$rating" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productID, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productID, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewsSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
  console.log(this);
});

module.exports = mongoose.model("Reviews", reviewsSchema);
