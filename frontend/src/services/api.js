// frontend/src/services/api.js
// Axios instance for NexaPrime Store Rating Application
//
// Token storage strategy: localStorage
//  - Chosen because this backend expects Bearer tokens in the Authorization header.
//  - localStorage is synchronous and works across page refreshes.
//  - Security trade-off: localStorage is accessible to JavaScript, making it
//    vulnerable to XSS attacks. For a production app with higher security needs,
//    use HttpOnly cookies (requires backend cookie + CSRF configuration).
//  - For this internship assessment, localStorage is appropriate and conventional.
//
// What is stored:
//  - "nex_token"  : the raw JWT string
//  - "nex_user"   : safe user JSON (no password, no hash)
//
// What is NEVER stored: passwords, password hashes, JWT secrets.

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ── Token helpers ────────────────────────────────────────────────────────────

export const getToken   = ()        => localStorage.getItem("nex_token");
export const setToken   = (token)   => localStorage.setItem("nex_token", token);
export const removeToken = ()       => localStorage.removeItem("nex_token");

export const getStoredUser = ()     => {
  try { return JSON.parse(localStorage.getItem("nex_user")); }
  catch { return null; }
};
export const setStoredUser  = (u)   => localStorage.setItem("nex_user", JSON.stringify(u));
export const removeStoredUser = ()  => localStorage.removeItem("nex_user");

export function clearAuth() {
  removeToken();
  removeStoredUser();
}

// ── Axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 seconds
});

// ── Request interceptor: attach Bearer token ─────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ────────────────────────────────
// When the backend returns 401 (expired or invalid token), clear auth and
// redirect to /login. This prevents redirect loops by checking the URL first.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        clearAuth();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── API functions ─────────────────────────────────────────────────────────────

// Auth
export const authAPI = {
  register: (data)  => api.post("/auth/register", data),
  login:    (data)  => api.post("/auth/login", data),
  getMe:    ()      => api.get("/auth/me"),
};

// Stores
export const storeAPI = {
  getAll:   (search) => api.get("/stores", { params: search ? { search } : {} }),
  getById:  (id)     => api.get(`/stores/${id}`),
};

// Ratings
export const ratingAPI = {
  submit:    (storeId, rating) => api.post(`/ratings/${storeId}`, { rating }),
  getMyRatings: ()             => api.get("/ratings/my"),
};

// Owner
export const ownerAPI = {
  getDashboard: () => api.get("/owner/dashboard"),
};

export default api;
