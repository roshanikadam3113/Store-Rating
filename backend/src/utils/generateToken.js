// backend/src/utils/generateToken.js
// JWT token generation utility for NexaPrime Store Rating Application

const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for an authenticated user.
 *
 * Payload contains:
 *   - id   : MongoDB ObjectId (string) — used by authMiddleware to load the user
 *   - role : "user" | "owner"          — cached for quick reference
 *
 * Why we still load the user from the DB in authMiddleware:
 *   The role is embedded in the token for convenience, but the middleware
 *   loads the full user document from MongoDB on every request. This means:
 *     - If a user account is deleted, the next request is rejected immediately.
 *     - If a role changes (owner promoted/demoted), the DB record is authoritative.
 *   Trusting ONLY the JWT role would let revoked or changed accounts keep working
 *   until the token expires.
 *
 * Security:
 *   - The secret is read from process.env.JWT_SECRET — never hardcoded.
 *   - If JWT_SECRET is missing at startup, the function throws so the server
 *     cannot run without a secret.
 *   - Tokens expire after 1 day (configurable via JWT_EXPIRES_IN env var).
 *
 * Usage (in authController.js):
 *   const generateToken = require("../utils/generateToken");
 *   const token = generateToken(user._id, user.role);
 *
 * @param {import("mongoose").Types.ObjectId} userId  - MongoDB _id of the user
 * @param {string} role                               - "user" | "owner"
 * @returns {string} signed JWT string
 */
function generateToken(userId, role) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined in environment variables. " +
      "Set it in your .env file before starting the server."
    );
  }

  const payload = {
    id:   userId.toString(), // Always a string for consistent handling
    role,
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d", // Default: 1 day
  };

  return jwt.sign(payload, secret, options);
}

module.exports = generateToken;
