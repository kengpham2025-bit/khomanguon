import Link from "next/link";
import { IconGrid, IconStore, IconShieldCheck, IconFileText, IconSettings } from "@/components/Icons";

export default function AdminHomePage() {
  const cards = [
    {
      href: "/admin/settings",
      icon: <IconSettings size={22} />,
      bg: "#f0fdf4",
      color: "var(--brand-green)",
      title: "Cài đặt hệ thống",
      desc: "Cấu hình PayOS, email, OAuth, Turnstile, AI…",
    },
    {
      href: "/admin/menus",
      icon: <IconGrid size={22} />,
      bg: "var(--brand-blue-light)",
      color: "var(--brand-blue)",
      title: "Quản lý menu",
      desc: "Quản lý menu cha / con hiển thị trên header.",
    },
    {
      href: "/admin/seller",
      icon: <IconStore size={22} />,
      bg: "var(--brand-green-light)",
      color: "var(--brand-green)",
      title: "Duyệt đăng ký bán hàng",
      desc: "Xem và duyệt / từ chối đơn bán hàng.",
    },
    {
      href: "/admin/kyc",
      icon: <IconShieldCheck size={22} />,
      bg: "#fef3c7",
      color: "var(--brand-gold)",
      title: "Duyệt KYC CCCD",
      desc: "Xác minh danh tính người bán — tích xanh.",
    },
    {
      href: "/admin/news",
      icon: <IconFileText size={22} />,
      bg: "#ede9fe",
      color: "var(--brand-accent)",
      title: "Tin tức — nhập URL, biên tập AI",
      desc: "Thu thập bài viết từ URL, AI biên tập lại.",
    },
  ];

  return (
    <div>
      <h1 className="page-title">Quản trị</h1>
      <p className="page-desc">Không có menu hay sản phẩm mẫu — chỉ dữ liệu bạn tạo trong hệ thống.</p>
      <div className="grid sm\:grid-2 gap-4" style={{ marginTop: "var(--space-8)" }}>
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="admin-dash-card">
            <div className="admin-dash-icon" style={{ background: c.bg, color: c.color }}>
              {c.icon}
            </div>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
