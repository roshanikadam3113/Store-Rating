// frontend/src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { validateRegisterForm, hasErrors } from "../utils/validators";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", address: "", password: "", confirmPassword: "",
  });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [success,  setSuccess]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    setApiError(""); setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateRegisterForm(form);
    if (hasErrors(errs)) { setErrors(errs); return; }

    setLoading(true);
    setApiError(""); setSuccess("");
    try {
      // Send only required fields — never send role from the frontend
      await authAPI.register({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        address:  form.address.trim(),
        password: form.password,
      });
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const charCount = form.name.trim().length;

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <span className="auth-logo">⭐</span>
          <h1>Create Account</h1>
          <p>Join NexaPrime Store Ratings</p>
        </div>

        {apiError && <div className="alert alert-error"  role="alert">{apiError}</div>}
        {success  && <div className="alert alert-success" role="alert">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">
              Full Name
              <span className={`char-counter ${charCount < 20 ? "counter-warn" : "counter-ok"}`}>
                {charCount}/60
              </span>
            </label>
            <input
              id="name" name="name" type="text"
              value={form.name} onChange={handleChange}
              className={errors.name ? "input-error" : ""}
              placeholder="At least 20 characters"
              disabled={loading} maxLength={60}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              placeholder="you@example.com"
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">
              Address
              <span className="char-counter counter-ok">{form.address.trim().length}/400</span>
            </label>
            <textarea
              id="address" name="address"
              value={form.address} onChange={handleChange}
              className={errors.address ? "input-error" : ""}
              placeholder="Your full address"
              rows={2} maxLength={400} disabled={loading}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className="input-with-toggle">
              <input
                id="reg-password" name="password"
                type={showPass ? "text" : "password"} autoComplete="new-password"
                value={form.password} onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder="8–16 chars, uppercase + special"
                disabled={loading}
              />
              <button type="button" className="toggle-pass"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? "Hide password" : "Show password"}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password"
              autoComplete="new-password"
              value={form.confirmPassword} onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
              placeholder="Repeat your password"
              disabled={loading}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full"
            disabled={loading} aria-busy={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
