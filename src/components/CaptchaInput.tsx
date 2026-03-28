"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CaptchaData {
  id: string;
  svg: string;
  length: number;
  prompt: string;
}

interface CaptchaInputProps {
  onVerify: (token: string) => void;
  disabled?: boolean;
  inputClassName?: string;
}

export function CaptchaInput({ onVerify, disabled, inputClassName = "input" }: CaptchaInputProps) {
  const [data, setData] = useState<CaptchaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [verified, setVerified] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const onVerifyRef = useRef(onVerify);
  const verifyGenRef = useRef(0);
  const verifyingRef = useRef(false);

  onVerifyRef.current = onVerify;

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setVerified(false);
    setCode("");
    setBusy(false);
    onVerifyRef.current("");
    try {
      const res = await fetch("/api/captcha");
      const json = (await res.json()) as CaptchaData & { error?: string };
      if (
        !res.ok ||
        typeof json.svg !== "string" ||
        !json.svg.trim() ||
        typeof json.id !== "string" ||
        typeof json.length !== "number"
      ) {
        setErr(json.error || "Không tải được mã bảo vệ");
        setData(null);
        return;
      }
      setData({
        id: json.id,
        svg: json.svg,
        length: json.length,
        prompt: json.prompt || `Nhập ${json.length} chữ số`,
      });
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

  const submitCode = useCallback(async () => {
    if (verified || disabled || !data || verifyingRef.current) return;
    const trimmed = code.replace(/\s+/g, "");
    if (trimmed.length !== data.length) {
      setErr(`Nhập đủ ${data.length} chữ số`);
      return;
    }
    verifyingRef.current = true;
    setBusy(true);
    verifyGenRef.current += 1;
    const gen = verifyGenRef.current;
    setErr("");
    try {
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id, answer: trimmed }),
      });
      const json = (await res.json()) as { ok: boolean; reason?: string; consumeToken?: string };
      if (gen !== verifyGenRef.current) return;
      if (json.ok && json.consumeToken) {
        setVerified(true);
        onVerifyRef.current(json.consumeToken);
        setErr("");
      } else {
        setErr(json.reason || "Sai mã số");
        setVerified(false);
        onVerifyRef.current("");
        setCode("");
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
    }
  }, [verified, disabled, data, code, load]);

  const isVerified = verified && Boolean(data && !err);

  return (
    <div className="captcha-code-root" style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>
      <div
        className={`captcha-code-card ${err ? "captcha-code-card--err" : ""} ${isVerified ? "captcha-code-card--ok" : ""}`}
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
            title="Làm mới mã"
          >
            {loading ? "Đang tải…" : "Đổi mã"}
          </button>
        </div>

        {data ? (
          <p
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.875rem",
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
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "4.5rem",
            marginBottom: "0.75rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-default, #e2e8f0)",
            background: "#fff",
            padding: "0.5rem",
          }}
        >
          {loading && !data ? (
            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Đang tải…</span>
          ) : data ? (
            <span
              style={{ lineHeight: 0, maxWidth: "100%" }}
              dangerouslySetInnerHTML={{ __html: data.svg }}
            />
          ) : null}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={data?.length ?? 6}
            placeholder={data ? `${data.length} chữ số` : "…"}
            value={code}
            disabled={disabled || loading || verified || !data}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              setCode(v.slice(0, data?.length ?? 6));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submitCode();
              }
            }}
            className={inputClassName}
            style={{ flex: "1 1 140px", minWidth: "8rem", fontVariantNumeric: "tabular-nums" }}
            aria-label="Nhập mã số xác minh"
          />
          <button
            type="button"
            onClick={() => void submitCode()}
            disabled={disabled || loading || verified || !data || busy || code.replace(/\s+/g, "").length !== (data?.length ?? 0)}
            className="pill-btn-primary"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
            }}
          >
            {busy ? "Đang kiểm tra…" : "Xác minh"}
          </button>
        </div>
      </div>

      {err ? (
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--error-text, #ef4444)", textAlign: "center" }}>
          {err}
        </p>
      ) : isVerified ? (
        <p
          style={{
            margin: "0.35rem 0 0",
            fontSize: "0.75rem",
            color: "var(--success-text, #22c55e)",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Đã xác minh
        </p>
      ) : (
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Gõ đúng các chữ số trong khung, rồi bấm Xác minh.
        </p>
      )}
    </div>
  );
}
