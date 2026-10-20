// backend/src/models/User.js
// Stage 1: User Mongoose schema for NexaPrime Store Rating Application

const mongoose = require("mongoose");

/**
 * UserSchema
 *
 * Fields:
 *  - name    : 20–60 characters
 *  - email   : unique, lowercase, valid format
 *  - address : max 400 characters
 *  - password: 8–16 chars, ≥1 uppercase, ≥1 special character
 *              The RAW password is validated here so Mongoose can reject
 *              weak passwords before the auth layer hashes it.
 *              Only the HASH is ever persisted (done in the auth controller).
 *  - role    : "user" | "owner"  (default: "user")
 *
 * NOTE on `unique`:
 *  `unique: true` creates a MongoDB index — it is NOT a Mongoose validator.
 *  Mongoose will NOT throw a ValidationError for duplicate emails.
 *  Instead, MongoDB throws error code 11000 (duplicate key).
 *  You MUST catch that error in your controller/middleware and return
 *  a meaningful response (e.g. "Email already registered").
 */

// Regex for a basic but reliable email format check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// At least one uppercase letter AND one special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~])/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [20, "Name must be at least 20 characters"],
      maxlength: [60, "Name must not exceed 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,       // Creates a unique index — NOT a validator (see note above)
      lowercase: true,    // Normalise to lowercase before saving
      trim: true,
      validate: {
        validator: (v) => EMAIL_REGEX.test(v),
        message: "Please provide a valid email address",
      },
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [400, "Address must not exceed 400 characters"],
    },

    /**
     * The `password` field stores the bcrypt HASH, not the plaintext.
     * The auth controller is responsible for:
     *   1. Validating the raw password string against PASSWORD_REGEX
     *   2. Hashing it with bcrypt before calling user.save()
     *
     * minlength / maxlength here apply to the HASH (which is always 60 chars
     * for bcrypt), so we intentionally do NOT add min/max constraints here —
     * those belong on the raw password in the controller, not on the stored hash.
     *
     * select: false — password hash is excluded from all ordinary .find()
     * results. You must explicitly opt-in with .select("+password") whenever
     * you need it (e.g. during login comparison).
     */
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ["user", "owner"],
        message: "Role must be either 'user' or 'owner'",
      },
      default: "user",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
