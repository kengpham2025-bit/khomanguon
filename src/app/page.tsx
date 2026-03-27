"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  IconArrowRight,
  IconAlertTriangle,
  IconBadgeCheck,
  IconChevronLeft,
  IconChevronRight,
  IconPhone,
  IconMail,
  IconShieldCheck,
  IconStar,
  IconEye,
  IconTag,
  IconStore,
} from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuthModal } from "@/components/AuthModal";

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number;
  seller_name: string;
  kycWarning: boolean;
  category_slug: string | null;
};

type MenuItem = {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  children: { id: string; label: string; href: string; sort_order: number }[];
};

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

const BANNERS = [
  { src: "/banners/banner1-cho-ma-nguon.html", alt: "Kho Mã Nguồn" },
  { src: "/banners/banner2-tai-khoan-ai.html", alt: "Tài khoản AI & Game" },
  { src: "/banners/banner3-mmo.html", alt: "Đăng ký bán hàng", authAction: "register" as const },
  { src: "/banners/banner4-youtube.html", alt: "Tài khoản YouTube" },
  { src: "/banners/banner5-tiktok.html", alt: "Tài khoản TikTok" },
];

function HeroSlider({ openAuth }: { openAuth: (mode: "login" | "register") => void }) {
  const [idx, setIdx] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(0);
  const total = BANNERS.length;

  const next = useCallback(() => setIdx((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setViewportW(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  const trackStyle = { transform: `translate3d(-${idx * viewportW}px, 0, 0)` };

  return (
    <div className="store-slider" ref={viewportRef}>
      <div className="store-slider-track" style={trackStyle}>
        {BANNERS.map((b, i) => (
          <div
            key={i}
            className="store-slider-slide"
            style={
              viewportW > 0
                ? { width: viewportW, flex: "0 0 auto" }
                : { flex: "0 0 100%" }
            }
          >
            {"authAction" in b ? (
              <button
                type="button"
                className="store-slider-html-wrap store-slider-slide-btn"
                onClick={() => openAuth(b.authAction!)}
                aria-label={b.alt}
              >
                <iframe
                  src={b.src}
                  title={b.alt}
                  className="store-slider-iframe"
                  loading={i === 0 ? "eager" : "lazy"}
                  allow="autoplay; fullscreen"
                  style={{ pointerEvents: "none" }}
                />
                <div className="store-slider-html-overlay" />
              </button>
            ) : (
              <div className="store-slider-html-wrap">
                <iframe
                  src={b.src}
                  title={b.alt}
                  className="store-slider-iframe"
                  loading={i === 0 ? "eager" : "lazy"}
                  allow="autoplay; fullscreen"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="store-slider-arrow store-slider-prev" onClick={prev} aria-label="Trước">
        <IconChevronLeft size={22} />
      </button>
      <button type="button" className="store-slider-arrow store-slider-next" onClick={next} aria-label="Sau">
        <IconChevronRight size={22} />
      </button>
      <div className="store-slider-dots">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`store-slider-dot ${i === idx ? "store-slider-dot-active" : ""}`}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className={`store-card ${product.kycWarning ? "store-card-warn" : ""}`}>
      <Link href={`/cua-hang/${product.slug}`} className="store-card-img-link">
        <div className="store-card-img">
          <span className="store-card-img-placeholder">
            <IconStore size={36} color="var(--text-muted)" />
          </span>
          <div className="store-card-overlay">
            <span className="store-card-overlay-btn">
              <IconEye size={16} /> Xem
            </span>
          </div>
          {product.kycWarning ? (
            <span className="store-card-badge store-card-badge-warn">
              <IconAlertTriangle size={12} /> Chưa xác minh
            </span>
          ) : (
            <span className="store-card-badge store-card-badge-ok">
              <IconBadgeCheck size={12} /> Đã xác minh
            </span>
          )}
        </div>
      </Link>

      <div className="store-card-body">
        <Link href={`/cua-hang/${product.slug}`} className="store-card-title">
          {product.title}
        </Link>
        <p className="store-card-desc">{product.description || "—"}</p>

        <div className="store-card-meta">
          <span className="store-card-seller">
            <IconShieldCheck size={13} /> {product.seller_name}
          </span>
        </div>

        <div className="store-card-footer">
          <span className="store-card-price">{formatVnd(product.price_cents)}</span>
          <Link href={`/cua-hang/${product.slug}`} className="store-card-btn">
            Mua ngay <IconArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const { open: openAuth } = useAuthModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json() as Promise<{ products?: Product[] }>)
      .then((d) => setProducts(d.products ?? []))
      .catch(() => {});
    fetch("/api/menus")
      .then((r) => r.json() as Promise<{ menus?: MenuItem[] }>)
      .then((d) => setMenus(d.menus ?? []))
      .catch(() => {});
  }, []);

  const showcase = products.slice(0, 8);
  const topMenus = menus.filter((m) => !m.href.startsWith("/admin"));

  return (
    <>
      <SiteHeader />
      <main className="store-main">

        {/* ── Hero Slider ── */}
        <section className="store-hero-section">
          <div className="store-hero-inner">
            <HeroSlider openAuth={openAuth} />
          </div>
        </section>

        {/* ── Category Quick Nav ── */}
        {topMenus.length > 0 && (
          <section className="store-categories">
            <div className="container">
              <div className="store-categories-inner">
                {topMenus.slice(0, 8).map((m) => (
                  <Link key={m.id} href={m.href} className="store-cat-pill">
                    <IconTag size={15} />
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── USP Strip ── */}
        <section className="store-usp">
          <div className="container">
            <div className="store-usp-grid">
              <div className="store-usp-item">
                <IconShieldCheck size={22} color="var(--brand-green)" />
                <div>
                  <strong>Gian hàng uy tín</strong>
                  <span>Người bán được xác minh danh tính</span>
                </div>
              </div>
              <div className="store-usp-item">
                <IconPhone size={22} color="var(--brand-green)" />
                <div>
                  <strong>Hỗ trợ 24/7</strong>
                  <span>Luôn sẵn sàng giải đáp thắc mắc</span>
                </div>
              </div>
              <div className="store-usp-item">
                <IconStar size={22} color="var(--brand-green)" />
                <div>
                  <strong>Đánh giá thực</strong>
                  <span>Cộng đồng đánh giá minh bạch</span>
                </div>
              </div>
              <div className="store-usp-item">
                <IconMail size={22} color="var(--brand-green)" />
                <div>
                  <strong>Thanh toán an toàn</strong>
                  <span>Qua cổng PayOS, bảo mật cao</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="store-products-section">
          <div className="container">
            <div className="store-section-header">
              <div>
                <h2 className="store-section-title">
                  <IconTag size={22} color="var(--brand-green)" />
                  Sản phẩm nổi bật
                </h2>
                <p className="store-section-sub">Các sản phẩm được quan tâm nhiều nhất trên sàn</p>
              </div>
              <Link href="/cua-hang" className="store-section-more">
                Xem tất cả <IconArrowRight size={15} />
              </Link>
            </div>

            {showcase.length === 0 ? (
              <div className="store-empty">
                <IconStore size={48} color="var(--text-muted)" />
                <p>Chưa có sản phẩm nào trên sàn.</p>
                <button type="button" className="btn btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={() => openAuth("register")}>
                  Trở thành người bán
                </button>
              </div>
            ) : (
              <div className="store-products-grid">
                {showcase.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="store-cta-section">
          <div className="container">
            <div className="store-cta-inner">
              <div className="store-cta-text">
                <h2>Bạn có sản phẩm để bán?</h2>
                <p>Đăng ký gian hàng miễn phí, đăng sản phẩm và bắt đầu kiếm thu nhập ngay hôm nay.</p>
              </div>
              <div className="store-cta-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => openAuth("register")}>
                  Đăng ký bán hàng
                </button>
                <button type="button" className="btn store-btn-outline btn-lg" onClick={() => openAuth("login")}>
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
