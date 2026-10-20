// frontend/src/components/StoreCard.jsx
import { useState } from "react";
import StarRating from "./StarRating";
import { ratingAPI } from "../services/api";

/**
 * StoreCard
 * Props:
 *  store      — { _id, name, address, averageRating, totalRatings, myRating }
 *  onRatingUpdate(storeId, newRating) — called after successful submission
 */
export default function StoreCard({ store, onRatingUpdate }) {
  const [selected,    setSelected]    = useState(store.myRating || 0);
  const [submitting,  setSubmitting]  = useState(false);
  const [feedback,    setFeedback]    = useState(null); // { type: "success"|"error", msg }

  const hasExisting = store.myRating !== null && store.myRating !== undefined;

  async function handleSubmit() {
    if (!selected || selected < 1 || selected > 5) {
      setFeedback({ type: "error", msg: "Please select a star rating first." });
      return;
    }
    if (selected === store.myRating) {
      setFeedback({ type: "error", msg: "This is already your current rating." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await ratingAPI.submit(store._id, selected);
      setFeedback({ type: "success", msg: hasExisting ? "Rating updated!" : "Rating submitted!" });
      onRatingUpdate(store._id, selected);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit rating. Try again.";
      setFeedback({ type: "error", msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="store-card">
      <div className="store-card-header">
        <h3 className="store-name">{store.name}</h3>
        <div className="store-avg-rating">
          <StarRating value={store.averageRating} readOnly size="sm" label="Average rating" />
          <span className="total-ratings">({store.totalRatings} rating{store.totalRatings !== 1 ? "s" : ""})</span>
        </div>
      </div>

      <p className="store-address">
        <span aria-hidden="true">📍</span> {store.address}
      </p>

      <div className="store-rating-section">
        <div className="my-rating-label">
          {hasExisting
            ? <span className="badge badge-success">Your rating: {store.myRating}/5</span>
            : <span className="badge badge-muted">Not rated yet</span>
          }
        </div>

        <div className="rating-input-row">
          <StarRating
            value={selected}
            onChange={setSelected}
            size="md"
            label="Select your rating"
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={submitting || !selected}
            aria-busy={submitting}
          >
            {submitting ? "Saving…" : hasExisting ? "Update" : "Submit"}
          </button>
        </div>

        {feedback && (
          <p className={`feedback-msg feedback-${feedback.type}`} role="alert">
            {feedback.msg}
          </p>
        )}
      </div>
    </div>
  );
}
