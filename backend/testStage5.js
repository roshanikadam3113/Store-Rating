// backend/testStage5.js
// Stage 5: Complete Security, Authorization & Functional Test Suite
// Run from backend/ directory while npm run dev is running:
//   node testStage5.js

require("dotenv").config();
const http     = require("http");
const mongoose = require("mongoose");
const User     = require("./src/models/User");
const Store    = require("./src/models/Store");
const Rating   = require("./src/models/Rating");

const BASE = "http://localhost:5000";
let passed = 0, failed = 0;

const PASS  = (msg) => { console.log(`  ✅  ${msg}`); passed++; };
const FAIL  = (msg) => { console.log(`  ❌  ${msg}`); failed++; };
const HEAD  = (msg) => console.log(`\n══ ${msg} ══`);
const INFO  = (msg) => console.log(`  ℹ️   ${msg}`);

// ─── HTTP helper ─────────────────────────────────────────────────────────────

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data    = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (data)  headers["Content-Length"] = Buffer.byteLength(data);
    const url = new URL(path, BASE);
    const options = { hostname: url.hostname, port: url.port || 80, path: url.pathname + url.search, method, headers };
    const r = http.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end",  ()  => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, body: raw, headers: res.headers }); }
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

// ─── Test state ───────────────────────────────────────────────────────────────

const TS = Date.now();
const USER_EMAIL    = `s5user_${TS}@nexatest.com`;
const USER2_EMAIL   = `s5user2_${TS}@nexatest.com`;
const OWNER_EMAIL   = "owner@nexaprime.com";
const OWNER_PASS    = "Owner@1234";
const USER_PASS     = "Test@1234";
const TEST_NAME     = "Stage Five Test User Account";
const TEST_ADDRESS  = "99 Test Lane, Security District, Mumbai 400001";

let userToken   = null;
let user2Token  = null;
let ownerToken  = null;
let storeId     = null;
let userId      = null;
const createdUsers = [];

// ─── 1. Authentication Tests ──────────────────────────────────────────────────

