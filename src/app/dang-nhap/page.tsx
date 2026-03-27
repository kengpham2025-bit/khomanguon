import { Suspense } from "react";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <PageSpinner label="Đang tải form…" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
