"use client";

type SiteLogoProps = {
  height?: number;
  className?: string;
  showTagline?: boolean;
  variant?: "light" | "dark";
  /** @deprecated Không còn ảnh raster; giữ prop để tương thích gọi cũ */
  priority?: boolean;
};

/**
 * Lockup SVG: vòng tròn &lt;|&gt; + wordmark — không phụ thuộc PNG/JPEG.
 */
function LogoMark({ size, variant }: { size: number; variant: "light" | "dark" }) {
  const shadowOpacity = variant === "dark" ? 0.4 : 0.2;

  return (
    <span
      className="site-logo-mark-wrap"
      style={{
        display: "inline-flex",
        lineHeight: 0,
        flexShrink: 0,
        filter: `drop-shadow(0 2px 5px rgba(15, 23, 42, ${shadowOpacity}))`,
      }}
    >
      <svg
        className="site-logo-mark-svg"
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden
      >
        <rect width="44" height="44" rx="22" fill="#0d3d45" />
        <rect x="1" y="1" width="42" height="42" rx="21" fill="none" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" />
        <g stroke="#ffffff" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <polyline points="14,16 8,22 14,28" />
          <line x1="22" y1="15" x2="22" y2="29" />
          <polyline points="30,16 36,22 30,28" />
        </g>
      </svg>
    </span>
  );
}

export function SiteLogo({
  height = 40,
  className = "",
  showTagline = true,
  variant = "light",
}: SiteLogoProps) {
  const markSize = Math.round(height * 0.92);
  const titlePx = Math.max(13, Math.round(height * 0.36));
  const tagPx = Math.max(8, Math.round(height * 0.22));

  return (
    <span
      className={`site-logo site-logo--svg site-logo--${variant} ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
        lineHeight: 1.1,
        flexShrink: 0,
      }}
    >
      <LogoMark size={markSize} variant={variant} />
      <span
        className="site-logo-wordmark"
        lang="vi"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "0.18em",
          minWidth: 0,
        }}
      >
        <span className="site-logo-title" style={{ fontSize: titlePx }}>
          KHO MA NGUON
        </span>
        {showTagline ? (
          <span className="site-logo-tagline" style={{ fontSize: tagPx }}>
            CODE MARKETPLACE
          </span>
        ) : null}
      </span>
    </span>
  );
}
