import jwt from "jsonwebtoken";

/**
 * Authentication middleware to protect routes
 * @param {Object} options - Configuration options
 * @param {string} options.secret - JWT secret key
 * @returns {Function} Express middleware function
 */
export const authMiddleware = (options = {}) => {
  const { secret } = options;

  if (!secret) {
    throw new Error("JWT secret is required for authMiddleware");
  }

  return async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Authorization header is required",
        });
      }

      // Check if header starts with "Bearer "
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
          success: false,
          message: "Invalid authorization header format. Use: Bearer <token>",
        });
      }

      const token = parts[1];

      // Verify token
      const decoded = jwt.verify(token, secret);

      // Attach user info to request object
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }
  };
};

