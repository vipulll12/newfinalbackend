const otpGenerator = require("otp-generator");
const OtpModel = require("../model/OtpModel");
const { sendVerifyEmail } = require("../utils");
const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");
const ModelRequest = require("../model/ModelRequest");
const { ModelRequestStatus } = require("../enum"); // Import the status enum
const ARModel = require("../model/arModel");
const QuestionResponseModel = require("../model/QuestionResponseModel");

async function getOtp(req, res) {
  try {
    const { email } = req.body;
    await OtpModel.deleteMany({ email });

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const otpPayload = { email, otp };
    await OtpModel.create(otpPayload);
    await sendVerifyEmail({ email, otp });

    return res.status(200).json({
      success: true,
      otp: otp,
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
}

async function signup(req, res) {
  const { name, gender, email, password, confirmPassword, otp } = req.body;

  try {
    // Validate input
    if (!email || !password || password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        msg: "Invalid data or passwords do not match",
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "User already exists. Please sign in.",
      });
    }

    // Validate OTP
    const existingOtp = await OtpModel.findOne({ email, otp });
    if (!existingOtp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }
    await existingOtp.deleteOne();

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      gender,
    });
    await newUser.save();

    // Generate token for authentication
    const token = jwt.sign(
      {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        gender: newUser.gender,
      },
      process.env.JWT_SECRET
    );

    // Respond with success message and token
    return res.status(200).json({
      success: true,
      msg: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        gender: newUser.gender,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to create user",
      error: error.message,
    });
  }
}

async function signin(req, res) {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    // Check if user exists
    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Validate password
    if (existingUser.password !== password) {
      return res.status(400).json({
        success: false,
        msg: "Incorrect password",
      });
    }

    // Generate token for authentication
    const token = jwt.sign(
      {
        userId: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        gender: existingUser.gender,
      },
      process.env.JWT_SECRET
    );
    // Respond with success message and token
    return res.status(200).json({
      success: true,
      msg: "User authenticated successfully",
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        gender: existingUser.gender,
      },
    });
  } catch (error) {
    console.error("Error signing in:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to sign in",
      error: error.message,
    });
  }
}

async function googleAuthCallback(req, res) {
  try {
    const { id, displayName, emails, photos } = req.user;

    let user = await User.findOne({
      $or: [{ googleId: id }, { email: emails[0].value }],
    });

    let isNewUser = false;

    if (user) {
      // User exists, update Google ID if necessary
      if (!user.googleId) {
        user.googleId = id;
        await user.save();
      }
    } else {
      // New user, create account
      isNewUser = true;
      user = new User({
        googleId: id,
        name: displayName,
        email: emails[0].value,
        profile_picture:
          photos && photos.length > 0 ? photos[0].value : undefined,
      });
      await user.save();
    }

    // Generate JWT token with user details
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Optional: Set an expiration time for the token
      }
    );

    // Determine action based on whether it's a new user
    const action = isNewUser ? "signup" : "signin";

    // Redirect to frontend with token and action
    res.redirect(
      `https://platform.renderease.com/auth-success?token=${token}&action=${action}`
    );
  } catch (error) {
    console.error("Error in Google authentication:", error);
    res.redirect("/login?error=authentication_failed");
  }
}
async function createModelRequest(req, res) {
  try {
    const { name, description, images, type, tryons, length, height, width } =
      req.body;

    // Validate image count
    if (images.length < 5 || images.length > 10) {
      return res.status(400).json({
        success: false,
        msg: "You must upload between 5 and 10 images.",
      });
    }

    // Validate the type field
    const validTypes = [
      "clothing",
      "footwear",
      "furniture",
      "technology",
      "jewellery",
      "Others",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid type provided. Allowed types are clothing, footwear, furniture, technology, jewellery, and Others.",
      });
    }

    // Enforce the rule for tryons
    if (tryons && type !== "jewellery") {
      return res.status(400).json({
        success: false,
        msg: "Tryons can only be true if the type is jewellery.",
      });
    }

    // Validate length, height, and width
    if (length <= 0 || height <= 0 || width <= 0) {
      return res.status(400).json({
        success: false,
        msg: "Length, height, and width must all be positive numbers.",
      });
    }

    // Create new model request
    const newRequest = await ModelRequest.create({
      userId: req.user.userId,
      name,
      description,
      images,
      status: ModelRequestStatus.IN_REVIEW, // Set initial status using the enum
      editorId: null, // Editor ID is not assigned initially
      type, // Add the type field
      tryons: tryons || false, // Set tryons, default to false if not provided
      length, // Add length
      height, // Add height
      width, // Add width
    });

    res.status(201).json({
      success: true,
      message: "Model request created successfully",
      requestId: newRequest._id,
    });
  } catch (error) {
    console.error("Error creating model request:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to create model request",
    });
  }
}
// Get User Model Requests
async function getUserModelRequests(req, res) {
  try {
    const modelRequests = await ModelRequest.find({ userId: req.user.userId });
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

// Get Specific Model Request
async function getSpecificModelRequest(req, res) {
  try {
    const { requestId } = req.params;
    const modelRequest = await ModelRequest.findOne({
      _id: requestId,
      userId: req.user.userId,
    });

    if (!modelRequest) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found",
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

async function makePayment(req, res) {
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

async function deleteModelRequest(req, res) {
  try {
    const { requestId } = req.params;
    const modelRequest = await ModelRequest.findOne({
      _id: requestId,
      userId: req.user.userId,
    });

    if (!modelRequest) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found",
      });
    }

    if (modelRequest.status == "processing") {
      return res.status(400).json({
        success: false,
        msg: "Cannot delete request in progress",
      });
    }

    await modelRequest.deleteOne();

    res.status(200).json({
      success: true,
      msg: "Model request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting model request:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete model request",
    });
  }
}

const acceptPrice = async (req, res) => {
  try {
    const { requestId } = req.params;

    const modelRequest = await ModelRequest.findById(requestId);
    if (!modelRequest || modelRequest.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        msg: "Model request not found or not authorized",
      });
    }

    modelRequest.status = "processing"; // Change status to processing
    await modelRequest.save();

    res.status(200).json({
      success: true,
      message: "Price accepted successfully, status updated to processing",
    });
  } catch (error) {
    console.error("Error accepting price:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to accept price",
    });
  }
};

