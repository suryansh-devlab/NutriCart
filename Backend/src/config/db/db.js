import mongoose from "mongoose";
import logger from "../logger.js";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ DB Connection Error: ${error.message}`);
    process.exit(1); // stop server
  }
};

export default connectDb;
