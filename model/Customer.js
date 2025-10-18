const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null
    },
    membershipName: {  // ADD THIS
      type: String,
      default: null
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      requuired: true,
    },
    birthday: {
      type: Date,
    },
    anniversary: {
      type: Date,
    },
    corporate: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: Number,
      default: 0,
      min: 0,
    },
    customerType: {
      type: String,
      enum: ['FirstTimer', 'Corporate', 'Regular', 'Lost Customer', 'High Spender'],
      default: 'FirstTimer',
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    earnedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    rewardCustomerPoints:{
      type:Number,
      default:0,
    }
  },
  { timestamps: true }
);

// Pre-save middleware to automatically determine customer type
customerSchema.pre('save', function (next) {
  if (this.isModified('frequency') || this.isModified('totalSpent')) {
    if (this.frequency === 0) {
      this.customerType = 'FirstTimer';
    } else if (this.totalSpent > 500) {
      this.customerType = 'High Spender';
    } else if (this.frequency >= 10) {
      this.customerType = 'Regular';
    } else if (this.frequency >= 1 && this.frequency <= 3) {
      this.customerType = 'Lost Customer';
    }
    // Corporate type is set manually in UI, not auto-calculated
  }
  next();
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
