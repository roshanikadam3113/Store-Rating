// backend/src/controllers/ownerController.js
// Owner dashboard controller for NexaPrime Store Rating Application

const Store  = require("../models/Store");
const Rating = require("../models/Rating");

// ─── GET /api/owner/dashboard ─────────────────────────────────────────────────

/**
 * Returns the authenticated store owner's store info plus all ratings with
 * the name and email of each user who submitted them.
 *
 * Protected — requires valid JWT with role "owner".
 * The owner's identity is always taken from req.user — never from the request.
 *
 * Response shape:
 * {
 *   store: {
 *     _id, name, address, averageRating, totalRatings, createdAt, updatedAt
 *   },
 *   ratings: [
 *     { _id, rating, createdAt, updatedAt, user: { _id, name, email } }
 *   ]
 * }
 *
 * If the owner has no assigned store, returns a clean empty state (not an error).
 */
const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // ── 1. Find the store owned by this user ─────────────────────────────────
    const store = await Store.findOne({ owner: ownerId }).lean();

    if (!store) {
      return res.status(200).json({
        store:   null,
        ratings: [],
        message: "You have no store assigned yet. Please contact the administrator.",
      });
    }

    // ── 2. Get all ratings for this store with user details ──────────────────
    const ratings = await Rating.find({ storeId: store._id })
      .populate("userId", "name email")   // Populate user's name and email only
      .lean()
      .sort({ updatedAt: -1 });

    // ── 3. Compute average rating ────────────────────────────────────────────
    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? parseFloat(
            (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
          )
        : 0;

    // ── 4. Build clean response (never expose userId document internals) ─────
    const safeRatings = ratings.map((r) => ({
      _id:       r._id,
      rating:    r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.userId
        ? { _id: r.userId._id, name: r.userId.name, email: r.userId.email }
        : null,
    }));

    return res.status(200).json({
      store: {
        _id:           store._id,
        name:          store.name,
        address:       store.address,
        averageRating,
        totalRatings,
        createdAt:     store.createdAt,
        updatedAt:     store.updatedAt,
      },
      ratings: safeRatings,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOwnerDashboard };
