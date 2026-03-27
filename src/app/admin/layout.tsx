import Link from "next/link";
import { IconGrid, IconStore, IconShieldCheck, IconFileText, IconGlobe, IconSettings } from "@/components/Icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link href="/admin" className="admin-logo">
            <span className="flex items-center gap-2">
              <IconSettings size={18} />
              Admin Panel
            </span>
          </Link>
          <Link href="/admin/menus" className="admin-nav-link">
            <span className="flex items-center gap-1">
              <IconGrid size={14} /> Menu
            </span>
          </Link>
          <Link href="/admin/settings" className="admin-nav-link">
            <span className="flex items-center gap-1">
              <IconSettings size={14} /> Cài đặt
            </span>
          </Link>
          <Link href="/admin/seller" className="admin-nav-link">
            <span className="flex items-center gap-1">
              <IconStore size={14} /> Đơn bán hàng
            </span>
          </Link>
          <Link href="/admin/kyc" className="admin-nav-link">
            <span className="flex items-center gap-1">
              <IconShieldCheck size={14} /> KYC
            </span>
          </Link>
          <Link href="/admin/news" className="admin-nav-link">
            <span className="flex items-center gap-1">
              <IconFileText size={14} /> Tin tức
            </span>
          </Link>
          <Link href="/" className="admin-back">
            <span className="flex items-center gap-1">
              <IconGlobe size={14} /> Về trang chủ
            </span>
          </Link>
        </div>
      </div>
      <div className="admin-body">{children}</div>
    </div>
  );
}
