const mongoose = require("mongoose");

const arModelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  assetUrl: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure title is unique for each user
arModelSchema.index({ title: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("ARModel", arModelSchema);
