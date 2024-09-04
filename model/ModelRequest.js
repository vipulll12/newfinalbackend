const mongoose = require("mongoose");
const { ModelRequestStatus } = require("../enum/index"); // Adjust the path as necessary

// Define the schema for ModelRequest
const modelRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: {
    type: [String],
    validate: [arrayLimit, "{PATH} exceeds the limit of 10 or is less than 5"],
  },
  status: {
    type: String,
    default: ModelRequestStatus.IN_REVIEW, // Use the enum for the default value
    enum: Object.values(ModelRequestStatus), // Use the enum values for the allowed values
  },
  quotedPrice: Number,
  price: { type: Number },
  editorId: { type: mongoose.Schema.Types.ObjectId, ref: "Editor" },
  type: {
    type: String,
    required: true,
    enum: [
      "clothing",
      "footwear",
      "furniture",
      "technology",
      "jewellery",
      "Others",
    ],
  },
  tryons: { type: Boolean, default: false },
  length: { type: Number, required: true },
  height: { type: Number, required: true },
  width: { type: Number, required: true },
  url: {
    type: String,
  },
});

// Validate that the images array contains between 5 and 10 items
function arrayLimit(val) {
  return val.length >= 5 && val.length <= 10;
}

// Export the ModelRequest model
module.exports = mongoose.model("ModelRequest", modelRequestSchema);
