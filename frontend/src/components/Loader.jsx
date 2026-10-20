// frontend/src/components/Loader.jsx
// Reusable loading spinner for NexaPrime Store Rating Application

/**
 * Props:
 *  fullPage — boolean: center on the full viewport (default false)
 *  message  — optional loading message string
 *  size     — "sm" | "md" | "lg" (default "md")
 */
export default function Loader({ fullPage = false, message = "Loading…", size = "md" }) {
  const sizeMap = { sm: 20, md: 36, lg: 52 };
  const px      = sizeMap[size] || 36;

  const spinner = (
    <div className="loader-wrapper" style={fullPage ? { minHeight: "60vh" } : {}}>
      <svg
        className="spinner"
        width={px}
        height={px}
        viewBox="0 0 50 50"
        aria-label="Loading"
        role="status"
      >
        <circle
          cx="25" cy="25" r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80 40"
        />
      </svg>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );

  return spinner;
}
