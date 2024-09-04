const {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListBucketsCommand,
  GetBucketLocationCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const mime = require("mime-types");
require("dotenv").config();

// Configure AWS S3 Client for the ap-south-1 region
const s3Client = new S3Client({
  region: "ap-south-1",
});

const createBucket = async (bucketName) => {
  try {
    const command = new CreateBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    console.log(`Bucket ${bucketName} created`);
    return { message: `Bucket ${bucketName} created successfully` };
  } catch (err) {
    if (err.name === "BucketAlreadyExists") {
      console.log(`Bucket ${bucketName} already exists`);
      return { message: `Bucket ${bucketName} already exists` };
    } else {
      console.error(`Error creating bucket ${bucketName}:`, err);
      throw err;
    }
  }
};

const uploadToS3FromDisk = async (filePath, bucketName, originalFilename) => {
  const objectKey = generateObjectKey(originalFilename);

  const uploadParams = {
    Bucket: bucketName,
    Key: objectKey,
    Body: fs.createReadStream(filePath),
    ContentType: mime.lookup(filePath) || "application/octet-stream",
    ContentDisposition: "inline",
    ACL: "public-read",
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const encodedObjectKey = encodeURIComponent(objectKey).replace(/%2F/g, "/");
    const url = `https://${bucketName}.s3.ap-south-1.amazonaws.com/${encodedObjectKey}`;

    return {
      bucket: bucketName,
      key: objectKey,
      url: url,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

const listBuckets = async () => {
  try {
    const command = new ListBucketsCommand({});
    const data = await s3Client.send(command);
    const buckets = data.Buckets;

    const bucketRegions = await Promise.all(
      buckets.map(async (bucket) => {
        const bucketName = bucket.Name;
        const locationCommand = new GetBucketLocationCommand({
          Bucket: bucketName,
        });
        const { LocationConstraint } = await s3Client.send(locationCommand);
        const region = LocationConstraint || "us-east-1";

        return {
          name: bucketName,
          region: region,
        };
      })
    );

    return bucketRegions;
  } catch (error) {
    throw new Error(`Error listing buckets: ${error.message}`);
  }
};

const deleteObject = async (objectKey, bucketName) => {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log(`Object ${objectKey} deleted from bucket ${bucketName}`);
  } catch (err) {
    console.error("Error deleting object:", err);
    throw err;
  }
};

const listObjects = async (bucketName) => {
  const params = {
    Bucket: bucketName,
  };

  try {
    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    return data.Contents;
  } catch (err) {
    console.error("Error listing objects:", err);
    throw err;
  }
};

const generateObjectKey = (originalname) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${uniqueSuffix}-${originalname}`;
};

module.exports = {
  createBucket,
  uploadToS3FromDisk,
  deleteObject,
  listObjects,
  listBuckets,
};
