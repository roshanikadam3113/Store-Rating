import { useCallback, useEffect, useRef, useState } from "react";
import { storeAPI } from "../services/api";
import Loader from "../components/Loader";
import SearchBar from "../components/SearchBar";
import StoreCard from "../components/StoreCard";

function getRequestError(error) {
  const message = error.response?.data?.message;
  return typeof message === "string" && message.trim()
    ? message
    : "We couldn’t load stores. Check your connection and try again.";
}

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const requestIdRef = useRef(0);

  const fetchStores = useCallback(async (term) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const response = await storeAPI.getAll(term);
      const result = response.data?.stores;
      if (!Array.isArray(result)) {
        throw new Error("Unexpected store list response.");
      }
      if (requestId === requestIdRef.current) {
        setStores(result);
        setError("");
      }
    } catch (requestError) {
      if (requestId === requestIdRef.current && requestError.response?.status !== 401) {
        setError(getRequestError(requestError));
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores(search);
    return () => {
      requestIdRef.current += 1;
    };
  }, [search, fetchStores]);

  const handleRatingUpdate = useCallback((updatedStore) => {
    if (!updatedStore?._id) return;
    setStores((currentStores) => currentStores.map((store) => (
      String(store._id) === String(updatedStore._id)
        ? { ...store, ...updatedStore }
        : store
    )));
  }, []);

  return (
    <div className="dashboard-page store-discovery-page">
      <header className="dashboard-header store-discovery-header">
        <div>
          <p className="page-eyebrow">Store directory</p>
          <h1 className="dashboard-title">Find a store worth rating</h1>
          <p className="dashboard-subtitle">Explore local businesses and share your experience.</p>
        </div>
      </header>

      <section className="store-directory-tools" aria-label="Find stores">
        <div className="store-search-copy">
          <h2>Browse stores</h2>
          <p>Search by store name. Average scores and rating counts come from store data.</p>
        </div>
        <SearchBar onSearch={setSearch} />
      </section>

      {loading && <Loader message={search ? "Searching stores…" : "Loading stores…"} />}

      {!loading && error && (
        <div className="alert alert-error store-list-error" role="alert">
          <span>{error}</span>
          <button
            className="btn btn-outline btn-sm"
            type="button"
            onClick={() => fetchStores(search)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && stores.length === 0 && (
        <div className="empty-state store-empty-state">
          <span className="empty-state-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M9 20v-6h6v6" />
            </svg>
          </span>
          <h2>{search ? "No stores match that name" : "No stores available yet"}</h2>
          <p>
            {search
              ? "Try another name, or use the clear control in search to browse every store."
              : "Stores will appear here as soon as they are available."}
          </p>
        </div>
      )}

      {!loading && !error && stores.length > 0 && (
        <section className="store-results" aria-label="Store results">
          <div className="store-results-heading">
            <p className="result-count" aria-live="polite">
              <strong>{stores.length}</strong> {stores.length === 1 ? "store" : "stores"}
              {search && <span> matching “{search}”</span>}
            </p>
          </div>
          <div className="stores-grid">
            {stores.map((store, index) => (
              <StoreCard
                key={store._id || `${store.name || "store"}-${index}`}
                store={store}
                onRatingUpdate={handleRatingUpdate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
