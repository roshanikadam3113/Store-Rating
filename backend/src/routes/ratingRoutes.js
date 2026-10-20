// backend/src/routes/ratingRoutes.js
// Rating routes for NexaPrime Store Rating Application

const express          = require("express");
const router           = express.Router();
const ratingController = require("../controllers/ratingController");
const { protect }      = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

/**
 * Mounted in app.js as: app.use("/api/ratings", ratingRoutes)
 *
 * GET  /api/ratings/my              — get the current user's submitted ratings
 * POST /api/ratings/:storeId        — submit or update a rating for a store
 *
 * Note: /my must be defined BEFORE /:storeId to prevent Express from
 *       treating "my" as a storeId parameter.
 */

// Any authenticated user can view their own ratings
router.get("/my",          protect, ratingController.getMyRatings);

// Only role "user" can submit/update ratings
// (Owners are not expected to rate stores in this challenge)
router.post("/:storeId",   protect, authorizeRoles("user"), ratingController.submitOrUpdateRating);

module.exports = router;
