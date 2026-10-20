// backend/src/routes/ownerRoutes.js
// Owner dashboard routes for NexaPrime Store Rating Application

const express          = require("express");
const router           = express.Router();
const ownerController  = require("../controllers/ownerController");
const { protect }      = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

/**
 * Mounted in app.js as: app.use("/api/owner", ownerRoutes)
 *
 * GET /api/owner/dashboard  — owner's store info + all ratings + user details
 *
 * Protected: must be authenticated AND have role "owner".
 */
router.get("/dashboard", protect, authorizeRoles("owner"), ownerController.getOwnerDashboard);

module.exports = router;
