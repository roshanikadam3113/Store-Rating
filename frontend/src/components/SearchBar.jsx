import { useEffect, useRef, useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Search stores by name" }) {
  const [value, setValue] = useState("");
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function handleChange(event) {
    const nextValue = event.target.value;
    setValue(nextValue);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => onSearch(nextValue.trim()), 300);
  }

  function handleClear() {
    window.clearTimeout(timerRef.current);
    setValue("");
    onSearch("");
  }

  return (
    <div className="search-bar">
      <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      <input
        id="store-search"
        type="search"
        className="search-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search stores by name"
        autoComplete="off"
      />
      {value && (
        <button
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear store search"
          type="button"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      )}
    </div>
  );
}
