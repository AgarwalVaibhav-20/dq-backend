const mongoose = require("mongoose");

const dueTransactionSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", 
    },
    total: {
      type: Number,
    },
    customerName:{
      type:String
    },
    status: {
      type: String,
      enum: ["paid" , "unpaid"], 
    },
    restaurantId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const DueTransaction = mongoose.model("DueTransaction", dueTransactionSchema);

module.exports = DueTransaction;
