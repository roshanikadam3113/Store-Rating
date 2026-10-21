import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSafeApiErrorMessage } from "../utils/apiErrors";
import { validateLoginForm, hasErrors } from "../utils/validators";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const submittingRef = useRef(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    setApiError("");

    if (errors[name]) {
      const nextErrors = validateLoginForm(nextForm);
      setErrors((current) => ({ ...current, [name]: nextErrors[name] }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validateLoginForm(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    submittingRef.current = true;
    setLoading(true);
    setApiError("");

    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      const intended = location.state?.from?.pathname;
      if (intended && intended !== "/login" && intended !== "/register") {
        navigate(intended, { replace: true });
      } else {
        navigate(user.role === "owner" ? "/owner/dashboard" : "/user/dashboard", { replace: true });
      }
    } catch (error) {
      setApiError(getSafeApiErrorMessage(
        error,
        "We couldn’t sign you in. Check your details and try again.",
        [form.password],
      ));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <section className="auth-page auth-page-login" aria-labelledby="login-title">
      <div className="auth-card auth-card-login">
        <header className="auth-header">
          <span className="auth-logo" aria-hidden="true">NP</span>
          <p className="auth-eyebrow">NexaPrime Ratings</p>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to discover trusted local stores.</p>
        </header>

        {apiError && <div className="alert alert-error auth-message" role="alert">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
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
              aria-describedby={errors.email ? "login-email-error" : undefined}
              required
              disabled={loading}
            />
            {errors.email && <span className="field-error" id="login-email-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-toggle">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-controls="password"
                disabled={loading}
              >
                <span aria-hidden="true">{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            {errors.password && <span className="field-error" id="login-password-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading} aria-busy={loading}>
            {loading && <span className="auth-submit-spinner" aria-hidden="true" />}
            <span>{loading ? "Signing in…" : "Sign in"}</span>
          </button>
        </form>

        <p className="auth-switch">
          New to NexaPrime? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
