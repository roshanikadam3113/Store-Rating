// backend/src/middleware/roleMiddleware.js
// Role-based authorization middleware for NexaPrime Store Rating Application

/**
 * authorizeRoles — Role Authorization Middleware Factory
 *
 * Returns an Express middleware that allows only users whose role
 * matches one of the specified allowed roles.
 *
 * MUST be used AFTER the `protect` middleware, which sets req.user.
 * req.user.role is always sourced from the database (see authMiddleware.js).
 * Client-supplied roles in req.body or query params are NEVER trusted.
 *
 * Usage examples in routes:
 *
 *   const { protect } = require("../middleware/authMiddleware");
 *   const { authorizeRoles } = require("../middleware/roleMiddleware");
 *
 *   // Only store owners can access this route
 *   router.post("/stores", protect, authorizeRoles("owner"), storeController.createStore);
 *
 *   // Both users and owners can access this route
 *   router.get("/stores", protect, authorizeRoles("user", "owner"), storeController.getStores);
 *
 * Responses:
 *   401 — if protect middleware was skipped (req.user missing)
 *   403 — if the authenticated user's role is not in the allowed list
 *
 * @param {...string} roles  — one or more allowed roles: "user", "owner"
 * @returns {Function} Express middleware
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Safety check — protect middleware must run first
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated. Use the protect middleware before authorizeRoles.",
      });
    }

    // req.user.role comes from the database — not from req.body or the JWT payload alone
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route requires role: [${roles.join(", ")}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
