const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  floorName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  floorNumber: {
    type: Number,
    required: false, // Optional floor numbering (Ground=0, First=1, etc.)
  },
  capacity: {
    type: Number,
    default: 0, // Total seating capacity of this floor
  },
  layout: {
    width: { type: Number, default: 1000 }, // Layout dimensions
    height: { type: Number, default: 800 },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Virtual field to get all tables on this floor
floorSchema.virtual('tables', {
  ref: 'Table',
  localField: '_id',
  foreignField: 'floorId',
  match: { isActive: true }
});

// Compound index for unique floor names per restaurant
floorSchema.index({ floorName: 1, restaurantId: 1 }, { unique: true });

// Pre-save middleware to update capacity
floorSchema.pre('save', async function(next) {
  if (this.isModified('floorName') || this.isNew) {
    // You can add logic here to recalculate capacity based on tables
    next();
  }
});

module.exports = mongoose.model('Floor', floorSchema);