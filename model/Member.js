const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to a Customer collection
    required: true,
    ref: "Customer",
  },
  membershipName: {
    type: String,
    required: true,
    trim: true,
  },
  discount: {
    type: Number, // Discount percentage, e.g., 10 for 10%
    required: true,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "expired"],
    default: "active",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  visitsCount: {
    type: Number,
    default: 0, // Number of times the member has visited
  },
  notes: {
    type: String,
    trim: true, // Any special notes about the member
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update updatedAt
memberSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  // Automatically expire membership if expirationDate passed
  if (this.expirationDate < Date.now()) {
    this.status = "expired";
  }
  next();
});

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
