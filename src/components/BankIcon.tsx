"use client";

import { useState } from "react";
import { bankIconPath } from "@/lib/vn-banks";

export function BankIcon({ code, name }: { code: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const src = bankIconPath(code);
  if (broken) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[10px] font-bold text-slate-600">
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
      className="h-10 w-10 shrink-0 rounded-lg object-contain"
      onError={() => setBroken(true)}
    />
  );
}
