// backend/src/app.js
// Express application setup for NexaPrime Store Rating Application

const express      = require("express");
const cors         = require("cors");
const authRoutes   = require("./routes/authRoutes");
const storeRoutes  = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const ownerRoutes  = require("./routes/ownerRoutes");
const { notFound, globalErrorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// CORS — allow requests from the React frontend (dev + production)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Quick check that the server is alive.
 * Useful for Postman smoke tests and deployment health probes.
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status:  "ok",
    message: "NexaPrime Store Rating API is running",
    time:    new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

// Authentication routes: /api/auth/register, /api/auth/login, /api/auth/me
app.use("/api/auth", authRoutes);

// Stage 3 API routes
app.use("/api/stores",  storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/owner",   ownerRoutes);

// ─── Error Handling (must be AFTER all routes) ────────────────────────────────

// 404 — route not found
app.use(notFound);

// Global error handler — catches all errors forwarded with next(err)
app.use(globalErrorHandler);

module.exports = app;
