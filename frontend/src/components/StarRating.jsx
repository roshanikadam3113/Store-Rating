// frontend/src/components/StarRating.jsx
// Interactive and read-only star rating component

import { useState } from "react";

/**
 * StarRating
 *
 * Props:
 *  value      — current selected value (1–5 or 0/null for none)
 *  onChange   — callback(newValue) — omit to make read-only
 *  readOnly   — boolean: if true, stars are display-only
 *  size       — "sm" | "md" | "lg"
 *  label      — accessible label for screen readers
 */
export default function StarRating({
  value    = 0,
  onChange,
  readOnly = false,
  size     = "md",
  label    = "Rating",
}) {
  const [hovered, setHovered] = useState(0);

  const sizeMap = { sm: 18, md: 24, lg: 32 };
  const px      = sizeMap[size] || 24;

  const active  = readOnly ? value : (hovered || value);

  function handleClick(star) {
    if (!readOnly && onChange) onChange(star);
  }

  function handleKey(e, star) {
    if (!readOnly && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleClick(star);
    }
  }

  return (
    <div
      className={`star-rating star-${size}`}
      role={readOnly ? "img" : "group"}
      aria-label={`${label}: ${value || 0} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= active ? "star-filled" : "star-empty"} ${readOnly ? "star-readonly" : "star-interactive"}`}
          style={{ fontSize: px, lineHeight: 1 }}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onKeyDown={(e) => handleKey(e, star)}
          tabIndex={readOnly ? -1 : 0}
          role={readOnly ? "presentation" : "radio"}
          aria-checked={star === value}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
      {!readOnly && value > 0 && (
        <span className="star-value-label">{value}/5</span>
      )}
      {readOnly && value > 0 && (
        <span className="star-value-label">{value.toFixed(1)}</span>
      )}
      {readOnly && value === 0 && (
        <span className="star-value-label text-muted">No ratings yet</span>
      )}
    </div>
  );
}
