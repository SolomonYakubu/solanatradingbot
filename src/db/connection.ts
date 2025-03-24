// db/connection.ts
import mongoose from "mongoose";
import config from "../config/config.js";
import logger from "../config/logger.js";

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoDbUri);
    logger.info("Database connected");
  } catch (error) {
    logger.error("Database connection error:", error);
    process.exit(1); // Exit process on fatal error
  }
}

export { connectDB };
