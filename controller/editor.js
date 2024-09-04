const ModelRequest = require("../model/ModelRequest");
const path = require("path");
const fs = require("fs");
const { ModelRequestStatus } = require("../enum");

async function getAllModelRequests(req, res) {
  try {
    const modelRequests = await ModelRequest.find({ editorId: req.user.id });

    res.status(200).json({
      success: true,
      modelRequests,
    });
  } catch (error) {
    console.error("Error fetching model requests:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch model requests",
    });
  }
}

async function getSpecificModelRequest(req, res) {
  try {
    const { requestId } = req.params;
    const modelRequest = await ModelRequest.findById(requestId);

    if (
      !modelRequest ||
      (modelRequest.editorId &&
        modelRequest.editorId.toString() !== req.user.id)
    ) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found or not assigned to this editor",
      });
    }

    res.status(200).json({
      success: true,
      modelRequest,
    });
  } catch (error) {
    console.error("Error fetching specific model request:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch model request",
    });
  }
}

async function assignModelRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { editorId } = req.body;

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized to assign requests",
      });
    }

    const modelRequest = await ModelRequest.findById(requestId);
    if (!modelRequest) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found",
      });
    }

    modelRequest.editorId = editorId;
    await modelRequest.save();

    res.status(200).json({
      success: true,
      message: "Model request assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning model request:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to assign model request",
    });
  }
}

async function updateModelRequestStatus(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Validate the status against the enum values
    if (!Object.values(ModelRequestStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid status",
      });
    }

    const modelRequest = await ModelRequest.findById(requestId);
    if (!modelRequest) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found or not assigned to this editor",
      });
    }

    modelRequest.status = status;
    await modelRequest.save();

    res.status(200).json({
      success: true,
      message: "Model request status updated successfully",
    });
  } catch (error) {
    console.error("Error updating model request status:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update model request status",
    });
  }
}

async function upload3DModel(req, res) {
  try {
    const { requestId } = req.params;

    const modelRequest = await ModelRequest.findById(requestId);
    if (!modelRequest || modelRequest.editorId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found or not assigned to this editor",
      });
    }

    const modelFile = req.files.model;
    const uploadPath = path.join(__dirname, "../uploads", modelFile.name);

    modelFile.mv(uploadPath, async (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: "Failed to upload model file",
        });
      }

      modelRequest.modelFilePath = uploadPath;
      modelRequest.status = "completed";
      await modelRequest.save();

      res.status(200).json({
        success: true,
        message: "3D model uploaded successfully",
      });
    });
  } catch (error) {
    console.error("Error uploading 3D model:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to upload 3D model",
    });
  }
}

async function updateModelRequestPrice(req, res) {
  try {
    const { requestId } = req.params;
    const { price } = req.body;

    if (price === undefined) {
      return res.status(400).json({
        success: false,
        msg: "Invalid price",
      });
    }

    const modelRequest = await ModelRequest.findById(requestId);
    if (!modelRequest) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found or not assigned to this editor",
      });
    }

    modelRequest.price = price;
    modelRequest.status = ModelRequestStatus.PAYMENT_PENDING;
    await modelRequest.save();

    res.status(200).json({
      success: true,
      message: "Price updated successfully",
    });
  } catch (error) {
    console.error("Error updating model request price:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update model request price",
    });
  }
}

module.exports = {
  getAllModelRequests,
  getSpecificModelRequest,
  assignModelRequest,
  updateModelRequestStatus,
  upload3DModel,
  updateModelRequestPrice,
};
