// backend/src/middleware/authMiddleware.js
// JWT Authentication middleware for NexaPrime Store Rating Application

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — Authentication middleware
 *
 * Reads and verifies the Bearer token from the Authorization header.
 * Loads the current user from MongoDB and attaches it to req.user.
 *
 * req.user shape after this middleware runs:
 * {
 *   _id      : ObjectId   — MongoDB document ID
 *   id       : string     — string version of _id (convenience)
 *   name     : string
 *   email    : string
 *   address  : string
 *   role     : string     — "user" | "owner" (read from DB, not from token)
 *   createdAt: Date
 *   updatedAt: Date
 * }
 *
 * NOTE: password is excluded because User schema has select: false on that field.
 *
 * Why load from DB instead of trusting the JWT payload?
 *   - The JWT may live for up to 1 day. During that window:
 *       • The user's account could be deleted.
 *       • The user's role could change (e.g. user → owner or vice-versa).
 *   - Loading from DB on every request catches both cases immediately.
 *   - The role in req.user comes from the database — it is always current.
 *
 * Usage in routes:
 *   router.get("/me", protect, authController.getMe);
 */
const protect = async (req, res, next) => {
  try {
    // ── 1. Extract token from Authorization header ───────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided. Use Authorization: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      return res.status(401).json({ message: "Access denied. Token is empty." });
    }

    // ── 2. Verify signature and expiration ───────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      }
      // JsonWebTokenError, NotBeforeError, etc.
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }

    // ── 3. Load current user from DB (authoritative source for role/existence) ─
    const user = await User.findById(decoded.id).select("-password");
    // Note: User schema has select:false on password, but we are explicit here.
    // .select("-password") is a safety net in case the schema changes.

    if (!user) {
      // Account was deleted after the token was issued
      return res.status(401).json({
        message: "The account belonging to this token no longer exists.",
      });
    }

    // ── 4. Attach safe user object to request ────────────────────────────────
    req.user = user; // Full Mongoose document (minus password)

    next();
  } catch (err) {
    // Unexpected errors (DB down, etc.) — do not expose details
    console.error("authMiddleware error:", err.message);
    return res.status(500).json({ message: "Server error during authentication." });
  }
};

module.exports = { protect };
