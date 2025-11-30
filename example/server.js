import express from "express";
import mongoose from "mongoose";
import { createAuthRouter } from "../src/index.js";

// Load environment variables (optional - install dotenv: npm install dotenv)
// Uncomment the following lines if you have dotenv installed:
// import dotenv from "dotenv";
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/secure_auth_db";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is required");
  process.exit(1);
}

// Create and use auth router
const authRouter = createAuthRouter({
  secret: JWT_SECRET,
  expiresIn: "24h", // Optional: default is "24h"
  bcryptRounds: 14, // Optional: default is 14
});

app.use("/api/auth", authRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me (protected)`);
});

