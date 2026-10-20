// frontend/src/components/SearchBar.jsx
import { useState, useEffect, useRef } from "react";

/**
 * SearchBar
 * Props:
 *  onSearch(term) — called with debounced value (300ms)
 *  placeholder    — input placeholder text
 */
export default function SearchBar({ onSearch, placeholder = "Search stores by name…" }) {
  const [value, setValue] = useState("");
  const timerRef          = useRef(null);

  // Debounce: wait 300ms after typing stops before calling onSearch
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [value, onSearch]);

  function handleClear() {
    setValue("");
    onSearch("");
  }

  return (
    <div className="search-bar">
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        id="store-search"
        type="search"
        className="search-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search stores"
        autoComplete="off"
      />
      {value && (
        <button
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}
