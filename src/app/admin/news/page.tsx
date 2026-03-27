"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  source_url: string | null;
  seo_keywords: string | null;
  created_at: number;
  published_at: number | null;
};

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [url, setUrl] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/news");
    if (!res.ok) return;
    const d = (await res.json()) as { posts?: Post[] };
    setPosts(d.posts ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function ingest(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), publish: publishNow }),
      });
      const d = (await res.json()) as { error?: string; ok?: boolean; slug?: string };
      if (!res.ok) { setMsg(d.error || "Lỗi"); return; }
      setMsg(`Đã lưu bài (slug: ${d.slug}).`);
      setUrl("");
      await load();
    } catch { setMsg("Lỗi mạng"); }
    finally { setLoading(false); }
  }

  async function setStatus(id: string, status: "draft" | "published") {
    const res = await fetch(`/api/admin/news/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load();
  }

  return (
    <div>
      <h1 className="page-title">Tin tức</h1>
      <p className="page-desc">
        Dán URL bài viết ngoài — hệ thống tải nội dung, AI biên tập lại văn bản, gợi ý từ khóa SEO và giữ nguyên đường
        dẫn ảnh từ trang nguồn. Bài mới mặc định nháp nếu bạn bỏ chọn xuất bản.
      </p>

      <form onSubmit={ingest} className="admin-card form-space" style={{ marginTop: "var(--space-8)", maxWidth: 600 }}>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>URL bài viết</label>
        <input
          className="input"
          style={{ borderRadius: "var(--radius-xl)" }}
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          type="url"
        />
        <label className="flex items-center gap-2" style={{ fontSize: "0.875rem", color: "var(--text-secondary)", cursor: "pointer" }}>
          <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
          Xuất bản ngay (hiện trên /tin-tuc)
        </label>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Đang xử lý…" : "Thu thập & biên tập AI"}
        </button>
        {msg ? <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{msg}</p> : null}
      </form>

      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "var(--space-12)" }}>Bài đã lưu</h2>
      <div className="admin-list" style={{ marginTop: "var(--space-4)" }}>
        {posts.map((p) => (
          <div key={p.id} className="admin-item">
            <div>
              <p style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.title}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                <span className={`badge ${p.status === "published" ? "badge-success" : "badge-neutral"}`}>
                  {p.status === "published" ? "Đã đăng" : "Nháp"}
                </span>
                {" · "}
                <Link href={`/tin-tuc/${p.slug}`} className="link-brand" target="_blank">
                  /tin-tuc/{p.slug}
                </Link>
              </p>
            </div>
            <div className="flex gap-2">
              {p.status === "draft" ? (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(p.id, "published")}>Xuất bản</button>
              ) : (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus(p.id, "draft")}>Gỡ xuống nháp</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {posts.length === 0 ? <p style={{ marginTop: "var(--space-4)", fontSize: "0.875rem", color: "var(--text-muted)" }}>Chưa có bài.</p> : null}
    </div>
  );
}
