import { useRef, useState } from "react";
import { ratingAPI, storeAPI } from "../services/api";
import StarRating from "./StarRating";

export default function StoreCard({ store, onRatingUpdate }) {
  const existingRating = Number.isInteger(store.myRating) && store.myRating >= 1 && store.myRating <= 5
    ? store.myRating
    : null;
  const [selected, setSelected] = useState(existingRating || 0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const submittingRef = useRef(false);

  const hasAverage = store.averageRating !== null
    && store.averageRating !== undefined
    && store.averageRating !== ""
    && Number.isFinite(Number(store.averageRating));
  const averageRating = hasAverage ? Number(store.averageRating) : 0;
  const totalRatings = Number.isInteger(store.totalRatings) && store.totalRatings >= 0
    ? store.totalRatings
    : null;
  const storeName = typeof store.name === "string" && store.name.trim() ? store.name : "Store";
  const address = typeof store.address === "string" ? store.address.trim() : "";

  async function handleSubmit() {
    if (submittingRef.current || !Number.isInteger(selected) || selected < 1 || selected > 5 || selected === existingRating) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await ratingAPI.submit(store._id, selected);
      const confirmedRating = Number(response.data?.rating?.rating);

      if (!Number.isInteger(confirmedRating) || confirmedRating < 1 || confirmedRating > 5) {
        throw new Error("The server returned an unexpected rating response.");
      }

      setSelected(confirmedRating);
      setFeedback({
        type: "success",
        message: existingRating === null ? "Your rating has been submitted." : "Your rating has been updated.",
      });
      onRatingUpdate?.({ ...store, myRating: confirmedRating });

      // Refresh rating totals from the server; averages are never recalculated optimistically.
      storeAPI.getById(store._id)
        .then((storeResponse) => {
          const refreshedStore = storeResponse.data?.store;
          if (refreshedStore && String(refreshedStore._id) === String(store._id)) {
            onRatingUpdate?.(refreshedStore);
          }
        })
        .catch(() => {
          // Keep the server-confirmed personal rating if the stats refresh is unavailable.
        });
    } catch (error) {
      const message = error.response?.data?.message;
      setFeedback({
        type: "error",
        message: typeof message === "string" && message.trim()
          ? message
          : "We couldn’t save your rating. Please try again.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <article className="store-card" aria-labelledby={`store-name-${store._id}`}>
      <div className="store-card-header">
        <div className="store-heading">
          <h2 className="store-name" id={`store-name-${store._id}`}>{storeName}</h2>
          {address && (
            <p className="store-address">
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M16 8.3c0 4.4-6 9.2-6 9.2S4 12.7 4 8.3a6 6 0 1112 0Z" />
                <circle cx="10" cy="8" r="2" />
              </svg>
              <span>{address}</span>
            </p>
          )}
        </div>

        <div className="store-summary-rating" aria-label="Store rating summary">
          <span className="store-average-value">{hasAverage ? averageRating.toFixed(1) : "—"}</span>
          {hasAverage ? (
            <StarRating value={averageRating} readOnly size="sm" label={`Average rating for ${storeName}`} />
          ) : (
            <span className="total-ratings">Average not available</span>
          )}
          {totalRatings !== null && (
            <span className="total-ratings">
              {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
            </span>
          )}
        </div>
      </div>

      <div className="store-rating-section">
        <div className="store-rating-heading">
          <h3>Rate this store</h3>
          {existingRating !== null ? (
            <span className="badge badge-success">Your rating: {existingRating}/5</span>
          ) : (
            <span className="badge badge-muted">Not rated yet</span>
          )}
        </div>

        <div className="rating-input-row">
          <StarRating
            value={selected}
            onChange={(value) => {
              setSelected(value);
              setFeedback(null);
            }}
            disabled={submitting}
            size="md"
            label={`Your rating for ${storeName}`}
          />
          <button
            className="btn btn-primary btn-sm store-rating-submit"
            type="button"
            onClick={handleSubmit}
            disabled={submitting || selected < 1 || selected === existingRating}
            aria-busy={submitting}
          >
            {submitting ? "Saving…" : existingRating === null ? "Submit rating" : "Update rating"}
          </button>
        </div>

        {feedback && (
          <p
            className={`feedback-msg feedback-${feedback.type}`}
            role={feedback.type === "error" ? "alert" : "status"}
            aria-live={feedback.type === "error" ? "assertive" : "polite"}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </article>
  );
}
