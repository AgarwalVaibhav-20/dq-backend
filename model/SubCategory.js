const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    sub_category_name: {
      type: String,
      required: true,
    },
    categoryName:{
      type:String
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Category",
    },
    restaurantId:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);
const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategory;
