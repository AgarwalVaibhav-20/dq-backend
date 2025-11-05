const mongoose = require("mongoose");

const segmentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#FFFFFF",
  },
  textColor: {
    type: String,
    default: "#000000",
  },
});

const wheelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    segments: {
      type: [segmentSchema],
      validate: [
        (v) => v.length > 0,
        "A wheel must have at least one segment.",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Wheel = mongoose.models.Wheel || mongoose.model("Wheel", wheelSchema);

module.exports = Wheel;
