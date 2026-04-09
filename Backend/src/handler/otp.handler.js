import { createAndStoreOTP } from "./otp.service.js";
import { sendSMS } from "../sms.service.js";
import asyncHandler from "../handler/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const sendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  // ✅ Normalize input
  if (phone) {
    phone = phone.toString().trim().replace(/\D/g, "");
  }

  // ✅ Validate phone
  if (!phone) {
    throw new ApiError("Phone is required", 400);
  }
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    throw new ApiError("Invalid phone number", 400);
  }

  // ✅ Generate OTP
  const otp = await createAndStoreOTP(phone);

  const message = `Your NutriCart OTP is ${otp}. Valid for 5 minutes. Do not share.`;

  //  ✅ Send SMS
  await sendSMS(phone, message);

  //  ✅ Sucess response
  res.status(200).json({
    success: true,
    message: "OTP sent successfully✅",
  });
});

export default sendOTP;
