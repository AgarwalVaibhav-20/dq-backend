const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    itemImage: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    restaurantId: {
      type: String,
      required: true,
    },
    stock:{
      type:Number,
      default:0
    },
    status: {
      type: Number,
      default: 1, 
    },
    sub_category: {
      type: String,
      trim: true,
    },
    stockItems: [
      {
        stockId: { type: String, },
        quantity: { type: Number, default: 0 },
      }
    ]

  },
  { timestamps: true }
);

const Menu = mongoose.model("Menu", menuSchema , "Menu");
module.exports = Menu;
