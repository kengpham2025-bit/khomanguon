"use client";

import { useState } from "react";
import { bankIconPath } from "@/lib/vn-banks";

export function BankIcon({ code, name }: { code: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const src = bankIconPath(code);
  if (broken) {
    return (
      <span style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 40, height: 40, flexShrink: 0,
        borderRadius: "var(--radius-lg)", background: "var(--surface-raised)",
        fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)"
      }}>
        {code}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={40}
      height={40}
      style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "var(--radius-lg)", objectFit: "contain" }}
      onError={() => setBroken(true)}
    />
  );
}