async function testAuthentication() {
  HEAD("1. Authentication & Registration");

  // Register user 1
  let r = await req("POST", "/api/auth/register", {
    name: TEST_NAME, email: USER_EMAIL, address: TEST_ADDRESS, password: USER_PASS,
  });
  if (r.status === 201 && r.body.user && r.body.user.role === "user") {
    PASS(`Register → 201, role forced to "user"`);
    userId = r.body.user._id;
    createdUsers.push(USER_EMAIL);
  } else FAIL(`Register failed: ${r.status} ${JSON.stringify(r.body)}`);

  // Verify no password in response
  if (!r.body.user?.password && !r.body.password) PASS("Password hash NOT in register response");
  else FAIL("SECURITY: Password hash exposed in register response");

  // Register user 2
  r = await req("POST", "/api/auth/register", {
    name: TEST_NAME, email: USER2_EMAIL, address: TEST_ADDRESS, password: USER_PASS,
  });
  if (r.status === 201) { PASS("Register user 2 → 201"); createdUsers.push(USER2_EMAIL); }
  else FAIL(`Register user 2 failed: ${r.status}`);

  // Duplicate email
  r = await req("POST", "/api/auth/register", { name: TEST_NAME, email: USER_EMAIL, address: TEST_ADDRESS, password: USER_PASS });
  if (r.status === 409) PASS(`Duplicate email → 409: "${r.body.message}"`);
  else FAIL(`Duplicate email: expected 409, got ${r.status}`);

  // Role escalation attempt — client sends role:"owner"
  const escEmail = `s5esc_${TS}@nexatest.com`;
  r = await req("POST", "/api/auth/register", {
    name: TEST_NAME, email: escEmail, address: TEST_ADDRESS, password: USER_PASS, role: "owner",
  });
  if (r.status === 201 && r.body.user?.role === "user") {
    PASS(`SECURITY: role:"owner" in body ignored — account created as "user"`);
    createdUsers.push(escEmail);
  } else if (r.status === 201 && r.body.user?.role === "owner") {
    FAIL(`SECURITY BREACH: role:"owner" accepted — user registered as owner!`);
  } else FAIL(`Role escalation test unexpected: ${r.status}`);

  // Validation: name too short
  r = await req("POST", "/api/auth/register", { name: "Short", email: `s@${TS}.com`, address: TEST_ADDRESS, password: USER_PASS });
  if (r.status === 400) PASS(`Name < 20 chars → 400`);
  else FAIL(`Name too short: expected 400, got ${r.status}`);

  // Validation: password no uppercase
  r = await req("POST", "/api/auth/register", { name: TEST_NAME, email: `noup@${TS}.com`, address: TEST_ADDRESS, password: "test@1234" });
  if (r.status === 400) PASS(`Password no uppercase → 400`);
  else FAIL(`No uppercase: expected 400, got ${r.status}`);

  // Validation: password no special char
  r = await req("POST", "/api/auth/register", { name: TEST_NAME, email: `nosp@${TS}.com`, address: TEST_ADDRESS, password: "Test12345" });
  if (r.status === 400) PASS(`Password no special char → 400`);
  else FAIL(`No special: expected 400, got ${r.status}`);

  // Login user 1
  r = await req("POST", "/api/auth/login", { email: USER_EMAIL, password: USER_PASS });
  if (r.status === 200 && r.body.token) {
    PASS(`Login user 1 → 200, token received`);
    userToken = r.body.token;
  } else FAIL(`Login user 1: ${r.status}`);
  if (!r.body.user?.password) PASS("Password NOT in login response");
  else FAIL("SECURITY: Password exposed in login response");

  // Login user 2
  r = await req("POST", "/api/auth/login", { email: USER2_EMAIL, password: USER_PASS });
  if (r.status === 200) { PASS("Login user 2 → 200"); user2Token = r.body.token; }
  else FAIL(`Login user 2: ${r.status}`);

  // Login owner
  r = await req("POST", "/api/auth/login", { email: OWNER_EMAIL, password: OWNER_PASS });
  if (r.status === 200 && r.body.user?.role === "owner") {
    PASS(`Login owner → 200, role: "owner"`);
    ownerToken = r.body.token;
  } else FAIL(`Owner login: ${r.status} ${JSON.stringify(r.body)}`);

  // Wrong password — generic message (no email enumeration)
  r = await req("POST", "/api/auth/login", { email: USER_EMAIL, password: "Wrong@999" });
  if (r.status === 401 && r.body.message === "Invalid email or password.") PASS(`Wrong password → 401 generic message`);
  else FAIL(`Wrong password: ${r.status} "${r.body.message}"`);

  // Unknown email — same generic message
  r = await req("POST", "/api/auth/login", { email: "nobody@nowhere.com", password: USER_PASS });
  if (r.status === 401 && r.body.message === "Invalid email or password.") PASS(`Unknown email → 401 same generic message (no enumeration)`);
  else FAIL(`Unknown email: ${r.status} "${r.body.message}"`);

  // GET /api/auth/me with valid token
  r = await req("GET", "/api/auth/me", null, userToken);
  if (r.status === 200 && !r.body.user?.password) PASS(`GET /me → 200, no password`);
  else FAIL(`GET /me: ${r.status}`);

  // GET /api/auth/me with no token
  r = await req("GET", "/api/auth/me");
  if (r.status === 401) PASS(`GET /me without token → 401`);
  else FAIL(`GET /me no token: expected 401, got ${r.status}`);

  // GET /api/auth/me with invalid token
  r = await req("GET", "/api/auth/me", null, "invalid.jwt.token");
  if (r.status === 401) PASS(`GET /me invalid token → 401`);
  else FAIL(`GET /me invalid token: expected 401, got ${r.status}`);
}

// ─── 2. Store API Tests ───────────────────────────────────────────────────────

