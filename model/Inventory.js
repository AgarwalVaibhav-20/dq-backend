const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    supplierName:{
      type:String
    }
    ,
    quantity: {
      type: Number,
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Supplier",
      required: true,
    },
    restaurantId:{
      type:String,
    },
    unit: {
      type: String,
      required: true, 
      trim: true,
    },
    isDeleted:{
      type:Boolean,
      default:false
    },
    deletedTime:{
      type:Date,
    }
  },
  { timestamps: true }
);

// ✅ FIXED - Correct model name
inventorySchema.virtual("supplier", {
  ref: "Supplier",       
  localField: "supplierId",
  foreignField: "_id",
  justOne: true,
});

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;