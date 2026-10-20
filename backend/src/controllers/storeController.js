// backend/src/controllers/storeController.js
// Store API controller for NexaPrime Store Rating Application

const Store  = require("../models/Store");
const Rating = require("../models/Rating");

// ─── Helper: compute aggregated store data for a given userId ────────────────

/**
 * Builds the store response object enriched with:
 *  - averageRating : number (0 if no ratings yet)
 *  - totalRatings  : number
 *  - myRating      : number | null  (the requesting user's own rating, if any)
 *
 * @param {object[]} stores   Raw Mongoose store documents
 * @param {string}   userId   The authenticated user's _id (string)
 * @returns {Promise<object[]>}
 */
async function enrichStores(stores, userId) {
  const storeIds = stores.map((s) => s._id);

  // Aggregate: average rating + count per store
  const stats = await Rating.aggregate([
    { $match: { storeId: { $in: storeIds } } },
    {
      $group: {
        _id:           "$storeId",
        averageRating: { $avg: "$rating" },
        totalRatings:  { $sum: 1 },
      },
    },
  ]);

  // My ratings (only if userId provided)
  let myRatings = [];
  if (userId) {
    const mongoose = require("mongoose");
    myRatings = await Rating.find({
      storeId: { $in: storeIds },
      userId:  new mongoose.Types.ObjectId(userId),
    }).lean();
  }

  // Build lookup maps
  const statsMap    = {};
  const myRatingMap = {};
  stats.forEach((s) => {
    statsMap[s._id.toString()] = s;
  });
  myRatings.forEach((r) => {
    myRatingMap[r.storeId.toString()] = r.rating;
  });

  return stores.map((store) => {
    const sid  = store._id.toString();
    const stat = statsMap[sid];
    return {
      _id:           store._id,
      name:          store.name,
      address:       store.address,
      owner:         store.owner,
      averageRating: stat ? parseFloat(stat.averageRating.toFixed(1)) : 0,
      totalRatings:  stat ? stat.totalRatings : 0,
      myRating:      myRatingMap[sid] ?? null,
      createdAt:     store.createdAt,
      updatedAt:     store.updatedAt,
    };
  });
}

// ─── GET /api/stores ─────────────────────────────────────────────────────────

/**
 * Get all stores with optional name search.
 * Protected — requires valid JWT (any role).
 *
 * Query params:
 *   ?search=name_substring  (optional, case-insensitive)
 *
 * Response:
 *   { stores: [ { _id, name, address, averageRating, totalRatings, myRating } ] }
 */
const getStores = async (req, res, next) => {
  try {
    const { search } = req.query;

    const filter = {};
    if (search && search.trim()) {
      // Case-insensitive partial match on store name
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const stores = await Store.find(filter).lean().sort({ createdAt: -1 });

    const enriched = await enrichStores(stores, req.user._id.toString());

    return res.status(200).json({ stores: enriched });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/stores/:storeId ─────────────────────────────────────────────────

/**
 * Get a single store by ID with rating stats and the requesting user's rating.
 * Protected — requires valid JWT.
 */
const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.storeId).lean();
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    const [enriched] = await enrichStores([store], req.user._id.toString());
    return res.status(200).json({ store: enriched });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStores, getStoreById };
