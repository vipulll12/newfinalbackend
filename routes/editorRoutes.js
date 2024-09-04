const express = require("express");
const router = express.Router();
const editorController = require("../controller/editor");
const { Auth } = require("../middleware/Auth");

// Routes for editors
router.get("/model-requests", Auth, editorController.getAllModelRequests);
router.get(
  "/model-requests/:requestId",
  Auth,
  editorController.getSpecificModelRequest
);
router.post(
  "/model-requests/:requestId/update-status",
  Auth,
  editorController.updateModelRequestStatus
);
router.post(
  "/model-requests/:requestId/upload",
  Auth,
  editorController.upload3DModel
);
router.post(
  "/model-requests/:requestId/update-price",
  Auth,
  editorController.updateModelRequestPrice
); // Update price of a model request

module.exports = router;
