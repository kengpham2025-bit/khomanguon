"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CaptchaIcon = { key: string; svg: string };

interface CaptchaData {
  id: string;
  prompt: string;
  icons: CaptchaIcon[];
}

interface CaptchaInputProps {
  onVerify: (token: string) => void;
  disabled?: boolean;
  /** Giữ prop để tương thích form cũ (modal/auth); captcha SVG không dùng làm input text */
  inputClassName?: string;
}

export function CaptchaInput({ onVerify, disabled }: CaptchaInputProps) {
  const [data, setData] = useState<CaptchaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [verified, setVerified] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const onVerifyRef = useRef(onVerify);
  const verifyGenRef = useRef(0);
  const verifyingRef = useRef(false);

  onVerifyRef.current = onVerify;

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setVerified(false);
    setPicking(null);
    setBusy(false);
    onVerifyRef.current("");
    try {
      const res = await fetch("/api/captcha");
      const json = (await res.json()) as CaptchaData & { error?: string };
      if (!res.ok || !json.prompt || !Array.isArray(json.icons) || typeof json.id !== "string") {
        setErr(json.error || "Không tải được mã bảo vệ");
        setData(null);
        return;
      }
      if (json.icons.length < 2) {
        setErr("Dữ liệu captcha không hợp lệ");
        setData(null);
        return;
      }
      setData({ id: json.id, prompt: json.prompt, icons: json.icons });
    } catch {
      setErr("Không tải được mã bảo vệ");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submitPick = useCallback(
    async (key: string) => {
      if (verified || disabled || !data || verifyingRef.current) return;
      verifyingRef.current = true;
      setBusy(true);
      verifyGenRef.current += 1;
      const gen = verifyGenRef.current;
      setPicking(key);
      setErr("");
      try {
        const res = await fetch("/api/captcha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.id, answer: key }),
        });
        const json = (await res.json()) as { ok: boolean; reason?: string; consumeToken?: string };
        if (gen !== verifyGenRef.current) return;
        if (json.ok && json.consumeToken) {
          setVerified(true);
          onVerifyRef.current(json.consumeToken);
          setErr("");
        } else {
          setErr(json.reason || "Chưa đúng biểu tượng");
          setVerified(false);
          onVerifyRef.current("");
          void load();
        }
      } catch {
        if (gen !== verifyGenRef.current) return;
        setErr("Lỗi xác minh. Thử lại.");
        setVerified(false);
        onVerifyRef.current("");
        void load();
      } finally {
        verifyingRef.current = false;
        setBusy(false);
        setPicking(null);
      }
    },
    [verified, disabled, data, load],
  );

  const isVerified = verified && Boolean(data && !err);

  return (
    <div className="captcha-svg-root" style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>
      <div
        className={`captcha-svg-card ${err ? "captcha-svg-card--err" : ""} ${isVerified ? "captcha-svg-card--ok" : ""}`}
        style={{
          width: "100%",
          padding: "var(--space-3, 0.75rem)",
          borderRadius: "var(--radius-xl, 0.75rem)",
          border: `1.5px solid ${err ? "var(--error)" : isVerified ? "var(--success)" : "var(--border-default, #e2e8f0)"}`,
          background: "linear-gradient(145deg, #fff 0%, hsl(160, 35%, 97%) 100%)",
          boxShadow: "0 6px 20px rgba(13, 61, 69, 0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-2, 0.5rem)",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Mã bảo vệ
          </span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || disabled}
            className="captcha-svg-refresh"
            style={{
              background: "none",
              border: "none",
              cursor: loading || disabled ? "not-allowed" : "pointer",
              color: "var(--brand-green, #10b981)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              opacity: loading || disabled ? 0.5 : 1,
              padding: "2px 6px",
              borderRadius: "6px",
            }}
            title="Làm mới"
          >
            {loading ? "Đang tải…" : "Đổi bài"}
          </button>
        </div>

        {data ? (
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              fontFamily: "var(--font-ui)",
              lineHeight: 1.4,
            }}
          >
            {data.prompt}
          </p>
        ) : null}

        <div
          className="captcha-svg-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.65rem",
          }}
        >
          {loading && !data ? (
            <span style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Đang tải…
            </span>
          ) : null}
          {data?.icons.map((icon, i) => (
            <button
              key={`${data.id}-${icon.key}-${i}`}
              type="button"
              disabled={disabled || loading || verified || busy}
              aria-label={`Lựa chọn ${i + 1}`}
              onClick={() => void submitPick(icon.key)}
              className="captcha-svg-tile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "4.5rem",
                padding: "0.5rem",
                borderRadius: "var(--radius-lg, 0.5rem)",
                border: "2px solid hsl(160, 35%, 78%)",
                background: "#fff",
                cursor: disabled || loading || verified || busy ? "not-allowed" : "pointer",
                opacity: disabled || loading || verified || busy ? 0.65 : 1,
                transition: "border-color 0.15s, box-shadow 0.15s, transform 0.1s",
              }}
              onMouseDown={(e) => {
                if (!disabled && !loading && !verified && !busy) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
              }}
            >
              {picking === icon.key ? (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>…</span>
              ) : (
                <span
                  className="captcha-svg-tile-inner"
                  style={{ lineHeight: 0 }}
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {err ? (
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--error-text, #ef4444)", textAlign: "center" }}>
          {err}
        </p>
      ) : isVerified ? (
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--success-text, #22c55e)", fontWeight: 600, textAlign: "center" }}>
          Đã xác minh
        </p>
      ) : (
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Chạm vào đúng biểu tượng theo gợi ý phía trên (SVG).
        </p>
      )}
    </div>
  );
}
