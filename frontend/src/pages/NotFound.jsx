// frontend/src/pages/NotFound.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const homePath = user
    ? (user.role === "owner" ? "/owner/dashboard" : "/user/dashboard")
    : "/login";

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-icon">🔍</span>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button onClick={() => navigate(-1)} className="btn btn-outline">
            ← Go Back
          </button>
          <Link to={homePath} className="btn btn-primary">
            {user ? "Go to Dashboard" : "Go to Login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
