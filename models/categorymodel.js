const mongoose = require("mongoose");

const categoryschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category required"],
      unique: [true, "category must be unique"],
      minlength: [3, "category name is too short"],
      maxlength: [32, "category name is too long"],
    },
    //A and B => shopping.com/A and B
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },

  { timestamps: true }
);

const setImageURL = function (doc) {
  if (doc.image) {
    console.log(process.env.BASE_IRL);
    const imageURL = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageURL;
  }
};

categoryschema.post("init", (doc) => {
  setImageURL(doc);
});

categoryschema.post("save", function (doc) {
  setImageURL(doc);
});

const CategoryModel = mongoose.model("category", categoryschema);

module.exports = CategoryModel;
