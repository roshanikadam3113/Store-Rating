// frontend/src/components/ProtectedRoute.jsx
// Route guard component for NexaPrime Store Rating Application

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

/**
 * ProtectedRoute
 *
 * Renders children only when:
 *  1. Authentication initialization is complete (loading = false).
 *  2. The user is authenticated.
 *  3. If `requiredRole` is specified, the user's role matches.
 *
 * While loading: shows a full-page loader (prevents content flash).
 * If not authenticated: redirects to /login, preserving the intended path.
 * If wrong role: redirects to the user's correct dashboard.
 *
 * Props:
 *  children     — the protected page component
 *  requiredRole — optional: "user" | "owner"
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  // Wait for auth state to be restored before making routing decisions.
  // This prevents a brief flash of the login page on refresh.
  if (loading) {
    return <Loader fullPage message="Verifying session…" />;
  }

  // Not authenticated — redirect to login, remember where they wanted to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role — redirect to the correct dashboard
  if (requiredRole && user.role !== requiredRole) {
    const correctPath = user.role === "owner" ? "/owner/dashboard" : "/user/dashboard";
    return <Navigate to={correctPath} replace />;
  }

  return children ?? <Outlet />;
}
