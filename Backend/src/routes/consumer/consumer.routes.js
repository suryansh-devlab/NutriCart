import express from "express";
import {
  sendOTP,
  verifyOTPController,
  resendOTPController,
} from "../../controllers/consumer/consumer.controller.js";
import protect from "../../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 AUTH ROUTES
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPController);
router.post("/resend-otp", resendOTPController);

// 👤 USER ROUTES
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// 📍 ADDRESS ROUTES (protected)
// router.post("/address", protect, addAddress);
// router.get("/address", protect, getUserAddresses);

export default router;
