const mongoose = require("mongoose");

const brandschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "brand required"],
      unique: [true, "brand must be unique"],
      minlength: [3, "brand name is too short"],
      maxlength: [32, "brand name is too long"],
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
    const imageURL = `${process.env.BASE_IRL}/brands/${doc.image}`;
    doc.image = imageURL;
  }
};

brandschema.post("init", (doc) => {
  setImageURL(doc);
});

brandschema.post("save", function (doc) {
  setImageURL(doc);
});

const brandModel = mongoose.model("brand", brandschema);

module.exports = brandModel;
