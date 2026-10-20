// backend/src/middleware/errorMiddleware.js
// Centralized error handling for NexaPrime Store Rating Application

/**
 * notFound — 404 handler
 * Catches requests that did not match any route and passes a structured
 * 404 error to the next error handler.
 *
 * Mount AFTER all valid routes in app.js.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * globalErrorHandler — Centralized error middleware
 * Catches all errors forwarded with next(err) from anywhere in the app.
 * Never exposes stack traces or internal details to clients.
 *
 * Mount as the LAST middleware in app.js (must have 4 parameters).
 *
 * Handled error codes:
 *   11000 — MongoDB duplicate key (e.g. duplicate email)
 *   CastError — Invalid MongoDB ObjectId in params
 *   ValidationError — Mongoose schema validation failure
 *
 * @param {Error} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const globalErrorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log full error server-side for debugging (never sent to client)
  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);

  // Default status: use err.statusCode if set, else fall back to 500
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message    || "Internal Server Error";

  // ── Mongoose duplicate key error (email unique index) ────────────────────
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered.`;
  }

  // ── Mongoose CastError (invalid ObjectId) ────────────────────────────────
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // ── Mongoose ValidationError ──────────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Collect all validation messages into one string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  }

  // ── JWT errors (should normally be caught in authMiddleware, safety net) ──
  if (err.name === "JsonWebTokenError")  { statusCode = 401; message = "Invalid token."; }
  if (err.name === "TokenExpiredError")  { statusCode = 401; message = "Token has expired."; }

  res.status(statusCode).json({
    message,
    // Only include stack trace in development, never in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, globalErrorHandler };
