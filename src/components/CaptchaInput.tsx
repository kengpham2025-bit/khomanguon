"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IconLoader } from "@/components/Icons";

interface CaptchaData {
  id: string;
  svg: string;
}

interface CaptchaInputProps {
  /** Gọi mỗi khi giá trị hợp lệ → chuỗi rỗng khi chưa verify */
  onVerify: (token: string) => void;
  /** Cho phép submit khi token non-empty */
  disabled?: boolean;
  /** Class cho ô nhập (vd. modal dùng auth-modal-input) */
  inputClassName?: string;
}

export function CaptchaInput({ onVerify, disabled, inputClassName = "input captcha-input-code" }: CaptchaInputProps) {
  const inputId = useId();
  const [data, setData] = useState<CaptchaData | null>(null);
  const [code, setCode] = useState("");
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
    setCode("");
    setVerified(false);
    onVerifyRef.current("");
    try {
      const res = await fetch("/api/captcha");
      const json = (await res.json()) as CaptchaData & { error?: string; reason?: string };
      if (!res.ok || !json.svg || typeof json.id !== "string") {
        setErr(json.reason || json.error || "Không tải được mã bảo vệ");
        setData(null);
        return;
      }
      setData({ id: json.id, svg: json.svg });
    } catch {
      setErr("Không tải được mã bảo vệ");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load lần đầu
  useEffect(() => {
    void load();
  }, [load]);

  const runVerify = useCallback(async () => {
    if (verified || disabled || !data || code.length !== 4) return;
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    verifyGenRef.current += 1;
    const gen = verifyGenRef.current;
    setErr("");
    try {
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id, code }),
      });
      const json = (await res.json()) as { ok: boolean; reason?: string; consumeToken?: string };
      if (gen !== verifyGenRef.current) return;
      if (json.ok && json.consumeToken) {
        setVerified(true);
        onVerifyRef.current(json.consumeToken);
        setErr("");
      } else {
        setErr(json.reason || "Sai mã bảo vệ");
        setVerified(false);
        onVerifyRef.current("");
        setCode("");
        void load();
      }
    } catch {
      if (gen !== verifyGenRef.current) return;
      setErr("Không kiểm tra được mã. Thử lại.");
      setVerified(false);
      onVerifyRef.current("");
      setCode("");
      void load();
    } finally {
      verifyingRef.current = false;
    }
  }, [verified, disabled, data, code, load]);

  const runVerifyRef = useRef(runVerify);
  runVerifyRef.current = runVerify;

  /** Sau khi nhập đủ 4 ký tự, đợi người dùng ngừng gõ rồi mới gửi verify (tránh race / cảm giác “nhảy ảnh” khi đang sửa). */
  useEffect(() => {
    if (code.length !== 4 || !data || verified || disabled) return;
    const t = setTimeout(() => {
      void runVerifyRef.current();
    }, 700);
    return () => clearTimeout(t);
  }, [code, data, verified, disabled]);

  const isVerified = verified && Boolean(data && code.length === 4 && !err);

  return (
    <div className="captcha-input-root">
      <div className="captcha-input-card">
        <div className="captcha-input-card-head">
          <span className="captcha-input-card-title">Mã bảo vệ</span>
        </div>

        <div className="captcha-input-main-row">
          <div className="captcha-input-left">
            <button
              type="button"
              className={`captcha-input-svg-wrap ${err ? "captcha-input-svg-wrap--err" : ""} ${isVerified ? "captcha-input-svg-wrap--ok" : ""}`}
              onClick={() => {
                if (!loading && !disabled) void load();
              }}
              disabled={loading || disabled}
              title="Nhấn để tải mã mới"
              aria-label="Hiển thị mã bảo vệ — nhấn để làm mới"
            >
              {data ? (
                <span
                  className="captcha-input-svg-inner"
                  dangerouslySetInnerHTML={{ __html: data.svg }}
                />
              ) : (
                <span className="captcha-input-placeholder">{loading ? "Đang tải…" : "—"}</span>
              )}
            </button>
            <button
              type="button"
              className="captcha-input-refresh"
              onClick={() => void load()}
              disabled={loading || disabled}
              title="Làm mới mã"
              aria-label="Tải mã bảo vệ mới"
            >
              <IconLoader size={18} />
            </button>
          </div>
          <div className="captcha-input-field-col">
            <input
              id={inputId}
              className={inputClassName}
              aria-label="Nhập mã bảo vệ (4 ký tự, nhấn ảnh captcha để đổi mã)"
              style={{
                borderColor: err ? "var(--error)" : isVerified ? "var(--success)" : undefined,
                background: isVerified ? "hsl(142, 55%, 96%)" : undefined,
              }}
              placeholder="Nhập mã"
              value={code}
              maxLength={4}
              autoComplete="off"
              autoCapitalize="characters"
              inputMode="text"
              disabled={disabled}
              onChange={(e) => {
                verifyGenRef.current += 1;
                const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                setVerified(false);
                onVerifyRef.current("");
                setCode(v);
              }}
              onBlur={() => {
                void runVerify();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void runVerify();
                }
              }}
            />
          </div>
        </div>
      </div>

      {err ? (
        <p className="captcha-input-msg captcha-input-msg--err">{err}</p>
      ) : isVerified ? (
        <p className="captcha-input-msg captcha-input-msg--ok">Đã xác minh</p>
      ) : (
        <p className="captcha-input-msg">
          Chỉ gồm chữ và số (không phân biệt hoa thường). Nhập đủ 4 ký tự — có thể nhấn Enter / Tab hoặc đợi vài giây để tự xác minh.
        </p>
      )}
    </div>
  );
}
