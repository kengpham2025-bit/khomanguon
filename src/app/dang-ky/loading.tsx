import { PageSpinner } from "@/components/ui/PageSpinner";

export default function Loading() {
  return (
    <div className="auth-page">
      <PageSpinner label="Đang mở trang đăng ký…" />
    </div>
  );
}
