import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="p-12 text-center">Đang tải…</p>}>
      <VerifyClient />
    </Suspense>
  );
}
