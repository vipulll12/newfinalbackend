const AdminModel = require("../model/AdminModel");
const jwt = require("jsonwebtoken");
const ModelRequest = require("../model/ModelRequest");
const Editor = require("../model/EditorModel");
const User = require("../model/UserModel");
const QuestionResponse = require("../model/QuestionResponseModel");

require("dotenv").config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All filed are require",
      });
    }
    let user = await AdminModel.findOne({ email });
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "User not exsist",
      });
    }
    if (user?.password == password) {
      // create JWT tokens
      const payload = {
        email: user.email,
        id: user._id,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1w",
      });
      user.token = token;
      3;
      //   user.password = undefined;

      const options = {
        maxAge: 10 * 24 * 60 * 60 * 1000, // Expires after 3 days
        httpOnly: true,
      };
      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password incorect",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login fail eroor in network call",
      data: error.message,
    });
  }
};

// Get all editors
// Get all requests with assignment details
async function getAllRequests(req, res) {
  try {
    const requests = await ModelRequest.find({})
      .populate("userId", "name email")
      .populate("editorId", "name email");

    res.status(200).json({
      success: true,
      requests: requests.map((request) => ({
        id: request._id,
        user: request.userId
          ? { name: request.userId.name, email: request.userId.email }
          : { name: "Unknown", email: "Unknown" },
        editor: request.editorId
          ? { name: request.editorId.name, email: request.editorId.email }
          : "Unassigned",
        name: request.name,
        description: request.description,
        status: request.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch requests",
    });
  }
}
// Assign editor to a request
async function assignEditor(req, res) {
  try {
    const { requestId, editorId } = req.body;

    const modelRequest = await ModelRequest.findById(requestId);

    if (!modelRequest) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found",
      });
    }

    if (modelRequest.editorId) {
      return res.status(400).json({
        success: false,
        msg: "Editor already assigned",
      });
    }

    modelRequest.editorId = editorId;
    await modelRequest.save();

    res.status(200).json({
      success: true,
      msg: "Editor assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning editor:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to assign editor",
    });
  }
}

async function getAllEditors(req, res) {
  try {
    const editors = await Editor.find({});
    res.status(200).json({
      success: true,
      editors,
    });
  } catch (error) {
    console.error("Error fetching editors:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch editors",
    });
  }
}

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch users",
    });
  }
}

const updateModelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the model request by ID and update it
    const updatedRequest = await ModelRequest.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Model request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Model request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating model request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update model request",
      error: error.message,
    });
  }
};

const addEditor = async (req, res) => {
  try {
    const { name, email, password, expertise } = req.body;
    const newEditor = new Editor({
      name,
      email,
      password,
      expertise,
      role: "editor",
    });
    await newEditor.save();
    res.status(201).send("Editor added successfully");
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate email error
      return res.status(400).send("Email already exists");
    }
    res.status(500).send("Internal Server Error");
  }
};

async function getQuestionResponse(req, res) {
  try {
    const { userId } = req.params;

    // Validate if the provided userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const response = await QuestionResponse.findOne({ userId: userId });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Question response not found for this user",
      });
    }

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Error fetching question response:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question response",
      error: error.message,
    });
  }
}

// Get all requests

// Get editor assignments
// async function getEditorAssignments(req, res) {
//   try {
//     const assignments = await ModelRequest.find({ editorId: { $exists: true } })
//       .populate("editorId", "name email")
//       .populate("userId", "name email");
//     res.status(200).json({
//       success: true,
//       assignments,
//     });
//   } catch (error) {
//     console.error("Error fetching editor assignments:", error);
//     res.status(500).json({
//       success: false,
//       msg: "Failed to fetch editor assignments",
//     });
//   }
// }

module.exports = {
  login,
  getAllEditors,
  getAllUsers,
  getAllRequests,
  assignEditor,
  updateModelRequest,
  addEditor,
  getQuestionResponse,
};
