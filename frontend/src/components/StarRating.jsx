import { useRef, useState } from "react";

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  disabled = false,
  size = "md",
  label = "Rating",
}) {
  const [hovered, setHovered] = useState(0);
  const starRefs = useRef([]);
  const selected = Number.isFinite(Number(value)) ? Number(value) : 0;
  const active = readOnly ? selected : (hovered || selected);
  const sizeMap = { sm: 18, md: 24, lg: 32 };
  const px = sizeMap[size] || sizeMap.md;

  function handleKeyDown(event, currentStar) {
    if (readOnly || disabled || !onChange) return;

    let nextStar;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      nextStar = currentStar === 5 ? 1 : currentStar + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      nextStar = currentStar === 1 ? 5 : currentStar - 1;
    } else if (event.key === "Home") {
      nextStar = 1;
    } else if (event.key === "End") {
      nextStar = 5;
    } else {
      return;
    }

    event.preventDefault();
    onChange(nextStar);
    starRefs.current[nextStar - 1]?.focus();
  }

  if (readOnly) {
    return (
      <div
        className={`star-rating star-${size}`}
        role="img"
        aria-label={`${label}: ${selected > 0 ? `${selected.toFixed(1)} out of 5` : "No ratings yet"}`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= active ? "star-filled" : "star-empty"} star-readonly`}
            style={{ fontSize: px, lineHeight: 1 }}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
        <span className={`star-value-label${selected === 0 ? " text-muted" : ""}`} aria-hidden="true">
          {selected > 0 ? selected.toFixed(1) : "No ratings yet"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`star-rating star-${size}`}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          ref={(element) => { starRefs.current[star - 1] = element; }}
          type="button"
          className={`star star-button ${star <= active ? "star-filled" : "star-empty"} star-interactive`}
          style={{ fontSize: px, lineHeight: 1 }}
          role="radio"
          aria-checked={star === selected}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          tabIndex={star === selected || (selected === 0 && star === 1) ? 0 : -1}
          disabled={disabled}
          onClick={() => onChange?.(star)}
          onKeyDown={(event) => handleKeyDown(event, star)}
          onMouseEnter={() => !disabled && setHovered(star)}
        >
          ★
        </button>
      ))}
      <span className="star-value-label" aria-live="polite">
        {selected > 0 ? `${selected}/5 selected` : "Choose 1–5"}
      </span>
    </div>
  );
}
