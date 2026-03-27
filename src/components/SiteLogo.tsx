"use client";

type SiteLogoProps = {
  height?: number;
  className?: string;
  /** Ảnh PNG đã gộp tagline; prop giữ để tương thích gọi cũ */
  showTagline?: boolean;
  variant?: "light" | "dark";
  priority?: boolean;
  /**
   * Header: giữ chiều cao ô logo trong flex = `layoutHeight` (không nới thanh header),
   * ảnh `height` có thể lớn hơn và hiển thị phóng (overflow visible).
   */
  clipToLayout?: boolean;
  /** Chiều cao slot trong layout (px), mặc định khớp nút tìm desktop ~44 */
  layoutHeight?: number;
};

/**
 * Logo lockup từ /public/brand (cập nhật file PNG là đổi giao diện toàn site).
 */
export function SiteLogo({
  height = 40,
  className = "",
  variant = "light",
  priority = false,
  clipToLayout = false,
  layoutHeight = 44,
}: SiteLogoProps) {
  /** Tăng số khi đổi file PNG để tránh cache CDN/trình duyệt */
  const v = "8";
  const src =
    variant === "dark"
      ? `/brand/logo-full-dark.png?v=${v}`
      : `/brand/logo-full-light.png?v=${v}`;

  return (
    <span
      className={`site-logo site-logo--raster site-logo--${variant} ${clipToLayout ? "site-logo--layout-slot" : ""} ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 0,
        flexShrink: 0,
        ...(clipToLayout
          ? {
              height: layoutHeight,
              maxHeight: layoutHeight,
              overflow: "visible",
            }
          : {}),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- logo cục bộ, kích thước theo height prop */}
      <img
        src={src}
        alt="Kho Mã Nguồn — CODE MARKETPLACE"
        style={{
          height,
          width: "auto",
          maxWidth: "min(100%, 280px)",
          objectFit: "contain",
          display: "block",
        }}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </span>
  );
}
