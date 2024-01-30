const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "Too short password"],
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    passwordChangedAt: {
      type: Date,
    },
    passwordResetCode: String,
    passwordResetTime: Date,
    passwordresetVerified: Boolean,
  },
  { timestamps: true }
);

// userSchema.pre("save", async (next) => {
//   console.log(this);
//   //  if (!this.isModified("password")) return next();
//   const user = await this.password;
//   console.log(user);
//   //this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
