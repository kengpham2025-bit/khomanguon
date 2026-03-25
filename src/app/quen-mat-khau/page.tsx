import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Quên mật khẩu - Kho Mã Nguồn",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
