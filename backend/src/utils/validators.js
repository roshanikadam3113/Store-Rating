// backend/src/utils/validators.js
// Reusable input validation for NexaPrime Store Rating Application
//
// How to use in a controller:
//   const { validateRegisterInput, validateLoginInput } = require("../utils/validators");
//
//   const errors = validateRegisterInput(req.body);
//   if (errors.length > 0) {
//     return res.status(400).json({ message: errors[0] });
//   }

// ─── Regex constants ────────────────────────────────────────────────────────

// Basic email format: something@something.something
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password: at least one uppercase letter AND at least one special character
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?`~]/;
const PASSWORD_UPPER_REGEX   = /[A-Z]/;

// ─── Individual field validators ────────────────────────────────────────────

/**
 * Validate name field.
 * Rules: required, trimmed length 20–60 characters.
 * @param {string} name
 * @returns {string|null} error message or null if valid
 */
function validateName(name) {
  if (!name || typeof name !== "string") return "Name is required";
  const trimmed = name.trim();
  if (trimmed.length < 20) return "Name must be at least 20 characters";
  if (trimmed.length > 60) return "Name must not exceed 60 characters";
  return null;
}

/**
 * Validate and normalize email field.
 * Rules: required, valid format, normalized to lowercase.
 * @param {string} email
 * @returns {{ error: string|null, normalized: string }}
 */
function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { error: "Email is required", normalized: "" };
  }
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized)) {
    return { error: "Please provide a valid email address", normalized: "" };
  }
  return { error: null, normalized };
}

/**
 * Validate address field.
 * Rules: required, max 400 characters.
 * @param {string} address
 * @returns {string|null} error message or null if valid
 */
function validateAddress(address) {
  if (!address || typeof address !== "string" || address.trim().length === 0) {
    return "Address is required";
  }
  if (address.trim().length > 400) return "Address must not exceed 400 characters";
  return null;
}

/**
 * Validate raw password (before hashing).
 * Rules: required, 8–16 characters, at least one uppercase, at least one special character.
 * This runs BEFORE bcrypt hashing in the controller.
 * @param {string} password
 * @returns {string|null} error message or null if valid
 */
function validatePassword(password) {
  if (!password || typeof password !== "string") return "Password is required";
  if (password.length < 8)  return "Password must be at least 8 characters";
  if (password.length > 16) return "Password must not exceed 16 characters";
  if (!PASSWORD_UPPER_REGEX.test(password))   return "Password must contain at least one uppercase letter";
  if (!PASSWORD_SPECIAL_REGEX.test(password)) return "Password must contain at least one special character";
  return null;
}

// ─── Composite validators ────────────────────────────────────────────────────

/**
 * Validate all registration fields.
 * Returns an array of error strings (empty array = all valid).
 * Also returns normalized values for the controller to use.
 *
 * Usage:
 *   const { errors, normalized } = validateRegisterInput(req.body);
 *   if (errors.length > 0) return res.status(400).json({ message: errors[0] });
 *   // use normalized.email, normalized.name, etc.
 *
 * @param {{ name, email, address, password }} body
 * @returns {{ errors: string[], normalized: { name, email, address, password } }}
 */
function validateRegisterInput({ name, email, address, password } = {}) {
  const errors = [];

  const nameError    = validateName(name);
  if (nameError) errors.push(nameError);

  const { error: emailError, normalized: normalizedEmail } = validateEmail(email);
  if (emailError) errors.push(emailError);

  const addressError = validateAddress(address);
  if (addressError) errors.push(addressError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  return {
    errors,
    normalized: {
      name:     name    ? name.trim()    : "",
      email:    normalizedEmail,
      address:  address ? address.trim() : "",
      password: password || "",
    },
  };
}

/**
 * Validate login fields.
 * Returns an array of error strings.
 *
 * Usage:
 *   const { errors, normalized } = validateLoginInput(req.body);
 *   if (errors.length > 0) return res.status(400).json({ message: errors[0] });
 *
 * @param {{ email, password }} body
 * @returns {{ errors: string[], normalized: { email, password } }}
 */
function validateLoginInput({ email, password } = {}) {
  const errors = [];

  const { error: emailError, normalized: normalizedEmail } = validateEmail(email);
  if (emailError) errors.push(emailError);

  if (!password || typeof password !== "string" || password.trim().length === 0) {
    errors.push("Password is required");
  }

  return {
    errors,
    normalized: {
      email:    normalizedEmail,
      password: password || "",
    },
  };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRegisterInput,
  validateLoginInput,
};
