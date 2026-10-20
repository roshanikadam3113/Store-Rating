// backend/src/config/db.js
// MongoDB Atlas connection for NexaPrime Store Rating Application

const mongoose = require("mongoose");

/**
 * connectDB — establishes a Mongoose connection to MongoDB Atlas.
 *
 * Reads the URI from process.env.MONGO_URI (set in backend/.env).
 * Called once in server.js before starting the Express HTTP server.
 *
 * Mongoose 6+ uses the new connection defaults internally,
 * so no extra options object is required.
 *
 * On failure the process exits with code 1 so the deployment system
 * knows the service failed to start.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌  MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
