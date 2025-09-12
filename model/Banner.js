const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    restaurantId: {
      type:String,
    },
    banner_1: {
      type: String, 
      required: true,
    },
    banner_2: {
      type: String,
      default: null,
    },
    banner_3: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
