import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p style={{ padding: "var(--space-12)", textAlign: "center" }}>Đang tải…</p>}>
      <VerifyClient />
    </Suspense>
  );
}
