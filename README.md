# secure-auth-express

<div align="center">

![npm version](https://img.shields.io/npm/v/secure-auth-express?style=for-the-badge)
![npm downloads](https://img.shields.io/npm/dm/secure-auth-express?style=for-the-badge)
![License](https://img.shields.io/npm/l/secure-auth-express?style=for-the-badge)
![Node.js Version](https://img.shields.io/node/v/secure-auth-express?style=for-the-badge)

**A production-ready, secure authentication package for Express.js**

*Plug-and-play login/register routes with JWT and bcrypt*

[Installation](#-installation) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [Advanced Usage](#-advanced-usage)
- [Security](#-security)
- [Error Handling](#-error-handling)
- [Examples](#-examples)
- [Troubleshooting](#-troubleshooting)
- [Requirements](#-requirements)
- [License](#-license)

---

## 🎯 Overview

`secure-auth-express` is a complete authentication solution for Express.js applications. It provides secure user registration, login, and protected route middleware using industry-standard practices:

- **JWT-based authentication** with configurable expiration
- **Bcrypt password hashing** with customizable salt rounds
- **Strong password validation** with comprehensive rules
- **Email uniqueness enforcement** to prevent duplicate accounts
- **Production-ready** error handling and validation

Perfect for rapid prototyping, MVPs, and production applications that need secure authentication without the complexity of building it from scratch.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Password Hashing** | Bcrypt with configurable salt rounds (default: 14) |
| 🎫 **JWT Authentication** | Stateless token-based authentication with configurable expiration |
| ✅ **Password Validation** | Enforces strong password requirements (8+ chars, uppercase, lowercase, number, special char) |
| 📧 **Email Validation** | Built-in email format validation and uniqueness checking |
| 🛡️ **Protected Routes** | Reusable middleware for protecting any Express route |
| 🚀 **Zero Configuration** | Works out of the box with minimal setup |
| 📦 **Mongoose Integration** | Includes pre-configured User model |
| 🔒 **Security First** | Passwords never exposed in responses, secure token verification |

---

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- MongoDB database (local or cloud)
- Express.js application

### Install the Package

```bash
npm install secure-auth-express
```

### Install Peer Dependencies

```bash
npm install express mongoose
```

---

## 🚀 Quick Start

### Step 1: Basic Setup

Create a new Express application or add to an existing one:

```javascript
import express from "express";
import mongoose from "mongoose";
import { createAuthRouter } from "secure-auth-express";

const app = express();
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myapp";
await mongoose.connect(MONGODB_URI);

// Create and mount auth router
const authRouter = createAuthRouter({
  secret: process.env.JWT_SECRET, // Required: Your JWT secret key
});

app.use("/api/auth", authRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

### Step 2: Environment Variables

Create a `.env` file in your project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/myapp

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# Server Port (optional)
PORT=3000
```

### Step 3: Test the Endpoints

Your authentication system is now ready! Test it with:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Get current user (protected route)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 API Reference

### `createAuthRouter(options)`

Creates an Express router with authentication routes.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `secret` | `string` | ✅ Yes | - | JWT secret key for signing tokens |
| `expiresIn` | `string` | ❌ No | `"24h"` | Token expiration time (e.g., "1h", "7d", "30d") |
| `bcryptRounds` | `number` | ❌ No | `14` | Bcrypt salt rounds (higher = more secure, slower) |

**Returns:** `express.Router` - Express router with authentication routes

**Example:**

```javascript
const authRouter = createAuthRouter({
  secret: process.env.JWT_SECRET,
  expiresIn: "7d",        // Tokens expire in 7 days
  bcryptRounds: 14,       // Bcrypt cost factor
});

app.use("/api/auth", authRouter);
```

### `authMiddleware(options)`

Express middleware for protecting routes with JWT authentication.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `secret` | `string` | ✅ Yes | JWT secret key (must match the one used in `createAuthRouter`) |

**Returns:** `Function` - Express middleware function

**Example:**

```javascript
import { authMiddleware } from "secure-auth-express";

app.get("/api/protected", 
  authMiddleware({ secret: process.env.JWT_SECRET }),
  (req, res) => {
    // req.user is available here
    res.json({ message: `Hello, ${req.user.email}!` });
  }
);
```

### `User`

Mongoose model for the User schema. Can be used for custom queries and operations.

**Example:**

```javascript
import { User } from "secure-auth-express";

// Find all users
const users = await User.find();

// Find user by email
const user = await User.findOne({ email: "john@example.com" });

// Custom query
const activeUsers = await User.find({ createdAt: { $gte: new Date("2024-01-01") } });
```

---

## 🔌 API Endpoints

### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `400` - Validation error (missing fields, weak password, duplicate email)
- `500` - Internal server error

---

### POST `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTcwNDE1MzYwMH0.abc123...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `400` - Missing email or password
- `401` - Invalid email or password
- `500` - Internal server error

---

### GET `/api/auth/me`

Get current authenticated user's information (protected route).

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `401` - Missing or invalid token
- `404` - User not found
- `500` - Internal server error

---

## ⚙️ Configuration

### Password Requirements

Passwords must meet all of the following criteria:

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*()_+-=[]{}|;':",./<>?)

**Example Valid Passwords:**
- `SecurePass123!`
- `MyP@ssw0rd`
- `Test1234#`

**Example Invalid Passwords:**
- `password` (no uppercase, number, or special char)
- `PASSWORD123` (no lowercase or special char)
- `Pass123` (too short, no special char)

### JWT Token Expiration

Configure token expiration using the `expiresIn` option:

```javascript
// Tokens expire in 1 hour
createAuthRouter({ secret: "...", expiresIn: "1h" });

// Tokens expire in 7 days
createAuthRouter({ secret: "...", expiresIn: "7d" });

// Tokens expire in 30 days
createAuthRouter({ secret: "...", expiresIn: "30d" });

// Tokens expire in 2 hours
createAuthRouter({ secret: "...", expiresIn: "2h" });
```

**Supported formats:** `s` (seconds), `m` (minutes), `h` (hours), `d` (days)

### Bcrypt Rounds

Adjust the bcrypt cost factor for password hashing:

```javascript
// Higher security, slower hashing (recommended for production)
createAuthRouter({ secret: "...", bcryptRounds: 14 });

// Lower security, faster hashing (for development)
createAuthRouter({ secret: "...", bcryptRounds: 10 });
```

**Recommendations:**
- **Development:** 10-12 rounds
- **Production:** 14-16 rounds
- **High Security:** 16+ rounds

---

## 🔧 Advanced Usage

### Protecting Custom Routes

Use the `authMiddleware` to protect any Express route:

```javascript
import express from "express";
import { authMiddleware } from "secure-auth-express";

const app = express();

// Protect a single route
app.get("/api/profile", 
  authMiddleware({ secret: process.env.JWT_SECRET }),
  (req, res) => {
    // Access authenticated user info
    res.json({
      userId: req.user.id,
      email: req.user.email,
    });
  }
);

// Protect multiple routes
const protectedRoutes = express.Router();
protectedRoutes.use(authMiddleware({ secret: process.env.JWT_SECRET }));

protectedRoutes.get("/dashboard", (req, res) => {
  res.json({ message: "Dashboard data" });
});

protectedRoutes.post("/settings", (req, res) => {
  res.json({ message: "Settings updated" });
});

app.use("/api", protectedRoutes);
```

### Custom User Queries

Use the `User` model for custom database operations:

```javascript
import { User } from "secure-auth-express";

// Find user by ID
const user = await User.findById(userId);

// Find users created in the last 30 days
const recentUsers = await User.find({
  createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
});

// Update user
await User.findByIdAndUpdate(userId, { name: "New Name" });

// Delete user
await User.findByIdAndDelete(userId);
```

### Custom Route Integration

Combine auth routes with your custom routes:

```javascript
import { createAuthRouter, authMiddleware } from "secure-auth-express";

const app = express();

// Auth routes
const authRouter = createAuthRouter({ secret: process.env.JWT_SECRET });
app.use("/api/auth", authRouter);

// Custom protected routes
app.get("/api/posts", 
  authMiddleware({ secret: process.env.JWT_SECRET }),
  async (req, res) => {
    // Get posts for authenticated user
    const posts = await Post.find({ userId: req.user.id });
    res.json({ posts });
  }
);
```

---

## 🔒 Security

### Security Features

This package implements industry-standard security practices:

1. **Password Hashing**
   - Uses bcrypt with configurable salt rounds
   - Passwords are never stored in plain text
   - Passwords are never returned in API responses

2. **JWT Security**
   - Tokens are signed with HMAC SHA-256
   - Configurable expiration times
   - Secure token verification in middleware

3. **Input Validation**
   - Email format validation
   - Strong password requirements
   - Email uniqueness enforcement
   - Request body validation

4. **Error Handling**
   - Generic error messages to prevent information leakage
   - Proper HTTP status codes
   - No sensitive data in error responses

### Security Best Practices

1. **JWT Secret:**
   ```env
   # Use a strong, random secret (minimum 32 characters)
   JWT_SECRET=your_super_secret_jwt_key_use_random_string_here
   ```

2. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use different secrets for development and production
   - Rotate secrets periodically

3. **HTTPS:**
   - Always use HTTPS in production
   - Never send tokens over unencrypted connections

4. **Token Storage:**
   - Store tokens securely (httpOnly cookies or secure storage)
   - Implement token refresh mechanism for long-lived sessions

---

## 🚨 Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| `400` | Bad Request | Missing required fields, validation errors, duplicate email |
| `401` | Unauthorized | Invalid credentials, missing/invalid/expired token |
| `404` | Not Found | User not found |
| `500` | Internal Server Error | Database errors, unexpected server errors |

### Error Examples

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Password must contain at least one uppercase letter"
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Token Error (401):**
```json
{
  "success": false,
  "message": "Token has expired"
}
```

---

## 💡 Examples

### Complete Express Application

```javascript
import express from "express";
import mongoose from "mongoose";
import { createAuthRouter, authMiddleware } from "secure-auth-express";

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Authentication routes
const authRouter = createAuthRouter({
  secret: process.env.JWT_SECRET,
  expiresIn: "7d",
  bcryptRounds: 14,
});
app.use("/api/auth", authRouter);

// Protected route example
app.get("/api/protected", 
  authMiddleware({ secret: process.env.JWT_SECRET }),
  (req, res) => {
    res.json({
      message: "This is a protected route",
      user: req.user,
    });
  }
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Using with TypeScript

```typescript
import express, { Request, Response } from "express";
import { createAuthRouter, authMiddleware } from "secure-auth-express";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

const app = express();
app.use(express.json());

const authRouter = createAuthRouter({
  secret: process.env.JWT_SECRET!,
});

app.use("/api/auth", authRouter);

app.get("/api/protected", 
  authMiddleware({ secret: process.env.JWT_SECRET! }),
  (req: Request, res: Response) => {
    if (req.user) {
      res.json({ user: req.user });
    }
  }
);
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "JWT secret is required" Error

**Problem:** Missing or undefined JWT secret.

**Solution:**
```javascript
// Make sure JWT_SECRET is set in environment variables
const authRouter = createAuthRouter({
  secret: process.env.JWT_SECRET, // Must be defined
});
```

#### 2. MongoDB Connection Errors

**Problem:** Cannot connect to MongoDB.

**Solution:**
- Verify MongoDB is running
- Check connection string format
- Ensure network access is allowed

```javascript
// Correct connection string format
const MONGODB_URI = "mongodb://localhost:27017/myapp";
// or for MongoDB Atlas
const MONGODB_URI = "mongodb+srv://user:password@cluster.mongodb.net/myapp";
```

#### 3. "Invalid token" Error

**Problem:** Token verification fails.

**Solution:**
- Ensure the same `secret` is used for both `createAuthRouter` and `authMiddleware`
- Check token expiration
- Verify token is sent in correct format: `Bearer <token>`

#### 4. Password Validation Fails

**Problem:** Registration fails with password validation error.

**Solution:**
- Ensure password meets all requirements (8+ chars, uppercase, lowercase, number, special char)
- Check password is not empty or null

#### 5. "Email already exists" Error

**Problem:** Trying to register with an existing email.

**Solution:**
- Use a different email address
- Check if user already exists in database
- Use login endpoint instead of register

---

## 📋 Requirements

- **Node.js:** >= 18.0.0
- **Express:** ^4.18.2
- **Mongoose:** ^8.0.3
- **MongoDB:** Any version supported by Mongoose

---

## 📄 License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

- **Documentation:** See [example/](example/) directory for complete examples
- **Issues:** [GitHub Issues](https://github.com/MotipalliTharun/Secure_Login_Portal/issues)
- **Repository:** [GitHub](https://github.com/MotipalliTharun/Secure_Login_Portal)

---

<div align="center">

**Made with ❤️ for the Express.js community**

[⬆ Back to Top](#secure-auth-express)

</div>
