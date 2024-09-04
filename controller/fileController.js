const s3Service = require("../service/awsS3");
const fs = require("fs").promises;

exports.createBucket = async (req, res) => {
  try {
    let { bucketName } = req.body;

    bucketName = bucketName.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
    bucketName = bucketName.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");

    if (bucketName.length < 3) {
      bucketName = bucketName.padEnd(3, "0");
    }

    if (bucketName.length > 63) {
      bucketName = bucketName.slice(0, 63);
    }

    if (!bucketName) {
      return res.status(400).json({ error: "Invalid bucket name" });
    }

    const result = await s3Service.createBucket(bucketName);
    res.json(result);
  } catch (error) {
    console.error("Error in createBucket controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.listBucketsWithRegion = async (req, res) => {
  try {
    const bucketRegions = await s3Service.listBuckets();
    res.json(bucketRegions);
  } catch (error) {
    console.error("Error in listBucketsWithRegion controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files[0];
    const result = await s3Service.uploadToS3FromDisk(
      file.path,
      "models-upload",
      file.originalname
    );

    // Delete the file from disk after successful upload
    await fs.unlink(file.path);

    res.json(result);
  } catch (error) {
    console.error("Error in uploadFile controller:", error);
    // Attempt to delete the file if upload failed
    if (req.files && req.files[0] && req.files[0].path) {
      try {
        await fs.unlink(req.files[0].path);
      } catch (unlinkError) {
        console.error("Error deleting file after failed upload:", unlinkError);
      }
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) => {
      return s3Service.uploadToS3FromDisk(
        file.path,
        "models-upload",
        file.originalname
      );
    });

    const results = await Promise.all(uploadPromises);

    // Delete files from disk after successful upload
    await Promise.all(req.files.map((file) => fs.unlink(file.path)));

    res.json(results);
  } catch (error) {
    console.error("Error in uploadMultipleFiles controller:", error);
    // Attempt to delete files if upload failed
    if (req.files && req.files.length > 0) {
      try {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      } catch (unlinkError) {
        console.error("Error deleting files after failed upload:", unlinkError);
      }
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const files = await s3Service.listObjects("models-upload");
    res.json(files);
  } catch (error) {
    console.error("Error in listFiles controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { key } = req.params;
    await s3Service.deleteObject(key, "models-upload");
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error in deleteFile controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
