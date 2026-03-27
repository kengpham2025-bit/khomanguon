"use client";

import Link from "next/link";
import { IconMail, IconFileText } from "@/components/Icons";
import { SiteLogo } from "@/components/SiteLogo";
import { useAuthModal } from "@/components/AuthModal";

export function SiteFooter() {
  const { open: openAuth } = useAuthModal();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="flex flex-col gap-3 items-start">
            <SiteLogo height={48} />
            <p style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Nền tảng giao dịch mã nguồn, tài khoản MMO và dịch vụ AI đáng tin cậy
            </p>
          </div>
        </div>
        <div>
          <p className="footer-heading">Khách hàng</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <Link href="/tin-tuc" className="footer-link">
              <IconFileText size={14} style={{ display: "inline", marginRight: "0.375rem" }} /> Tin tức
            </Link>
            <button type="button" className="footer-link" style={{ background: "none", border: "none", padding: 0, textAlign: "left" }} onClick={() => openAuth("register")}>Đăng ký bán hàng</button>
          </nav>
        </div>
        <div>
          <p className="footer-heading">Liên hệ</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <a href="mailto:support@khomanguon.io.vn" className="footer-link">
              <IconMail size={14} style={{ display: "inline", marginRight: "0.375rem" }} /> support@khomanguon.io.vn
            </a>
            <button type="button" className="footer-link" style={{ background: "none", border: "none", padding: 0, textAlign: "left" }} onClick={() => openAuth("register")}>Đăng ký thành viên</button>
            <button type="button" className="footer-link" style={{ background: "none", border: "none", padding: 0, textAlign: "left" }} onClick={() => openAuth("login")}>Đăng nhập</button>
          </nav>
        </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} KHOMANGUON. Mọi quyền được bảo lưu.</p>
    </footer>
  );
}
