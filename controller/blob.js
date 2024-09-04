const awsS3Service = require("../service/awsS3"); // Updated import name
const containerName = "model-upload"; // Replace with your actual bucket name

const uploadImages = async (req, res) => {
  try {
    const files = req.files; // Array of files from multer
    const uploadResults = [];

    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        awsS3Service.uploadToS3(file, containerName, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
      uploadResults.push(result);
    }

    res.status(200).json({
      msg: "Images uploaded successfully",
      data: uploadResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading images to AWS S3");
  }
};

const deleteImage = (req, res) => {
  const blobName = req.params.blobName;
  awsS3Service.deleteObject(blobName, containerName, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error deleting image from AWS S3");
    } else {
      res.status(200).send("Image deleted successfully");
    }
  });
};

const listImages = (req, res) => {
  awsS3Service.listObjects(containerName, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error listing images from AWS S3");
    } else {
      res.status(200).json(result);
    }
  });
};

module.exports = {
  uploadImages, // Updated to handle multiple images
  deleteImage,
  listImages,
};
