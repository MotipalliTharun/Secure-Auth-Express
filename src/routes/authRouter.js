import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { isValid: true };
};

/**
 * Creates an Express router with authentication routes
 * @param {Object} options - Configuration options
 * @param {string} options.secret - JWT secret key (required)
 * @param {number} options.expiresIn - Token expiration time (default: "24h")
 * @param {number} options.bcryptRounds - Bcrypt salt rounds (default: 14)
 * @returns {express.Router} Express router with auth routes
 */
export const createAuthRouter = (options = {}) => {
  const { secret, expiresIn = "24h", bcryptRounds = 14 } = options;

  if (!secret) {
    throw new Error("JWT secret is required for createAuthRouter");
  }

  const router = express.Router();

  /**
   * POST /register
   * Register a new user
   */
  router.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message,
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, bcryptRounds);

      // Create user
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      });

      // Return user without password
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userResponse,
        },
      });
    } catch (error) {
      // Handle duplicate key error (MongoDB)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Handle validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(", "),
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  /**
   * POST /login
   * Login user and return JWT token
   */
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Find user and include password field
      const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        secret,
        {
          expiresIn,
        }
      );

      // Return token and user info
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: userResponse,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  /**
   * GET /me
   * Get current authenticated user (protected route)
   */
  router.get("/me", authMiddleware({ secret }), async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.json({
        success: true,
        message: "User retrieved successfully",
        data: {
          user: userResponse,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  return router;
};

