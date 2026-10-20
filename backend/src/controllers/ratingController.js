// backend/src/controllers/ratingController.js
// Rating API controller for NexaPrime Store Rating Application

const mongoose = require("mongoose");
const Rating   = require("../models/Rating");
const Store    = require("../models/Store");

// ─── POST /api/ratings/:storeId ───────────────────────────────────────────────

/**
 * Submit or update a rating for a store.
 * Protected — requires valid JWT with role "user".
 *
 * URL param: storeId
 * Body:      { rating: 1|2|3|4|5 }
 *
 * Uses findOneAndUpdate + upsert so:
 *   - First submission creates the rating document.
 *   - Subsequent submissions update the existing one.
 *   - No duplicate-key errors (compound index is handled by upsert logic).
 *
 * Security:
 *   - userId is always taken from req.user (the authenticated user) — never from the request body.
 *   - The storeId comes from the URL param, not from the body.
 */
const submitOrUpdateRating = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const userId      = req.user._id;

    // ── 1. Validate storeId ──────────────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ message: "Invalid store ID." });
    }

    // ── 2. Confirm store exists ──────────────────────────────────────────────
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    // ── 3. Validate rating value ─────────────────────────────────────────────
    const ratingValue = Number(req.body.rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Rating must be a whole number between 1 and 5." });
    }

    // ── 4. Upsert rating (create or update) ──────────────────────────────────
    const ratingDoc = await Rating.findOneAndUpdate(
      { userId, storeId },
      { rating: ratingValue },
      { new: true, upsert: true, runValidators: true, returnDocument: "after" }
    );

    const isNew = ratingDoc.createdAt.getTime() === ratingDoc.updatedAt.getTime();

    return res.status(200).json({
      message: isNew ? "Rating submitted successfully." : "Rating updated successfully.",
      rating:  {
        _id:      ratingDoc._id,
        userId:   ratingDoc.userId,
        storeId:  ratingDoc.storeId,
        rating:   ratingDoc.rating,
        createdAt: ratingDoc.createdAt,
        updatedAt: ratingDoc.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/ratings/my ─────────────────────────────────────────────────────

/**
 * Get all ratings submitted by the currently authenticated user.
 * Protected — requires valid JWT.
 *
 * Response:
 *   { ratings: [ { _id, storeId, rating, ... } ] }
 */
const getMyRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ userId: req.user._id })
      .populate("storeId", "name address")
      .lean()
      .sort({ updatedAt: -1 });

    return res.status(200).json({ ratings });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitOrUpdateRating, getMyRatings };
