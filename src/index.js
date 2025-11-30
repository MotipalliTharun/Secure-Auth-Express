/**
 * secure-auth-express
 * 
 * A reusable secure authentication package for Express.js
 * Provides login/register routes with JWT and bcrypt
 */

export { createAuthRouter } from "./routes/authRouter.js";
export { authMiddleware } from "./middleware/authMiddleware.js";
export { User } from "./models/User.js";

