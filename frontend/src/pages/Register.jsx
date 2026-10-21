import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { getSafeApiErrorMessage } from "../utils/apiErrors";
import { hasErrors, validateRegisterForm } from "../utils/validators";

export default function Register() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);
  const redirectTimerRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => () => window.clearTimeout(redirectTimerRef.current), []);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    setApiError("");
    setSuccess(false);
    window.clearTimeout(redirectTimerRef.current);

    if (errors[name] || (name === "password" && errors.confirmPassword)) {
      const nextErrors = validateRegisterForm(nextForm);
      setErrors((current) => ({
        ...current,
        [name]: nextErrors[name],
        ...(name === "password" ? { confirmPassword: nextErrors.confirmPassword } : {}),
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validateRegisterForm(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    submittingRef.current = true;
    setLoading(true);
    setApiError("");
    setSuccess(false);

    try {
      // Public registration intentionally sends no role; the backend assigns "user".
      await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        password: form.password,
      });

      setSuccess(true);
      redirectTimerRef.current = window.setTimeout(() => navigate("/login", { replace: true }), 2200);
    } catch (error) {
      setApiError(getSafeApiErrorMessage(
        error,
        "We couldn’t create your account. Please review your details and try again.",
        [form.password, form.confirmPassword],
      ));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  const nameCount = form.name.trim().length;
  const addressCount = form.address.trim().length;

  return (
    <section className="auth-page auth-page-register" aria-labelledby="register-title">
      <div className="auth-card auth-card-wide auth-card-register">
        <header className="auth-header">
          <span className="auth-logo" aria-hidden="true">NP</span>
          <p className="auth-eyebrow">NexaPrime Ratings</p>
          <h1 id="register-title">Create your account</h1>
          <p>Join the community and share your store experiences.</p>
        </header>

        {apiError && <div className="alert alert-error auth-message" role="alert">{apiError}</div>}
        {success && (
          <div className="alert alert-success auth-message" role="status" aria-live="polite">
            <span>Your account is ready. You can now <Link to="/login">sign in</Link>.</span>
          </div>
        )}

        <form className="auth-form auth-register-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">
              Full name
              <span className="char-counter">{nameCount}/40</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
              placeholder="Your full name"
              maxLength={40}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "register-name-error" : "register-name-help"}
              required
              disabled={loading}
            />
            {errors.name ? (
              <span className="field-error" id="register-name-error">{errors.name}</span>
            ) : (
              <span className="field-help" id="register-name-help">Use 20–40 characters.</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck="false"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              required
              disabled={loading}
            />
            {errors.email && <span className="field-error" id="register-email-error">{errors.email}</span>}
          </div>

          <div className="form-group form-group-wide">
            <label htmlFor="address">
              Address
              <span className="char-counter">{addressCount}/400</span>
            </label>
            <textarea
              id="address"
              name="address"
              autoComplete="street-address"
              value={form.address}
              onChange={handleChange}
              className={errors.address ? "input-error" : ""}
              placeholder="Street, city, and region"
              rows={2}
              maxLength={400}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? "register-address-error" : undefined}
              required
              disabled={loading}
            />
            {errors.address && <span className="field-error" id="register-address-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className="input-with-toggle">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder="Create a password"
                minLength={8}
                maxLength={16}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "register-password-hint register-password-error" : "register-password-hint"}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-controls="reg-password"
                disabled={loading}
              >
                <span aria-hidden="true">{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            <span className="field-help" id="register-password-hint">
              8–16 characters, with an uppercase letter and a special character.
            </span>
            {errors.password && <span className="field-error" id="register-password-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="input-with-toggle">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
                placeholder="Enter your password again"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "register-confirm-error" : undefined}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                aria-controls="confirmPassword"
                disabled={loading}
              >
                <span aria-hidden="true">{showConfirmPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="field-error" id="register-confirm-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full auth-submit auth-submit-wide" disabled={loading} aria-busy={loading}>
            {loading && <span className="auth-submit-spinner" aria-hidden="true" />}
            <span>{loading ? "Creating account…" : "Create account"}</span>
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
