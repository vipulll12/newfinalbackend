const express = require("express");
const router = express.Router();

const {
  login,
  getAllEditors,
  getAllUsers,
  getAllRequests,
  assignEditor,
  addEditor,
  updateModelRequest,
  getQuestionResponse,
} = require("../controller/admin");
const { Auth, isAdmin } = require("../middleware/Auth");

// Admin login
router.post("/login", login);

router.post("/editors", Auth, isAdmin, addEditor);
// Get all editors
router.get("/editors", Auth, isAdmin, getAllEditors);

//add editor

// Get all users
router.get("/users", Auth, isAdmin, getAllUsers);

// Get all requests
router.get("/requests", Auth, isAdmin, getAllRequests);
router.put("/requests/:id", Auth, isAdmin, updateModelRequest);

router.post("/requests/assign", Auth, isAdmin, assignEditor);
router.get("/question-response/:userId", getQuestionResponse);

module.exports = router;
