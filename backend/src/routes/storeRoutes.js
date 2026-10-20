// backend/src/routes/storeRoutes.js
// Store routes for NexaPrime Store Rating Application

const express         = require("express");
const router          = express.Router();
const storeController = require("../controllers/storeController");
const { protect }     = require("../middleware/authMiddleware");

/**
 * All store routes require authentication (any role).
 *
 * Mounted in app.js as: app.use("/api/stores", storeRoutes)
 *
 * GET  /api/stores              — list all stores (with optional ?search=)
 * GET  /api/stores/:storeId     — get single store with rating stats
 */
router.get("/",          protect, storeController.getStores);
router.get("/:storeId",  protect, storeController.getStoreById);

module.exports = router;
