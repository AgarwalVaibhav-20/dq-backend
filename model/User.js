const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema(
  {
    // Core user fields
    username: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    // 🔹 Role & status
    role: {
      type: String,
      enum: ["admin", "waiter"],
      default: "admin",
    },
    isVerified: { type: Boolean, default: false },
    verifyOTP: { type: String },
    
    // Forgot password
    resetOTP: { type: String },
    resetOtpExpiry: { type: Date },
    otpExpiry: { type: Date },
    status: {
      type: Number,
      default: 1, // 1 = active, 0 = inactive
    },
  },
  { timestamps: true }
);

// 🔑 Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// 📌 Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 📌 Generate JWT
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "7d" }
  );
};

// 📌 Check role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

userSchema.virtual("userProfile", {
  ref: "UserProfile",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

// 📌 Hide sensitive fields
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verifyOTP;
  delete user.otpExpiry;
  return user;
};

const User = mongoose.model("User", userSchema, "User");
module.exports = User;


// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const uuid = require("uuid").v4;
// const userSchema = new mongoose.Schema(
//   {
//     id:{
//       type:String
//     },
//     username: {
//       type: String,
//       unique: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     profilePhoto: {
//       type: String,
//       default: "https://pbs.twimg.com/media/EbNX_erVcAUlwIx.jpg:large",
//     },
//     restaurantId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Restaurant",
//     },
//     role: {
//       type: String,
//       enum: ["admin", "user", "manager"],
//       default: "user",
//     },
//     // Email verification
//     isVerified: { type: Boolean, default: false },
//     verifyOTP: { type: String },
//     otpExpiry: { type: Date },

//     status: {
//       type: Number,
//       default: 1, // 1 = active, 0 = inactive
//     },
//   },
//   { timestamps: true }
// );

// // 🔑 Hash password if modified
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // 📌 Compare password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// // 📌 Generate JWT
// userSchema.methods.generateJWT = function () {
//   return jwt.sign(
//     { id: this._id, role: this.role },
//     process.env.JWT_SECRET || "your_jwt_secret",
//     { expiresIn: "7d" }
//   );
// };

// // 📌 Check role
// userSchema.methods.hasRole = function (role) {
//   return this.role === role;
// };

// // 📌 Hide sensitive fields
// userSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.password;
//   delete user.verifyOTP;
//   delete user.otpExpiry;
//   return user;
// };

// // 📌 Virtual relation to UserProfile
// userSchema.virtual("userProfile", {
//   ref: "UserProfile",
//   localField: "_id",
//   foreignField: "userId",
//   justOne: true,
// });

// const User = mongoose.model("User", userSchema, "User");
// module.exports = User;


// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt')

// const userSchema = new mongoose.Schema(
//   {
//     username: { type: String, unique: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
//     },
// email_verified_at: {
//   type: Date,
// },
//     password: { type: String, required: true },
//     profilePhoto: {
//       type: String,
//       default: "https://pbs.twimg.com/media/EbNX_erVcAUlwIx.jpg:large",
//     },
//     restaurant: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Restaurant",
//     },
//     isVerified: { type: Boolean, default: false },
//     verifyOTP: { type: String },
//     otpExpiry: { type: Date },
//   },
//   { timestamps: true }
// );

// // Generate username if not provided
// userSchema.pre("save", async function (next) {
//   if (!this.username) {
//     let base = this.fullname.replace(/\s+/g, "").toLowerCase();
//     let username = base;
//     let exists = await mongoose.model("User").findOne({ username });

//     // Add random suffix until unique
//     while (exists) {
//       const suffix = Math.floor(1000 + Math.random() * 9000); // random 4 digit
//       username = `${base}${suffix}`;
//       exists = await mongoose.model("User").findOne({ username });
//     }

//     this.username = username;
//   }
//   next();
// });
// userSchema.virtual("userProfile", {
//   ref: "UserProfile",
//   localField: "_id",
//   foreignField: "userId",
//   justOne: true,
// });
// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });
// userSchema.methods.hasRole = function (role) {
//   return this.role === role;
// };
// userSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.password;
//   delete user.verifyOTP;
//   delete user.otpExpiry;
//   return user;
// };

// const User = mongoose.model("User", userSchema);
// module.exports = User;