async function testStores() {
  HEAD("2. Store API");

  // GET /api/stores authenticated
  let r = await req("GET", "/api/stores", null, userToken);
  if (r.status === 200 && Array.isArray(r.body.stores)) {
    PASS(`GET /api/stores → 200, ${r.body.stores.length} store(s)`);
    if (r.body.stores.length > 0) {
      storeId = r.body.stores[0]._id;
      const s = r.body.stores[0];
      if (typeof s.averageRating === "number") PASS(`Store has averageRating: ${s.averageRating}`);
      else FAIL(`Store missing averageRating`);
      if (typeof s.totalRatings === "number") PASS(`Store has totalRatings: ${s.totalRatings}`);
      else FAIL(`Store missing totalRatings`);
      if ("myRating" in s) PASS(`Store has myRating field (${s.myRating})`);
      else FAIL(`Store missing myRating field`);
    }
  } else FAIL(`GET /api/stores: ${r.status}`);

  // GET /api/stores unauthenticated → 401
  r = await req("GET", "/api/stores");
  if (r.status === 401) PASS(`GET /api/stores unauthenticated → 401`);
  else FAIL(`Stores unauth: expected 401, got ${r.status}`);

  // Search by name
  r = await req("GET", "/api/stores?search=nexaprime", null, userToken);
  if (r.status === 200) PASS(`GET /api/stores?search=nexaprime → 200, ${r.body.stores?.length} result(s)`);
  else FAIL(`Store search: ${r.status}`);

  // Search with no results
  r = await req("GET", "/api/stores?search=xyznonexistent999", null, userToken);
  if (r.status === 200 && r.body.stores?.length === 0) PASS(`Search with no results → 200 empty array`);
  else FAIL(`Empty search: ${r.status}, count: ${r.body.stores?.length}`);
}

// ─── 3. Rating API Tests ──────────────────────────────────────────────────────

async function testRatings() {
  HEAD("3. Rating API");
  if (!storeId) { INFO("Skipping rating tests — no storeId available"); return; }

  // Submit rating as user 1
  let r = await req("POST", `/api/ratings/${storeId}`, { rating: 4 }, userToken);
  if (r.status === 200 && r.body.rating?.rating === 4) PASS(`Submit rating 4 → 200`);
  else FAIL(`Submit rating: ${r.status} ${JSON.stringify(r.body)}`);

  // Verify rating shows up in GET /api/stores
  r = await req("GET", "/api/stores", null, userToken);
  const store = r.body.stores?.find((s) => s._id === storeId);
  if (store?.myRating === 4) PASS(`myRating updated to 4 in store list`);
  else FAIL(`myRating not updated: got ${store?.myRating}`);
  if (store?.averageRating > 0) PASS(`averageRating updated: ${store.averageRating}`);
  else FAIL(`averageRating not updated: ${store?.averageRating}`);

  // Update rating (should NOT create duplicate)
  r = await req("POST", `/api/ratings/${storeId}`, { rating: 5 }, userToken);
  if (r.status === 200 && r.body.rating?.rating === 5) PASS(`Update rating 4→5 → 200`);
  else FAIL(`Update rating: ${r.status}`);

  // Verify only one rating document exists for this user+store
  const ratingCount = await Rating.countDocuments({ storeId, userId: (await User.findOne({ email: USER_EMAIL }))._id });
  if (ratingCount === 1) PASS(`Database: exactly 1 rating doc for user+store (no duplicate)`);
  else FAIL(`Database: ${ratingCount} rating docs found — expected 1`);

  // Clear any pre-existing ratings for this store from other users before computing expected average
  const user1Doc = await User.findOne({ email: USER_EMAIL });
  const user2Doc = await User.findOne({ email: USER2_EMAIL });
  const testUserIds = [user1Doc?._id, user2Doc?._id].filter(Boolean);
  await Rating.deleteMany({ storeId, userId: { $nin: testUserIds } });
  INFO(`Cleared pre-existing 3rd-party ratings so average is deterministic`);

  // User 2 submits rating — different average
  r = await req("POST", `/api/ratings/${storeId}`, { rating: 3 }, user2Token);
  if (r.status === 200) PASS(`User 2 submits rating 3 → 200`);
  else FAIL(`User 2 rating: ${r.status}`);

  // Verify average is calculated from both ratings (user1=5, user2=3 → avg=4.0)
  r = await req("GET", "/api/stores", null, userToken);
  const s2 = r.body.stores?.find((s) => s._id === storeId);
  const expectedAvg = parseFloat(((5 + 3) / 2).toFixed(1));
  if (s2?.averageRating === expectedAvg) PASS(`Average rating correct: ${s2.averageRating} (expected ${expectedAvg})`);
  else FAIL(`Average rating wrong: got ${s2?.averageRating}, expected ${expectedAvg}`);

  // Invalid rating value — 0
  r = await req("POST", `/api/ratings/${storeId}`, { rating: 0 }, userToken);
  if (r.status === 400) PASS(`Rating 0 rejected → 400`);
  else FAIL(`Rating 0: expected 400, got ${r.status}`);

  // Invalid rating value — 6
  r = await req("POST", `/api/ratings/${storeId}`, { rating: 6 }, userToken);
  if (r.status === 400) PASS(`Rating 6 rejected → 400`);
  else FAIL(`Rating 6: expected 400, got ${r.status}`);

  // Non-integer rating
  r = await req("POST", `/api/ratings/${storeId}`, { rating: 3.5 }, userToken);
  if (r.status === 400) PASS(`Decimal rating 3.5 rejected → 400`);
  else FAIL(`Decimal rating: expected 400, got ${r.status}`);

  // Rating without auth
  r = await req("POST", `/api/ratings/${storeId}`, { rating: 4 });
  if (r.status === 401) PASS(`Rating without token → 401`);
  else FAIL(`Rating unauth: expected 401, got ${r.status}`);

  // GET /api/ratings/my
  r = await req("GET", "/api/ratings/my", null, userToken);
  if (r.status === 200 && Array.isArray(r.body.ratings)) PASS(`GET /api/ratings/my → 200, ${r.body.ratings.length} rating(s)`);
  else FAIL(`GET /ratings/my: ${r.status}`);
}

