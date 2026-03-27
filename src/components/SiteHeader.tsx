"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { IconMenu, IconX, IconChevronDown, IconSearch } from "@/components/Icons";
import { SiteLogo } from "@/components/SiteLogo";
import { filterNavMenus } from "@/lib/nav-config";
import { useAuthModal } from "@/components/AuthModal";

type MenuChild = { id: string; label: string; href: string; sort_order: number };
type MenuItem = MenuChild & { children: MenuChild[] };

export function SiteHeader() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [mobile, setMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { open: openAuth } = useAuthModal();

  useEffect(() => {
    fetch("/api/menus")
      .then((r) => r.json() as Promise<{ menus?: MenuItem[] }>)
      .then((d) => setMenus(filterNavMenus(d.menus ?? [])))
      .catch(() => setMenus([]));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      window.location.href = `/cua-hang?q=${encodeURIComponent(q)}`;
    } else {
      window.location.href = "/cua-hang";
    }
  }

  return (
    <>
      <div className="top-bar">
        <p className="top-bar-slogan" lang="vi">
          Mã nguồn, tài khoản và dịch vụ AI — uy tín, bảo mật, giao dịch an toàn
        </p>
      </div>
      <header className="site-header">
        <div className="site-header-inner">

          {/* Logo */}
          <Link href="/" className="header-logo" aria-label="Trang chủ">
            <SiteLogo height={56} clipToLayout layoutHeight={44} priority />
          </Link>

          {/* Search Bar */}
          <form className="header-search" onSubmit={handleSearch} role="search">
            <input
              ref={searchRef}
              type="search"
              className="header-search-input"
              placeholder="Tìm kiếm sản phẩm, mã nguồn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm sản phẩm"
            />
            <button type="submit" className="header-search-btn" aria-label="Tìm kiếm">
              <IconSearch size={18} strokeWidth={2.25} />
            </button>
          </form>

          {/* Desktop Nav */}
          <nav className="nav-desktop">
            {menus.map((m) => (
              <div key={m.id} className="nav-item" style={{ position: "relative" }}>
                <Link href={m.href} className="nav-link">
                  {m.label}
                  {m.children?.length ? <IconChevronDown size={15} /> : null}
                </Link>
                {m.children?.length ? (
                  <div className="nav-dropdown">
                    {m.children.map((c) => (
                      <Link key={c.id} href={c.href} className="nav-dropdown-link">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="nav-actions">
            <button type="button" className="header-action-link" onClick={() => openAuth("login")}>
              Đăng nhập
            </button>
            <button type="button" className="btn btn-primary btn-md" onClick={() => openAuth("register")}>
              Đăng ký
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="mobile-toggle"
            aria-label="Menu"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <IconX size={24} /> : <IconMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobile ? (
          <div className="mobile-menu">
            {/* Mobile search */}
            <form className="header-search header-search-mobile" onSubmit={handleSearch}>
              <input
                type="search"
                className="header-search-input"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Tìm kiếm"
              />
              <button type="submit" className="header-search-btn" aria-label="Tìm">
                <IconSearch size={18} />
              </button>
            </form>

            {menus.map((m) => (
              <div key={m.id} className="mobile-menu-item">
                <Link
                  href={m.href}
                  className="mobile-menu-link"
                  onClick={() => setMobile(false)}
                >
                  {m.label}
                </Link>
                {m.children?.map((c) => (
                  <Link
                    key={c.id}
                    href={c.href}
                    className="mobile-menu-sub"
                    onClick={() => setMobile(false)}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="mobile-menu-divider" />
            <button
              type="button"
              className="mobile-menu-login"
              onClick={() => { openAuth("login"); setMobile(false); }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => { openAuth("register"); setMobile(false); }}
            >
              Đăng ký
            </button>
          </div>
        ) : null}
      </header>
    </>
  );
}
