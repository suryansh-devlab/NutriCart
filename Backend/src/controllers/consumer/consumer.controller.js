import asyncHandler from "../../handler/asyncHandler.js";
import {
  createAndStoreOTP,
  verifyOTP,
  resendOTP,
} from "../../services/otp.service.js";
import Consumer from "../../models/user/user.model.js";
import generateToken from "../../utils/generateToken.js";
import logger from "../../config/logger.js";
import { sendOTPMessage } from "../../services/sms.service.js";
import ApiError from "../../utils/ApiError.js";
import redis from "../../config/redis.js";

// SEND OTP
const sendOTP = asyncHandler(async (req, res) => {
  let { phone } = req.body;

  if (phone) {
    phone = phone.toString().trim().replace(/\D/g, "");
  }

  logger.info(`OTP requested for: ${phone}`);

  // Generate OTP
  const otp = await createAndStoreOTP(phone);

  // Send SMS
  await sendOTPMessage(phone, otp);

  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
});

// VERIFY OTP + LOGIN
const verifyOTPController = asyncHandler(async (req, res) => {
  let { phone, otp } = req.body;

  if (phone) {
    phone = phone.toString().trim().replace(/\D/g, "");
  }

  logger.info(`OTP verify attempt for: ${phone}`);

  await verifyOTP(phone, otp);

  let user = await Consumer.findOne({ phone });

  if (!user) {
    user = await Consumer.create({ phone });
    logger.info(`New user created: ${user._id}`);
  }

  const token = generateToken(user._id);

  logger.info(`User logged in: ${user._id}`);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      phone: user.phone,
    },
  });
});

// RESEND OTP
const resendOTPController = asyncHandler(async (req, res) => {
  let { phone } = req.body;

  phone = phone.toString().trim().replace(/\D/g, "");

  if (!phone) {
    throw new ApiError("Phone is required", 400);
  }

  const resendKey = `otp_resend:${phone}`;

  const exits = await redis.get(resendKey);

  if (exits) {
    throw new ApiError("Please wait 30 seconds before resending OTP", 429);
  }
  const otp = await resendOTP(phone);

  await sendOTPMessage(phone, otp);

  await redis.set(resendKey, "1", "EX", 30); // ⏱️ cooldown

  res.status(200).json({
    success: true,
    message: "OTP resent successfully",
  });
});

export { sendOTP, verifyOTPController, resendOTPController };
