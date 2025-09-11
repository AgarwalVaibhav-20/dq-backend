const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(

  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    categoryImage: {
      type: String,
      default: null,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    size: {
      type: String,
    },
    basePrice: {
      type: Number,
      min: 0,
      default: null
    },
    description: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
