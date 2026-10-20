// backend/src/models/Rating.js
// Stage 1: Rating Mongoose schema for NexaPrime Store Rating Application

const mongoose = require("mongoose");

/**
 * RatingSchema
 *
 * Fields:
 *  - userId  : ObjectId ref → User  (the user who submitted the rating)
 *  - storeId : ObjectId ref → Store (the store being rated)
 *  - rating  : Integer 1–5
 *
 * Compound Unique Index: { userId: 1, storeId: 1 }
 *  This index enforces that each user can have AT MOST ONE rating document
 *  per store. Attempting to insert a second rating for the same
 *  (userId, storeId) pair will throw MongoDB error code 11000.
 *
 * How to handle duplicates in the future Rating controller:
 *  Use findOneAndUpdate() with upsert:true rather than create():
 *
 *    const rating = await Rating.findOneAndUpdate(
 *      { userId: req.user.id, storeId: req.params.storeId },
 *      { rating: req.body.rating },
 *      { new: true, upsert: true, runValidators: true }
 *    );
 *
 *  This pattern creates the document on first submission and updates it
 *  on subsequent submissions — no duplicate-key errors, no extra logic needed.
 *
 *  If you still use create() / save(), catch error code 11000:
 *    if (err.code === 11000) {
 *      return res.status(409).json({ message: "Rating already submitted. Use PUT to update." });
 *    }
 *
 * Timestamps: createdAt and updatedAt added automatically.
 */

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "storeId is required"],
    },

    /**
     * rating must be an integer between 1 and 5 (inclusive).
     * validate.validator rejects non-integer values (e.g. 3.5).
     */
    rating: {
      type: Number,
      required: [true, "Rating value is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must not exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number (1–5)",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Compound unique index — prevents duplicate (user, store) rating documents.
 * MongoDB creates this index in the background the first time the app connects.
 * NOTE: Like the email unique index on User, this is a MongoDB index, not a
 * Mongoose validator. Handle error code 11000 in the controller (see above).
 */
ratingSchema.index({ userId: 1, storeId: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
