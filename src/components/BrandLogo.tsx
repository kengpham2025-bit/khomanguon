"use client";

type BrandLogoProps = {
  /** Kích thước ô vuông (px) */
  iconSize?: number;
  wordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

/** Xanh lá phẳng, hiện đại (phong cách tương tự các logo thương mại điện tử VN) */
const MARK_GREEN = "#22c55e";

/**
 * Logo: ô bo góc xanh + chữ K trắng + wordmark xanh dương (K + "ho Mã Nguồn" = Kho Mã Nguồn).
 * Font chữ K dùng biến CSS --font-heading (Plus Jakarta Sans).
 */
export function BrandLogo({
  iconSize = 40,
  wordmark = true,
  className = "",
  wordmarkClassName = "text-xl md:text-2xl",
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`} role="img" aria-label="Kho Mã Nguồn">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        <title>Kho Mã Nguồn</title>
        <rect x="3" y="3" width="42" height="42" rx="12" fill={MARK_GREEN} />
        <path
          fill="white"
          d="M14 12h5.2v9.2l6.3-9.2h6.1l-7.8 10.4L32.2 36h-6.1l-6.4-9.6-2.5 3.4V36H14V12z"
        />
      </svg>
      {wordmark ? (
        <span
          aria-hidden
          className={`font-heading font-extrabold tracking-tight text-brand-blue ${wordmarkClassName} select-none`}
        >
          <span className="lowercase">ho</span>
          <span className="[font-variant-numeric:normal]"> Mã Nguồn</span>
        </span>
      ) : null}
    </div>
  );
}
