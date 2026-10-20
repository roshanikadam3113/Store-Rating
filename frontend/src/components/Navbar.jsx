// frontend/src/components/Navbar.jsx
// Navigation bar for NexaPrime Store Rating Application

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user ? (user.role === "owner" ? "/owner/dashboard" : "/user/dashboard") : "/login"}>
          <span className="brand-icon">⭐</span>
          <span className="brand-name">NexaPrime Ratings</span>
        </Link>
      </div>

      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-greeting">
              Hi, <strong>{user.name.split(" ")[0]}</strong>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
            </span>
            {user.role === "user" && (
              <Link to="/user/dashboard" className="nav-link">Dashboard</Link>
            )}
            {user.role === "owner" && (
              <Link to="/owner/dashboard" className="nav-link">My Store</Link>
            )}
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
