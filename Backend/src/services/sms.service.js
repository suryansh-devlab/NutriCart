import axios from "axios";
import logger from "../config/logger.js";

// 📞 Normalize phone (India default)
const formatPhone = (phone) => {
  phone = phone.toString().trim().replace(/\D/g, "");

  if (!phone.startsWith("91")) {
    phone = "91" + phone;
  }

  return `+${phone}`;
};

// 📤 Send SMS (core function)
const sendSMS = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const formattedPhone = formatPhone(to);

  // 🔧 DEV MODE
  if (!accountSid || !authToken || !from) {
    logger.warn(`[SMS - DEV MODE] To: ${formattedPhone} | Message: ${body}`);
    return { sid: "dev-mode", status: "simulated" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const data = new URLSearchParams({
      From: from,
      To: formattedPhone,
      Body: body,
    });

    const response = await axios.post(url, data, {
      auth: {
        username: accountSid,
        password: authToken,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    logger.info(`✅ SMS sent to ${formattedPhone}, SID: ${response.data.sid}`);

    return response.data;
  } catch (error) {
    logger.error(
      `❌ SMS failed: ${error.response?.data?.message || error.message}`,
    );

    throw new Error("SMS sending failed");
  }
};

// 🔐 OTP SMS (NEW)
const sendOTPMessage = async (phone, otp) => {
  return sendSMS(
    phone,
    `🔐 NutriCart OTP: ${otp}\nValid for 5 minutes. Do not share.`,
  );
};

// 📦 Order confirmation
const sendOrderConfirmation = async (phone, orderNumber, totalAmount) => {
  return sendSMS(
    phone,
    `✅ NutriCart: Order #${orderNumber} confirmed! Amount: ₹${totalAmount}.`,
  );
};

// 🚚 Order status update
const sendOrderStatusUpdate = async (phone, orderNumber, status) => {
  const statusMessages = {
    processing: `🔄 Order #${orderNumber} is being processed.`,
    shipped: `🚚 Order #${orderNumber} has been shipped.`,
    delivered: `🎉 Order #${orderNumber} has been delivered.`,
    cancelled: `❌ Order #${orderNumber} has been cancelled.`,
  };

  return sendSMS(phone, statusMessages[status] || `Order updated: ${status}`);
};

export {
  sendSMS,
  sendOTPMessage,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
};
