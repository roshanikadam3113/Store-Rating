// backend/src/routes/authRoutes.js
// Authentication routes for NexaPrime Store Rating Application

const express        = require("express");
const router         = express.Router();
const authController = require("../controllers/authController");
const { protect }    = require("../middleware/authMiddleware");

/**
 * Routes are kept thin — all logic lives in authController.js.
 *
 * Mounted in app.js as:
 *   app.use("/api/auth", authRoutes);
 *
 * Full paths:
 *   POST /api/auth/register   — public
 *   POST /api/auth/login      — public
 *   GET  /api/auth/me         — requires valid JWT (protect middleware)
 */

// Public routes
router.post("/register", authController.register);
router.post("/login",    authController.login);

// Protected routes — protect middleware runs before the controller
router.get("/me", protect, authController.getMe);

module.exports = router;
