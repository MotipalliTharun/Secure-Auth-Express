# @tharun/secure-auth-express

A reusable, secure authentication package for Express.js that provides plug-and-play login/register routes using JWT and bcrypt.

## Features

- 🔐 Secure password hashing with bcrypt (configurable rounds)
- 🎫 JWT token-based authentication
- ✅ Strong password validation
- 📧 Email uniqueness validation
- 🛡️ Protected route middleware
- 🚀 Ready to use Express router
- 📦 Zero configuration required (just pass JWT secret)

## Installation

```bash
npm install @tharun/secure-auth-express
```

## Quick Start

### 1. Install Dependencies

```bash
npm install express mongoose @tharun/secure-auth-express
```

### 2. Basic Usage

```javascript
import express from "express";
import mongoose from "mongoose";
import { createAuthRouter } from "@tharun/secure-auth-express";

const app = express();
app.use(express.json());

// Connect to MongoDB
await mongoose.connect("mongodb://localhost:27017/your_db");

// Create auth router (JWT_SECRET is required)
const authRouter = createAuthRouter({
  secret: process.env.JWT_SECRET, // Required
  expiresIn: "24h",              // Optional (default: "24h")
  bcryptRounds: 14,               // Optional (default: 14)
});

// Use the router
app.use("/api/auth", authRouter);

app.listen(3000);
```

### 3. Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/your_db
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
PORT=3000
```

## API Endpoints

### POST `/api/auth/register`

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST `/api/auth/login`

Login user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET `/api/auth/me`

Get current authenticated user (protected route).

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Advanced Usage

### Using the Middleware Separately

You can use the `authMiddleware` to protect your own routes:

```javascript
import { authMiddleware } from "@tharun/secure-auth-express";

// Protect a custom route
app.get("/api/protected", authMiddleware({ secret: process.env.JWT_SECRET }), (req, res) => {
  // Access user info from req.user
  res.json({
    message: `Hello, ${req.user.email}!`,
    userId: req.user.id,
  });
});
```

### Using the User Model

```javascript
import { User } from "@tharun/secure-auth-express";

// Find users
const users = await User.find();

// Create custom user
const user = await User.create({
  name: "Jane Doe",
  email: "jane@example.com",
  password: "hashedPassword", // Make sure to hash it!
});
```

## Password Requirements

Passwords must meet the following criteria:
- At least 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Configuration Options

### `createAuthRouter(options)`

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `secret` | string | Yes | - | JWT secret key |
| `expiresIn` | string | No | `"24h"` | Token expiration time |
| `bcryptRounds` | number | No | `14` | Bcrypt salt rounds |

## Exports

```javascript
import {
  createAuthRouter,  // Main router factory
  authMiddleware,    // Authentication middleware
  User,              // Mongoose User model
} from "@tharun/secure-auth-express";
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common status codes:
- `400` - Bad Request (validation errors, duplicate email)
- `401` - Unauthorized (invalid credentials, missing/invalid token)
- `404` - Not Found (user not found)
- `500` - Internal Server Error

## Security Features

- ✅ Passwords are hashed using bcrypt (default: 14 rounds)
- ✅ JWT tokens with configurable expiration
- ✅ Password never returned in responses
- ✅ Email validation and uniqueness check
- ✅ Strong password requirements
- ✅ Secure token verification in middleware

## Requirements

- Node.js >= 18.0.0
- Express.js
- MongoDB (via Mongoose)
- JWT_SECRET environment variable

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Example

See the `example/` directory for a complete working example.

