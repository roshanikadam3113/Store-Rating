// frontend/src/pages/UserDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { storeAPI } from "../services/api";
import SearchBar from "../components/SearchBar";
import StoreCard from "../components/StoreCard";
import Loader    from "../components/Loader";

export default function UserDashboard() {
  const { user, logout }   = useAuth();
  const navigate           = useNavigate();

  const [stores,  setStores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");

  // Fetch stores — re-runs when search term changes
  const fetchStores = useCallback(async (term = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await storeAPI.getAll(term);
      setStores(res.data.stores || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || "Failed to load stores. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStores(search); }, [search, fetchStores]);

  // Called by StoreCard after a successful rating submission
  // Updates the local store's myRating and recalculates average optimistically
  function handleRatingUpdate(storeId, newRating) {
    setStores((prev) =>
      prev.map((s) => {
        if (s._id !== storeId) return s;
        const wasRated  = s.myRating !== null && s.myRating !== undefined;
        const total     = wasRated ? s.totalRatings : s.totalRatings + 1;
        const oldSum    = s.averageRating * s.totalRatings;
        const newSum    = wasRated ? (oldSum - s.myRating + newRating) : (oldSum + newRating);
        return {
          ...s,
          myRating:      newRating,
          totalRatings:  total,
          averageRating: parseFloat((newSum / total).toFixed(1)),
        };
      })
    );
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Store Ratings</h1>
          <p className="dashboard-subtitle">
            Browse stores and share your experience
          </p>
        </div>
        <div className="dashboard-user-info">
          <span className="user-name-pill">{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
        </div>
      </div>

      <div className="search-section">
        <SearchBar onSearch={setSearch} />
      </div>

      {loading && <Loader message="Loading stores…" />}

      {!loading && error && (
        <div className="alert alert-error" role="alert">
          {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: "1rem" }}
            onClick={() => fetchStores(search)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && stores.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🏪</span>
          <h2>No stores found</h2>
          <p>{search ? `No stores match "${search}". Try a different search.` : "No stores have been registered yet."}</p>
        </div>
      )}

      {!loading && !error && stores.length > 0 && (
        <>
          <p className="result-count">
            {stores.length} store{stores.length !== 1 ? "s" : ""}{search ? ` for "${search}"` : ""}
          </p>
          <div className="stores-grid">
            {stores.map((store) => (
              <StoreCard
                key={store._id}
                store={store}
                onRatingUpdate={handleRatingUpdate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
