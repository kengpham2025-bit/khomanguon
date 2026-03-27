"use client";

import { useId } from "react";

type ModalSurfaceProps = {
  children: React.ReactNode;
  className?: string;
};

/** Viền bo góc bằng SVG (gradient), dùng cho dialog / popup */
export function ModalSurface({ children, className = "" }: ModalSurfaceProps) {
  const gid = useId().replace(/:/g, "");
  const gradId = `modal-grad-${gid}`;

  return (
    <div className={`modal-surface ${className}`.trim()}>
      <svg className="modal-surface__ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#2d7cf1" />
          </linearGradient>
        </defs>
        <rect
          x="1.25"
          y="1.25"
          width="97.5"
          height="97.5"
          rx="6.5"
          ry="6.5"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="modal-surface__body">{children}</div>
    </div>
  );
}