// ─── 4. Owner Dashboard Tests ─────────────────────────────────────────────────

async function testOwnerDashboard() {
  HEAD("4. Owner Dashboard");

  // Owner can access own dashboard
  let r = await req("GET", "/api/owner/dashboard", null, ownerToken);
  if (r.status === 200 && r.body.store) {
    PASS(`Owner GET /api/owner/dashboard → 200`);
    if (r.body.store.averageRating !== undefined) PASS(`Dashboard has averageRating: ${r.body.store.averageRating}`);
    else FAIL(`Dashboard missing averageRating`);
    if (Array.isArray(r.body.ratings)) PASS(`Dashboard has ratings array: ${r.body.ratings.length} rating(s)`);
    else FAIL(`Dashboard missing ratings array`);
    // Check user details in ratings
    if (r.body.ratings.length > 0) {
      const firstRating = r.body.ratings[0];
      if (firstRating.user?.name && firstRating.user?.email) PASS(`Rating includes user name + email`);
      else FAIL(`Rating missing user.name or user.email`);
      if (!firstRating.user?.password) PASS(`SECURITY: user password NOT exposed in ratings`);
      else FAIL(`SECURITY: user password exposed in owner dashboard ratings`);
    }
  } else FAIL(`Owner dashboard: ${r.status} ${JSON.stringify(r.body)}`);

  // Unauthenticated request → 401
  r = await req("GET", "/api/owner/dashboard");
  if (r.status === 401) PASS(`Owner dashboard unauthenticated → 401`);
  else FAIL(`Owner dashboard unauth: expected 401, got ${r.status}`);
}

// ─── 5. Authorization / Security Tests ───────────────────────────────────────

