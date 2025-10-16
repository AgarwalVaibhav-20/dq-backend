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
      enum: ["admin", "manager", "waiter", "cashier"],
      default: "admin",
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: function() {
        return this._id;
      }
    },
    isVerified: { type: Boolean, default: false },
    verifyOTP: { type: String },

    // Forgot password
    resetOTP: { type: String },
    resetOtpExpiry: { type: Date },
    otpExpiry: { type: Date },
    status: {
      type: Number,
      default: 1, 
    },

    // 🔹 Permissions (array of allowed navigation items)
    permissions: {
      type: [String],
      default: [], // Empty array means no specific permissions (admin gets all by default)
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
  console.log('🔍 DEBUG: comparePassword called');
  console.log('🔍 DEBUG: candidatePassword:', candidatePassword);
  console.log('🔍 DEBUG: stored password hash:', this.password);
  
  const result = await bcrypt.compare(candidatePassword, this.password);
  console.log('🔍 DEBUG: bcrypt.compare result:', result);
  
  return result;
};

// 📌 Generate JWT
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role, permissions: this.permissions },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "7d" }
  );
};

// 📌 Check role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

// 📌 Virtual relation with profile
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
