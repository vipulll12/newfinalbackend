const express = require("express");
const multer = require("multer");
const fileController = require("../controller/fileController");
const path = require("path");

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Create a more flexible Multer instance
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
}).any();

// Middleware to handle Multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

// Increase payload size limit for the entire app
router.use(express.json({ limit: "50mb" }));
router.use(express.urlencoded({ limit: "50mb", extended: true }));

router.post("/bucket", fileController.createBucket);

router.post("/upload", (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return next(err);
    }
    fileController.uploadFile(req, res);
  });
});

router.get("/list", fileController.listFiles);
router.delete("/delete/:key", fileController.deleteFile);
router.get("/list-buckets", fileController.listBucketsWithRegion);

router.post("/upload-multiple", (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return next(err);
    }
    fileController.uploadMultipleFiles(req, res);
  });
});

// Add the error handling middleware
router.use(handleMulterError);

module.exports = router;
