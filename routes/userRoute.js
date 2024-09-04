const express = require("express");
const router = express.Router();
const userController = require("../controller/user");
const passport = require("passport");
const { Auth } = require("../middleware/Auth");

router.post("/get-otp", userController.getOtp);
router.post("/sign-up", userController.signup);
router.post("/sign-in", userController.signin);
router.post("/model-requests", Auth, userController.createModelRequest);
router.get("/model-requests", Auth, userController.getUserModelRequests);
router.get(
  "/model-requests/:requestId",
  Auth,
  userController.getSpecificModelRequest
);

router.delete(
  "/model-requests/:requestId",
  Auth,
  userController.deleteModelRequest
);
router.post(
  "/model-requests/:requestId/accept-price",
  Auth,
  userController.acceptPrice
);
// router.post("/model-requests/:requestId/pay", userController.makePayment);

router.post(
  "/model-requests/:requestId/update-status",
  Auth,
  userController.makePayment
);

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  userController.googleAuthCallback
);
router.post("/ar-models", Auth, userController.addARModel);
router.get("/ar-models", Auth, userController.getUserARModels);
router.get("/ar-models/:title", userController.getARModelByName);
router.post("/question-response", Auth, userController.storeQuestionResponse);

module.exports = router;
