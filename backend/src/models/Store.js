// backend/src/models/Store.js
// Stage 1: Store Mongoose schema for NexaPrime Store Rating Application

const mongoose = require("mongoose");

/**
 * StoreSchema
 *
 * Fields:
 *  - name    : required, trimmed string
 *  - address : required, max 400 characters
 *  - owner   : ObjectId ref → User (must be a "owner" role user)
 *
 * Application-level rules (enforced in controllers, not the model):
 *  - Only a User with role "owner" should be allowed to create a Store.
 *  - The owner field must reference a valid, existing User document.
 *    Mongoose does NOT validate foreign-key existence by default;
 *    your controller should verify the user exists and has role "owner"
 *    before saving.
 *
 * Timestamps: createdAt and updatedAt added automatically.
 */

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Store address is required"],
      trim: true,
      maxlength: [400, "Address must not exceed 400 characters"],
    },

    /**
     * owner references the User who owns this store.
     * Use .populate("owner") in queries to retrieve owner details.
     * The application must ensure the referenced user has role "owner".
     */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Store must have an owner"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