async function addARModel(req, res) {
  try {
    const { title, assetUrl } = req.body;

    if (!title || !assetUrl) {
      return res.status(400).json({
        success: false,
        msg: "Title and asset URL are required",
      });
    }

    const newARModel = new ARModel({
      title,
      assetUrl,
      userId: req.user.userId,
    });

    await newARModel.save();

    res.status(201).json({
      success: true,
      message: "AR Model added successfully",
      arModel: newARModel,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "An AR Model with this title already exists for your account",
      });
    }
    console.error("Error adding AR Model:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to add AR Model",
    });
  }
}

// Get All AR Models for a User
async function getUserARModels(req, res) {
  try {
    const arModels = await ARModel.find({ userId: req.user.userId });
    res.status(200).json({
      success: true,
      arModels,
    });
  } catch (error) {
    console.error("Error fetching AR Models:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch AR Models",
    });
  }
}

// Get AR Model by Name
async function getARModelByName(req, res) {
  try {
    const { title } = req.params;

    const arModel = await ARModel.findOne({
      title: title,
    });

    if (!arModel) {
      return res.status(404).json({
        success: false,
        msg: "AR Model not found or you don't have permission to access it",
      });
    }

    res.status(200).json({
      success: true,
      arModel,
    });
  } catch (error) {
    console.error("Error fetching AR Model:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch AR Model",
    });
  }
}

async function storeQuestionResponse(req, res) {
  try {
    const { isMerchant, industry, challenge, referralSource } = req.body;

    const newResponse = new QuestionResponseModel({
      userId: req.user.userId,
      isMerchant,
      industry,
      challenge,
      referralSource,
    });

    await newResponse.save();

    res.status(201).json({
      success: true,
      message: "Question response stored successfully",
      response: newResponse,
    });
  } catch (error) {
    console.error("Error storing question response:", error);
    res.status(500).json({
      success: false,
      message: "Failed to store question response",
      error: error.message,
    });
  }
}

module.exports = {
  getOtp,
  signup,
  signin,
  googleAuthCallback,
  createModelRequest,
  getUserModelRequests,
  getSpecificModelRequest,
  makePayment,
  deleteModelRequest,
  acceptPrice,
  addARModel,
  getUserARModels,
  getARModelByName,
  storeQuestionResponse,
};
