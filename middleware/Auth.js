require("dotenv").config();
const jwt = require("jsonwebtoken");

//auth

exports.Auth = async (req, res, next) => {
  try {
    let token = req.cookies.token || req.body.token || "";
    // If the token is provided in the Authorization header, override the other sources

    console.log(token, "token");
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token not found",
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
      console.log(decode, "data");
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Token is invalid",
      });
    }
  } catch (error) {
    return res.status(405).json({
      success: false,
      message: "Token verification failed",
      data: error.message,
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.role != "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in admin route",
    });
  }
};
