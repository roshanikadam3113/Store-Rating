// frontend/src/context/AuthContext.jsx
// Authentication state management for NexaPrime Store Rating Application

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, getToken, setToken, setStoredUser, getStoredUser, clearAuth } from "../services/api";

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the application and provides authentication state.
 *
 * State:
 *  user        : safe user object from backend, or null
 *  loading     : true while restoring auth state on page load
 *
 * On mount: if a token exists in localStorage, calls GET /api/auth/me to
 * verify the token is still valid and load fresh user data. If the backend
 * rejects the token (expired, deleted account), auth state is cleared.
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(getStoredUser());
  const [loading, setLoading] = useState(true); // True until initial restore completes

  // ── Restore auth state on page load ───────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Verify token with backend and get fresh user data
    authAPI.getMe()
      .then((res) => {
        const freshUser = res.data.user;
        setUser(freshUser);
        setStoredUser(freshUser);
      })
      .catch(() => {
        // Token is expired or invalid — clear everything
        clearAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Login function ─────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: loggedInUser } = res.data;
    setToken(token);
    setStoredUser(loggedInUser);
    setUser(loggedInUser);
    return loggedInUser; // Return so caller can redirect based on role
  }, []);

  // ── Logout function ────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook — throws if used outside AuthProvider. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
