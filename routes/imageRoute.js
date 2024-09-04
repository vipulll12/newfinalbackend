const express = require("express");
const multer = require("multer");
const blobController = require("../controller/blob");
const { Auth, isAdmin } = require("../middleware/Auth");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Update the route to handle multiple image uploads
router.post(
  "/upload",
  // Auth,
  // isAdmin,
  upload.array("images", 10), // Adjust the second argument to set the maximum number of images you want to allow
  blobController.uploadImages // Ensure the controller method is updated to handle multiple images
);
router.delete("/delete/:blobName", Auth, isAdmin, blobController.deleteImage);
router.get("/list", Auth, isAdmin, blobController.listImages);

module.exports = router;
