type PageSpinnerProps = {
  label?: string;
  className?: string;
};

export function PageSpinner({ label = "Đang tải…", className = "" }: PageSpinnerProps) {
  return (
    <div
      className={`spinner-wrap ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/mark.svg"
        alt=""
        width={44}
        height={44}
        className="spinner-wrap__mark"
        aria-hidden
      />
      <div className="spinner" aria-hidden />
      <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>{label}</p>
    </div>
  );
}
