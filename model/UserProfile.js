const mongoose = require("mongoose");
const userProfileSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "https://pbs.twimg.com/media/EbNX_erVcAUlwIx.jpg:large",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    firstName: {
      type: String,
      trim: true,
      default: "First Name",
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      default: "Last Name",
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: "Not set",
      required: true,
    },
    phoneNumber: {
      type: String,
      default: "Not provided",
      required: true,
    },
    pinCode: {
      type: String,
      default: "Not provided",
      required: true,
    },
    restName: {
      type: String,
      default: "Not provided",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
      required: true,
    },
    identity: {
      type: String,
      default: "Not provided",
      required: true,
    },
    fcm: {
      type: String,
      default: "Not provided",
      required: true,
    },
    permission: {
      type: String,
    },
    identityNumber: {
      type: String,
      default: "Not provided",
    },
    facebook: {
      type: String,
      default: "Not provided",
      required: true,
    },
    instagram: {
      type: String,
      default: "Not provided",
      required: true,
    },
    whatsapp: {
      type: String,
      default: "Not provided",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema , "UserProfile");

module.exports = UserProfile;
