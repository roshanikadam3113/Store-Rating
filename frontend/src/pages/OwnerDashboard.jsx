// frontend/src/pages/OwnerDashboard.jsx
import { useState, useEffect } from "react";
import { ownerAPI } from "../services/api";
import StarRating from "../components/StarRating";
import Loader     from "../components/Loader";

export default function OwnerDashboard() {
  const [store,    setStore]    = useState(null);
  const [ratings,  setRatings]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [noStore,  setNoStore]  = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError("");
      try {
        const res = await ownerAPI.getDashboard();
        if (!res.data.store) {
          setNoStore(true);
        } else {
          setStore(res.data.store);
          setRatings(res.data.ratings || []);
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          setError(err.response?.data?.message || "Failed to load dashboard. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Owner Dashboard</h1>
          <p className="dashboard-subtitle">Manage your store and view customer ratings</p>
        </div>
      </div>

      {loading && <Loader message="Loading your dashboard…" />}

      {!loading && error && (
        <div className="alert alert-error" role="alert">{error}</div>
      )}

      {!loading && noStore && (
        <div className="empty-state">
          <span className="empty-icon">🏪</span>
          <h2>No Store Assigned</h2>
          <p>You don&apos;t have a store assigned to your account yet. Please contact the administrator.</p>
        </div>
      )}

      {!loading && !error && store && (
        <>
          {/* Store Summary Card */}
          <div className="owner-store-card">
            <div className="owner-store-info">
              <h2 className="owner-store-name">{store.name}</h2>
              <p className="owner-store-address">
                <span aria-hidden="true">📍</span> {store.address}
              </p>
            </div>
            <div className="owner-store-stats">
              <div className="stat-box">
                <span className="stat-number">{store.averageRating}</span>
                <span className="stat-label">Avg Rating</span>
                <StarRating value={store.averageRating} readOnly size="sm" label="Average rating" />
              </div>
              <div className="stat-box">
                <span className="stat-number">{store.totalRatings}</span>
                <span className="stat-label">Total Ratings</span>
              </div>
            </div>
          </div>

          {/* Ratings Table */}
          <div className="ratings-section">
            <h2 className="section-title">Customer Ratings</h2>

            {ratings.length === 0 ? (
              <div className="empty-state empty-state-sm">
                <span className="empty-icon">💬</span>
                <p>No ratings yet. Share your store with customers!</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="ratings-table" aria-label="Customer ratings">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Customer Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Rating</th>
                      <th scope="col">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((r, i) => (
                      <tr key={r._id}>
                        <td>{i + 1}</td>
                        <td>{r.user?.name || "—"}</td>
                        <td className="email-cell">{r.user?.email || "—"}</td>
                        <td>
                          <div className="table-rating-cell">
                            <StarRating value={r.rating} readOnly size="sm" label={`Rating by ${r.user?.name}`} />
                          </div>
                        </td>
                        <td>{new Date(r.updatedAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
