const mongoose = require("mongoose");

const editorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // or you might use `googleId` for OAuth
  expertise: { type: String }, // Optional: area of expertise
  isActive: { type: Boolean, default: true }, // To track if the editor is currently active
  role: { type: String, required: true, enum: ["editor"] }, // Role of the editor
});

module.exports = mongoose.model("Editor", editorSchema);
