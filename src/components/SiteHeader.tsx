"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

type MenuChild = { id: string; label: string; href: string; sort_order: number };
type MenuItem = MenuChild & { children: MenuChild[] };

export function SiteHeader() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    fetch("/api/menus")
      .then((r) => r.json() as Promise<{ menus?: MenuItem[] }>)
      .then((d) => setMenus(d.menus ?? []))
      .catch(() => setMenus([]));
  }, []);

  return (
    <>
      <div className="bg-[#0f2d4a] py-2 text-center font-ui text-xs text-white">
        Mã nguồn &amp; tài khoản số — Đăng ký miễn phí, kích hoạt sau khi xác minh email.
      </div>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 font-ui backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 outline-none ring-brand-blue/30 focus-visible:ring-2 rounded-lg">
            <BrandLogo iconSize={36} wordmarkClassName="text-lg lg:text-xl" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {menus.length === 0 ? (
              <span className="px-3 text-sm text-slate-400">Admin thêm menu tại /admin/menus</span>
            ) : (
              menus.map((m) => (
                <div
                  key={m.id}
                  className="relative"
                  onMouseEnter={() => m.children?.length && setOpen(m.id)}
                  onMouseLeave={() => setOpen(null)}
                >
                  <Link
                    href={m.href}
                    className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {m.label}
                    {m.children?.length ? <ChevronDown className="h-4 w-4 opacity-60" /> : null}
                  </Link>
                  {m.children?.length ? (
                    <div
                      className={`absolute left-0 top-full min-w-[200px] rounded-lg border border-slate-100 bg-white py-2 shadow-lg ${open === m.id ? "block" : "hidden"}`}
                    >
                      {m.children.map((c) => (
                        <Link
                          key={c.id}
                          href={c.href}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/dang-nhap" className="text-sm font-medium text-slate-700 hover:text-brand-blue">
              Đăng nhập
            </Link>
            <Link
              href="/dang-ky"
              className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105"
            >
              Đăng ký
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 lg:hidden"
            aria-label="Menu"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>

        {mobile ? (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              {menus.map((m) => (
                <div key={m.id} className="border-b border-slate-50 py-2">
                  <Link href={m.href} className="font-medium">
                    {m.label}
                  </Link>
                  {m.children?.map((c) => (
                    <Link key={c.id} href={c.href} className="mt-1 block pl-3 text-sm text-slate-600">
                      {c.label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link href="/dang-nhap" className="py-2 text-sm">
                Đăng nhập
              </Link>
              <Link href="/dang-ky" className="rounded-full bg-brand-green py-3 text-center text-sm font-semibold text-white">
                Đăng ký
              </Link>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
