"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CaptchaData {
  id: string;
  question: string;
}

interface CaptchaInputProps {
  /** Gọi mỗi khi giá trị hợp lệ → chuỗi rỗng khi chưa verify */
  onVerify: (token: string) => void;
  /** Cho phép submit khi token non-empty */
  disabled?: boolean;
  /** Class cho ô nhập */
  inputClassName?: string;
}

export function CaptchaInput({
  onVerify,
  disabled,
  inputClassName = "input",
}: CaptchaInputProps) {
  const [data, setData] = useState<CaptchaData | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [verified, setVerified] = useState(false);
  const onVerifyRef = useRef(onVerify);
  const verifyGenRef = useRef(0);
  const verifyingRef = useRef(false);

  onVerifyRef.current = onVerify;

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setAnswer("");
    setVerified(false);
    onVerifyRef.current("");
    try {
      const res = await fetch("/api/captcha");
      const json = (await res.json()) as CaptchaData & { error?: string };
      if (!res.ok || !json.question || typeof json.id !== "string") {
        setErr(json.error || "Không tải được mã bảo vệ");
        setData(null);
        return;
      }
      setData({ id: json.id, question: json.question });
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

  const runVerify = useCallback(async () => {
    if (verified || disabled || !data) return;
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    verifyGenRef.current += 1;
    const gen = verifyGenRef.current;
    setErr("");
    try {
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id, answer }),
      });
      const json = (await res.json()) as { ok: boolean; reason?: string; consumeToken?: string };
      if (gen !== verifyGenRef.current) return;
      if (json.ok && json.consumeToken) {
        setVerified(true);
        onVerifyRef.current(json.consumeToken);
        setErr("");
      } else {
        setErr(json.reason || "Kết quả không đúng");
        setVerified(false);
        onVerifyRef.current("");
        setAnswer("");
        void load();
      }
    } catch {
      if (gen !== verifyGenRef.current) return;
      setErr("Lỗi xác minh. Thử lại.");
      setVerified(false);
      onVerifyRef.current("");
      setAnswer("");
      void load();
    } finally {
      verifyingRef.current = false;
    }
  }, [verified, disabled, data, answer, load]);

  const runVerifyRef = useRef(runVerify);
  runVerifyRef.current = runVerify;

  // Auto-verify sau khi người dùng ngừng gõ ~700ms
  useEffect(() => {
    if (!data || answer.trim() === "" || verified || disabled) return;
    const t = setTimeout(() => {
      void runVerifyRef.current();
    }, 700);
    return () => clearTimeout(t);
  }, [answer, data, verified, disabled]);

  const isVerified = verified && Boolean(data && !err);

  return (
    <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>
      <div
        style={{
          width: "100%",
          padding: "var(--space-3, 0.75rem)",
          borderRadius: "var(--radius-xl, 0.75rem)",
          border: `1.5px solid ${err ? "var(--error)" : isVerified ? "var(--success)" : "var(--border-default, #e2e8f0)"}`,
          background: "linear-gradient(145deg, #fff 0%, hsl(160, 35%, 97%) 100%)",
          boxShadow: "0 6px 20px rgba(13, 61, 69, 0.07)",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-2, 0.5rem)",
        }}>
          <span style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}>
            Mã bảo vệ
          </span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || disabled}
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
              transition: "background 0.15s",
            }}
            title="Làm mới phép toán"
          >
            {loading ? "Đang tải…" : "🔄 Đổi bài"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {loading && !data ? (
            <span style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              fontFamily: "ui-monospace, monospace",
            }}>
              Đang tải…
            </span>
          ) : data ? (
            <span style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}>
              {data.question}
            </span>
          ) : null}

          <input
            type="text"
            inputMode="numeric"
            pattern="-?[0-9]*"
            className={inputClassName}
            placeholder="?"
            value={answer}
            maxLength={3}
            autoComplete="off"
            disabled={disabled || loading}
            onChange={(e) => {
              verifyGenRef.current += 1;
              const v = e.target.value.replace(/[^0-9-]/g, "");
              setVerified(false);
              onVerifyRef.current("");
              setAnswer(v);
            }}
            onBlur={() => {
              if (answer.trim()) void runVerify();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void runVerify();
              }
            }}
            style={{
              width: "100px",
              textAlign: "center",
              letterSpacing: "0.1em",
              fontSize: "1.25rem",
              fontWeight: 700,
              fontFamily: "ui-monospace, monospace",
              borderColor: err ? "var(--error)" : isVerified ? "var(--success)" : undefined,
              background: isVerified ? "hsl(142, 55%, 96%)" : undefined,
              padding: "0.5rem 0.75rem",
              minHeight: "48px",
            }}
          />
        </div>
      </div>

      {err ? (
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--error-text, #ef4444)", textAlign: "center" }}>
          {err}
        </p>
      ) : isVerified ? (
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--success-text, #22c55e)", fontWeight: 600, textAlign: "center" }}>
          ✓ Đã xác minh
        </p>
      ) : (
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Nhập kết quả phép tính (có thể là số âm), rồi nhấn Enter hoặc chờ vài giây.
        </p>
      )}
    </div>
  );
}
