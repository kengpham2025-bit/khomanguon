"use client";

/** Full-page loading overlay — hiển thị vòng xoay ở giữa màn hình khi thao tác đang xử lý. */
export function LoadingOverlay({ label = "Đang xử lý…" }: { label?: string }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-overlay__inner">
        <div className="loading-ring">
          <div className="loading-ring__arc loading-ring__arc--1" />
          <div className="loading-ring__arc loading-ring__arc--2" />
        </div>
        <p className="loading-overlay__label">{label}</p>
      </div>
    </div>
  );
}
