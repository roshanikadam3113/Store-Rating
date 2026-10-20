// frontend/src/utils/validators.js
// Frontend validation utilities — mirrors backend rules exactly.
// Frontend validation improves UX; backend validation remains authoritative.

// ── Regex constants ──────────────────────────────────────────────────────────

const EMAIL_REGEX   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPER_REGEX   = /[A-Z]/;
const SPECIAL_REGEX = /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?`~]/;

// ── Individual field validators ──────────────────────────────────────────────

export function validateName(name) {
  if (!name || !name.trim()) return "Name is required";
  if (name.trim().length < 20) return "Name must be at least 20 characters";
  if (name.trim().length > 60) return "Name must not exceed 60 characters";
  return null;
}

export function validateEmail(email) {
  if (!email || !email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email.trim().toLowerCase())) return "Please enter a valid email address";
  return null;
}

export function validateAddress(address) {
  if (!address || !address.trim()) return "Address is required";
  if (address.trim().length > 400) return "Address must not exceed 400 characters";
  return null;
}

export function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8)  return "Password must be at least 8 characters";
  if (password.length > 16) return "Password must not exceed 16 characters";
  if (!UPPER_REGEX.test(password))   return "Password must contain at least one uppercase letter";
  if (!SPECIAL_REGEX.test(password)) return "Password must contain at least one special character";
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}

export function validateRating(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 5) return "Rating must be between 1 and 5";
  return null;
}

// ── Composite validators ──────────────────────────────────────────────────────

export function validateRegisterForm({ name, email, address, password, confirmPassword }) {
  return {
    name:            validateName(name),
    email:           validateEmail(email),
    address:         validateAddress(address),
    password:        validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  };
}

export function validateLoginForm({ email, password }) {
  return {
    email:    validateEmail(email),
    password: !password ? "Password is required" : null,
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
