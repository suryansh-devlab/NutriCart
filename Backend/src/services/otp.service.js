import redis from "../config/redis.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";
import axios from "axios";

const OTP_EXPIRY = 300; // 5 minutes
const MAX_ATTEMPTS = 5;

// 🔢 Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 📞 Normalize phone
const normalizePhone = (phone) => {
  return phone.toString().trim().replace(/\D/g, "");
};

// 📦 Send OTP (store + rate limit)
const createAndStoreOTP = async (phone) => {
  phone = normalizePhone(phone);

  const otpKey = `otp:${phone}`;
  const attemptsKey = `otp_attempts:${phone}`;

  // 🔒 Check if OTP already exists
  const existingOTP = await redis.get(otpKey);

  if (existingOTP) {
    const ttl = await redis.ttl(otpKey);
    throw new ApiError(`OTP already sent. Try again in ${ttl}s`, 429);
  }

  const otp = generateOTP();

  // Store OTP with expiry
  await redis.set(otpKey, otp, "EX", OTP_EXPIRY);

  // Reset attempts
  await redis.set(attemptsKey, 0, "EX", OTP_EXPIRY);

  // 🔐 Log (only for dev)
  logger.info(`OTP for ${phone}: ${otp}`);

  return otp;
};

// ✅ Verify OTP (with attempt limit)
const verifyOTP = async (phone, otp) => {
  phone = normalizePhone(phone);
  otp = otp.toString().trim();

  const otpKey = `otp:${phone}`;
  const attemptsKey = `otp_attempts:${phone}`;

  const storedOTP = await redis.get(otpKey);

  if (!storedOTP) {
    throw new ApiError("OTP expired or not found", 400);
  }

  // 🔢 Get current attempts
  let attempts = await redis.get(attemptsKey);
  attempts = attempts ? parseInt(attempts) : 0;

  // ❌ Wrong OTP
  if (storedOTP !== otp) {
    attempts += 1;

    await redis.set(attemptsKey, attempts, "EX", OTP_EXPIRY);

    if (attempts >= MAX_ATTEMPTS) {
      await redis.del(otpKey);
      await redis.del(attemptsKey);

      throw new ApiError("Too many failed attempts. OTP blocked.", 429);
    }

    throw new ApiError(
      `Invalid OTP. ${MAX_ATTEMPTS - attempts} attempts left`,
      401,
    );
  }

  // ✅ Correct OTP → cleanup
  await redis.del(otpKey);
  await redis.del(attemptsKey);

  logger.info(`OTP verified for ${phone}`);

  return true;
};

// 🔄 Resend OTP (force new)
const resendOTP = async (phone) => {
  phone = normalizePhone(phone);

  const otpKey = `otp:${phone}`;
  const attemptsKey = `otp_attempts:${phone}`;

  // Remove old OTP + attempts
  await redis.del(otpKey);
  await redis.del(attemptsKey);

  return await createAndStoreOTP(phone);
};

export { generateOTP, createAndStoreOTP, verifyOTP, resendOTP };
