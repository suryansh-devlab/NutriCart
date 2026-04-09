import jwt from "jsonwebtoken";
import asyncHandler from "../handler/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Consumer from "../models/user/user.model.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ✅ Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // ❌ No token
  if (!token) {
    throw new ApiError("Not authorized, token missing", 401);
  }

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Get user from DB (exclude sensitive fields)
    const user = await Consumer.findById(decoded.id).select("-__v");

    if (!user) {
      throw new ApiError("User not found", 401);
    }

    // ✅ Attach to request
    req.user = user;

    next();
  } catch (error) {
    throw new ApiError("Not authorized, invalid token", 401);
  }
});

export default protect;
