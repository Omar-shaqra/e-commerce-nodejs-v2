const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerfilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("only images format allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerfilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => {
  const upload = multerOptions();
  return upload.single(fieldName);
};

exports.uploadMiximages = (arrOfFields) => {
  const upload = multerOptions();
  return upload.fields(arrOfFields);
};
