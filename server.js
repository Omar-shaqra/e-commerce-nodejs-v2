const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const rateLimit = require("express-rate-limit");

var bodyParser = require("body-parser");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const dbconnection = require("./config/database");
const categoryroute = require("./routes/categoryRoutes");
const subcategoryroute = require("./routes/subcategoryRoutes");
const brandroute = require("./routes/brandRoutes");
const productroute = require("./routes/productRoutes");
const userroute = require("./routes/userRoutes");
const authroute = require("./routes/authRoutes");
const reviewroute = require("./routes/reviewRoutes");
const wishlistroute = require("./routes/wishlistRoute");

const app = express();

//middle ware
app.use(morgan("dev"));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(mongoSanitize());
app.use(xss());

app.use(hpp({ whitelist: ["price"] }));

const port = process.env.port;

dbconnection(); //mongoose connection

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, // limit each ip to 100 request
  message: "Too many requests created from this IP, please try again Later",
});

app.use(limiter);

//root
app.use("/api/v1/categories", categoryroute);
app.use("/api/v1/subcategories", subcategoryroute);
app.use("/api/v1/brands", brandroute);
app.use("/api/v1/products", productroute);
app.use("/api/v1/users", userroute);
app.use("/api/v1/auth", authroute);
app.use("/api/v1/review", reviewroute);
app.use("/api/v1/wishlist", wishlistroute);

//handlling errors

app.all("*", (req, res, next) => {
  /*   const err = new Error(`can't find this route ${req.originalUrl}`);
    next(err.message);*/
  const msg = `can't find this route ${req.originalUrl}`;
  next(new ApiError(msg, 400));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
});

const server = app.listen(port, () => {
  console.log(`server start on ${port}`);
});

// handling regiction outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error : ${err.name} | ${err.message} `);
  server.close(() => {
    console.error("Shutting down.....");
    process.exit(1);
  });
});
