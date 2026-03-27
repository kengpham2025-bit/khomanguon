"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [data, setData] = useState<CaptchaData | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    setCode("");
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

  // Auto-verify khi đủ 4 ký tự
  useEffect(() => {
    if (code.length !== 4 || !data) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id, code }),
      });
      const json = (await res.json()) as { ok: boolean; reason?: string; consumeToken?: string };
      if (json.ok && json.consumeToken) {
        onVerify(json.consumeToken);
        setErr("");
      } else {
        setErr(json.reason || "Sai mã bảo vệ");
        setCode("");
        void load();
      }
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code, data, onVerify, load]);

  const isVerified = Boolean(data && code.length === 4 && !err);

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
              id="captcha-code-input"
              className={inputClassName}
              aria-label="Nhập mã bảo vệ (4 ký tự, nhấn ảnh captcha để đổi mã)"
              style={{
                borderColor: err ? "var(--error)" : isVerified ? "var(--success)" : undefined,
                background: isVerified ? "hsl(142, 55%, 96%)" : undefined,
              }}
              placeholder="Nhập mã bảo vệ"
              value={code}
              maxLength={4}
              autoComplete="off"
              autoCapitalize="characters"
              inputMode="text"
              disabled={disabled}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            />
          </div>
        </div>
      </div>

      {err ? (
        <p className="captcha-input-msg captcha-input-msg--err">{err}</p>
      ) : isVerified ? (
        <p className="captcha-input-msg captcha-input-msg--ok">Đã xác minh</p>
      ) : (
        <p className="captcha-input-msg">Chỉ gồm chữ và số (không phân biệt hoa thường).</p>
      )}
    </div>
  );
}