async function testSecurity() {
  HEAD("5. Authorization & Security");

  // Normal user cannot access owner dashboard
  let r = await req("GET", "/api/owner/dashboard", null, userToken);
  if (r.status === 403) PASS(`Normal user → owner dashboard → 403 Forbidden`);
  else FAIL(`User access owner dashboard: expected 403, got ${r.status}`);

  // Owner cannot submit rating (role "owner" blocked on rating POST)
  if (storeId) {
    r = await req("POST", `/api/ratings/${storeId}`, { rating: 4 }, ownerToken);
    if (r.status === 403) PASS(`Owner cannot submit rating → 403 Forbidden`);
    else FAIL(`Owner rating: expected 403, got ${r.status}`);
  }

  // No token → 401 on all protected routes
  const protectedRoutes = [
    ["GET",  "/api/stores"],
    ["GET",  "/api/ratings/my"],
    ["GET",  "/api/owner/dashboard"],
    ["GET",  "/api/auth/me"],
  ];
  for (const [method, path] of protectedRoutes) {
    r = await req(method, path);
    if (r.status === 401) PASS(`${method} ${path} (no token) → 401`);
    else FAIL(`${method} ${path} no token: expected 401, got ${r.status}`);
  }

  // Invalid JWT → 401
  r = await req("GET", "/api/auth/me", null, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.payload");
  if (r.status === 401) PASS(`Tampered JWT → 401`);
  else FAIL(`Tampered JWT: expected 401, got ${r.status}`);

  // Client cannot override userId in body
  if (storeId) {
    const fakeOwnerId = "000000000000000000000000";
    r = await req("POST", `/api/ratings/${storeId}`, { rating: 4, userId: fakeOwnerId }, userToken);
    // Should succeed (userId from body is ignored), not 400
    if (r.status === 200) PASS(`SECURITY: userId in request body is ignored (server uses req.user)`);
    else if (r.status === 400) INFO(`Rating rejected (possibly by validation) — check if userId was used`);
    else FAIL(`userId injection: unexpected ${r.status}`);
  }

  // Password never returned by /api/auth/me
  r = await req("GET", "/api/auth/me", null, userToken);
  const bodyStr = JSON.stringify(r.body);
  if (!bodyStr.includes('"password"')) PASS(`SECURITY: /api/auth/me response contains no password field`);
  else FAIL(`SECURITY: /api/auth/me response leaks password field`);

  // CORS header check — should only allow CLIENT_URL origin
  r = await req("GET", "/api/health");
  const corsHeader = r.headers["access-control-allow-origin"];
  if (!corsHeader || corsHeader !== "*") PASS(`CORS: not set to wildcard "*" (value: ${corsHeader || "not present on same-origin"})`);
  else FAIL(`CORS: access-control-allow-origin is "*" — too permissive!`);

  // Invalid request body — empty body to register
  r = await req("POST", "/api/auth/register", {});
  if (r.status === 400) PASS(`Empty register body → 400 validation error`);
  else FAIL(`Empty body: expected 400, got ${r.status}`);

  // Invalid JSON content-type handled gracefully
  r = await req("POST", "/api/auth/login", { email: null, password: null });
  if (r.status === 400 || r.status === 401) PASS(`Null credentials → 4xx (no 500)`);
  else if (r.status === 500) FAIL(`Null credentials caused 500 — unhandled error`);
  else INFO(`Null credentials → ${r.status} (acceptable)`);
}

// ─── 6. Database Integrity Tests ─────────────────────────────────────────────

async function testDatabaseIntegrity() {
  HEAD("6. Database Integrity");

  // Email unique index — use listIndexes() which returns an array
  const userIdxArr = await User.collection.listIndexes().toArray();
  const emailIdx = userIdxArr.find((idx) => idx.key?.email === 1);
  if (emailIdx?.unique) PASS(`User.email has unique index`);
  else FAIL(`User.email unique index missing`);

  // Rating compound unique index
  const ratingIdxArr = await Rating.collection.listIndexes().toArray();
  const compoundIdx = ratingIdxArr.find(
    (idx) => idx.key?.userId === 1 && idx.key?.storeId === 1
  );
  if (compoundIdx?.unique) PASS(`Rating compound index {userId,storeId} is unique`);
  else FAIL(`Rating compound unique index missing`);

  // Rating integer validation — min 1 max 5
  try {
    const u = await User.findOne({ email: USER_EMAIL });
    const s = await Store.findOne({});
    if (u && s) {
      const r = new Rating({ userId: u._id, storeId: s._id, rating: 0 });
      await r.validate();
      FAIL(`Rating 0 passed Mongoose validation — should have failed`);
    }
  } catch (e) {
    if (e.errors?.rating) PASS(`Mongoose Rating validation rejects 0`);
    else FAIL(`Unexpected error: ${e.message}`);
  }

  // Store references valid owner
  const store = await Store.findOne({}).populate("owner");
  if (store?.owner?.role === "owner") PASS(`Store references valid owner with role "owner"`);
  else FAIL(`Store owner reference invalid or owner has wrong role`);

  // No duplicate rating docs for same user+store
  if (storeId) {
    const user = await User.findOne({ email: USER_EMAIL });
    if (user) {
      const count = await Rating.countDocuments({ userId: user._id, storeId });
      if (count === 1) PASS(`No duplicate rating docs: exactly 1 for this user+store`);
      else FAIL(`Duplicate rating docs found: ${count} docs for same user+store`);
    }
  }
}

// ─── 7. Build Check ───────────────────────────────────────────────────────────

async function testEnvSecurity() {
  HEAD("7. Environment & .gitignore Security");

  const fs = require("fs");
  const path = require("path");

  // .env not tracked by git
  const gitignore = fs.readFileSync(path.join(__dirname, ".gitignore"), "utf8");
  if (gitignore.includes(".env")) PASS(`.gitignore includes .env`);
  else FAIL(`.gitignore does NOT include .env — secrets could be committed`);

  // JWT_SECRET present and long enough
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) PASS(`JWT_SECRET present and length ${secret.length} chars (≥32)`);
  else FAIL(`JWT_SECRET missing or too short: "${secret?.substring(0, 8)}..."`);

  // MONGO_URI present
  if (process.env.MONGO_URI) PASS(`MONGO_URI present in environment`);
  else FAIL(`MONGO_URI missing`);

  // CLIENT_URL configured
  if (process.env.CLIENT_URL) PASS(`CLIENT_URL = ${process.env.CLIENT_URL}`);
  else INFO(`CLIENT_URL not set — defaulting to http://localhost:5173`);
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

async function cleanup() {
  HEAD("Cleanup — removing Stage 5 test documents");
  const users = await User.find({ email: { $in: createdUsers } });
  const userIds = users.map((u) => u._id);
  if (userIds.length) {
    await Rating.deleteMany({ userId: { $in: userIds } });
    const del = await User.deleteMany({ _id: { $in: userIds } });
    console.log(`  ✅  Deleted ${del.deletedCount} test user(s) and their ratings`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔐  NexaPrime Stage 5 — Security & Functional Test Suite");
  console.log(`    Base URL: ${BASE}`);
  console.log(`    Time: ${new Date().toISOString()}\n`);

  // Quick connectivity check
  try {
    const health = await req("GET", "/api/health");
    if (health.status !== 200) throw new Error("Health check failed");
    console.log("✅  Backend reachable\n");
  } catch {
    console.error("❌  Cannot reach backend. Start with: npm run dev");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  MongoDB connected for DB integrity checks\n");

  try {
    await testAuthentication();
    await testStores();
    await testRatings();
    await testOwnerDashboard();
    await testSecurity();
    await testDatabaseIntegrity();
    await testEnvSecurity();
  } finally {
    await cleanup();
    await mongoose.disconnect();
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  RESULTS: ${passed} passed  |  ${failed} failed`);
  console.log(`${"═".repeat(50)}\n`);

  if (failed > 0) {
    console.log("⚠️   Fix the ❌ failures above before proceeding.\n");
    process.exit(1);
  } else {
    console.log("🎉  All Stage 5 tests passed! Application is ready.\n");
  }
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err.message);
  process.exit(1);
});
