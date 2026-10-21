import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavigationIcon({ owner }) {
  return owner ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = user?.role === "owner";
  const dashboardPath = isOwner ? "/owner/dashboard" : "/user/dashboard";
  const navigationItem = isOwner
    ? { to: "/owner/dashboard", label: "My store" }
    : { to: "/user/dashboard", label: "Browse stores" };
  const displayName = user?.name?.trim() || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <Link className="dashboard-brand" to={dashboardPath} aria-label="NexaPrime Ratings home">
          <span className="dashboard-brand-mark" aria-hidden="true">NP</span>
          <span className="dashboard-brand-name">NexaPrime <span>Ratings</span></span>
        </Link>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <NavLink
            to={navigationItem.to}
            end
            className={({ isActive }) => `dashboard-nav-link${isActive ? " active" : ""}`}
          >
            <span className="dashboard-nav-icon"><NavigationIcon owner={isOwner} /></span>
            <span>{navigationItem.label}</span>
          </NavLink>
        </nav>

        <div className="dashboard-account">
          <span className="dashboard-avatar" aria-hidden="true">{initial}</span>
          <span className="dashboard-account-copy">
            <span className="dashboard-account-name">{displayName}</span>
            {user?.email && <span className="dashboard-account-email">{user.email}</span>}
          </span>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm dashboard-logout"
          onClick={handleLogout}
          aria-label="Log out of NexaPrime Ratings"
        >
          Log out
        </button>

        <button
          type="button"
          className={`dashboard-menu-toggle${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="dashboard-mobile-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div
        id="dashboard-mobile-navigation"
        className={`dashboard-mobile-navigation${menuOpen ? " is-open" : ""}`}
        hidden={!menuOpen}
      >
        <nav aria-label="Mobile navigation">
          <NavLink
            to={navigationItem.to}
            end
            className={({ isActive }) => `dashboard-mobile-link${isActive ? " active" : ""}`}
            onClick={closeMenu}
          >
            <span className="dashboard-nav-icon"><NavigationIcon owner={isOwner} /></span>
            <span>{navigationItem.label}</span>
          </NavLink>
        </nav>
        <div className="dashboard-mobile-account">
          <span className="dashboard-avatar" aria-hidden="true">{initial}</span>
          <span className="dashboard-account-copy">
            <span className="dashboard-account-name">{displayName}</span>
            {user?.email && <span className="dashboard-account-email">{user.email}</span>}
          </span>
        </div>
      </div>

      <main className="dashboard-content" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
