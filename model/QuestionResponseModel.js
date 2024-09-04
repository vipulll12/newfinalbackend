const mongoose = require("mongoose");

const questionResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isMerchant: {
      type: Boolean,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    challenge: {
      type: String,
      required: true,
    },
    referralSource: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuestionResponse", questionResponseSchema);
