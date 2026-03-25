import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-12 text-center">Đang tải…</p>}>
      <LoginForm />
    </Suspense>
  );
}
