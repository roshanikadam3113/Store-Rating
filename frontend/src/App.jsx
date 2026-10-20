// frontend/src/App.jsx
// Root application component with routing for NexaPrime Store Rating App

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute  from "./components/ProtectedRoute";
import Navbar          from "./components/Navbar";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import UserDashboard   from "./pages/UserDashboard";
import OwnerDashboard  from "./pages/OwnerDashboard";
import NotFound        from "./pages/NotFound";

/**
 * PublicOnlyRoute — redirects authenticated users away from login/register
 * to their role-appropriate dashboard.
 */
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Wait silently — Navbar handles the loader
  if (user) {
    return <Navigate to={user.role === "owner" ? "/owner/dashboard" : "/user/dashboard"} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes — redirect if already logged in */}
          <Route path="/login"    element={<PublicOnlyRoute><Login    /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Protected — Normal User only */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected — Store Owner only */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
