const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      description: "Full name of the user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      description: "Email address of the user",
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      description:
        "Password for user (required only if not using Google authentication)",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      description: "Google ID for users authenticated through Google",
    },
    profile_picture: {
      type: String,
      description: "URL of user's profile picture",
    },
  },
  {
    timestamps: true, // This will automatically manage createdAt and updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);
