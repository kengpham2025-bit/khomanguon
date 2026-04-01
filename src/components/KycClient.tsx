"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Camera,
  ArrowLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";
import Link from "next/link";

interface KycClientProps {
  locale?: "vi" | "en";
}

export function KycClient({ locale = "vi" }: KycClientProps) {
  const router = useRouter();
  const { success, error: notifyError, info } = useNotification();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cccdNumber, setCccdNumber] = useState("");
  const [cccdFront, setCccdFront] = useState("");
  const [cccdBack, setCccdBack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async () => {
    if (!cccdNumber || cccdNumber.length < 9) {
      notifyError({
        title: locale === "vi" ? "Số CCCD không hợp lệ" : "Invalid ID Number",
        message: "",
      });
      return;
    }
    if (!agreeTerms) {
      info({
        title: locale === "vi" ? "Cần đồng ý điều khoản" : "Please agree to terms",
        message: "",
      });
      return;
    }

    const confirmed = await confirm({
      title: locale === "vi" ? "Gửi hồ sơ KYC" : "Submit KYC",
      description:
        locale === "vi"
          ? "Xác nhận gửi hồ sơ KYC để xác minh danh tính. Sau khi được duyệt, bạn sẽ có thể bán sản phẩm trên KHOMANGUON.IO.VN."
          : "Confirm to submit KYC for identity verification. Once approved, you will be able to sell products on KHOMANGUON.IO.VN.",
      confirmText: locale === "vi" ? "Gửi hồ sơ" : "Submit",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "info",
    });
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setStep(3);
      success({
        title: locale === "vi" ? "Gửi hồ sơ thành công!" : "Submitted successfully!",
        message:
          locale === "vi"
            ? "Hồ sơ KYC của bạn đang được xét duyệt. Thường mất 1-3 ngày làm việc."
            : "Your KYC application is under review. Usually takes 1-3 business days.",
      });
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, labelVi: "Nhập thông tin", labelEn: "Enter Info" },
    { num: 2, labelVi: "Tải ảnh CCCD", labelEn: "Upload ID Photos" },
    { num: 3, labelVi: "Hoàn thành", labelEn: "Complete" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "vi" ? "Quay lại" : "Back"}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
            {locale === "vi" ? "Xác minh danh tính (KYC)" : "Verify Identity (KYC)"}
          </h1>
          <p className="mt-2 text-slate-500">
            {locale === "vi"
              ? "Hoàn tất KYC để trở thành người bán trên KHOMANGUON.IO.VN"
              : "Complete KYC to become a seller on KHOMANGUON.IO.VN"}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8 flex items-center gap-4">
          {steps.map((s, i) => (
            <div key={s.num} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  step >= s.num
                    ? step === s.num
                      ? "bg-primary-600 text-white shadow-soft-md"
                      : "bg-green-500 text-white"
                    : "bg-slate-200 text-slate-500"
                )}>
                  {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                </div>
                <span className={cn("mt-1 text-xs font-medium", step >= s.num ? "text-primary-600" : "text-slate-400")}>
                  {locale === "vi" ? s.labelVi : s.labelEn}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2 mb-4", step > s.num ? "bg-green-400" : "bg-slate-200")} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft-sm"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {locale === "vi" ? "Thông tin CCCD/CMND" : "ID Card Information"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {locale === "vi" ? "Số CCCD/CMND" : "ID Number"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cccdNumber}
                  onChange={(e) => setCccdNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="079204567890"
                  className="w-full rounded-full border border-slate-200 px-4 py-3 text-base font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <p className="mt-1 text-xs text-slate-400">
                  {locale === "vi" ? "Nhập 9 hoặc 12 số" : "Enter 9 or 12 digits"}
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-primary-200 bg-primary-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                <p className="text-sm text-primary-700">
                  {locale === "vi"
                    ? "Thông tin CCCD của bạn được mã hóa và bảo mật theo tiêu chuẩn quốc tế. Chúng tôi cam kết không chia sẻ thông tin này cho bất kỳ bên thứ ba nào."
                    : "Your ID information is encrypted and secured to international standards. We commit to not sharing this information with any third parties."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={cccdNumber.length < 9}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {locale === "vi" ? "Tiếp tục" : "Continue"}
            </button>
          </motion.div>
        )}

        {/* Step 2: Upload Photos */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft-sm"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {locale === "vi" ? "Tải ảnh CCCD" : "Upload ID Photos"}
            </h2>

            <div className="mb-4 flex flex-col gap-4">
              {/* Front */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {locale === "vi" ? "Mặt trước CCCD" : "ID Front"} <span className="text-red-500">*</span>
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-primary-400 hover:bg-primary-50">
                  {cccdFront ? (
                    <div className="relative h-32 w-48 overflow-hidden rounded-xl">
                      <img src={cccdFront} alt="CCCD Front" className="h-full w-full object-cover" />
                      <button onClick={() => setCccdFront("")} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-10 w-10 text-slate-400" />
                      <p className="text-sm text-slate-500">
                        {locale === "vi" ? "Tải lên hoặc kéo thả ảnh" : "Upload or drag image"}
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCccdFront(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>

              {/* Back */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {locale === "vi" ? "Mặt sau CCCD" : "ID Back"} <span className="text-red-500">*</span>
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-primary-400 hover:bg-primary-50">
                  {cccdBack ? (
                    <div className="relative h-32 w-48 overflow-hidden rounded-xl">
                      <img src={cccdBack} alt="CCCD Back" className="h-full w-full object-cover" />
                      <button onClick={() => setCccdBack("")} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-10 w-10 text-slate-400" />
                      <p className="text-sm text-slate-500">
                        {locale === "vi" ? "Tải lên hoặc kéo thả ảnh" : "Upload or drag image"}
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCccdBack(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-6 flex items-start gap-3">
              <input
                type="checkbox"
                id="kyc-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="kyc-terms" className="cursor-pointer text-sm text-slate-600">
                {locale === "vi"
                  ? "Tôi xác nhận thông tin CCCD là chính xác và đồng ý với điều khoản sử dụng."
                  : "I confirm the ID information is accurate and agree to the terms of service."}
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-slate-200 py-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                {locale === "vi" ? "Quay lại" : "Back"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !agreeTerms}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {locale === "vi" ? "Đang gửi..." : "Submitting..."}</>
                ) : (
                  <>{locale === "vi" ? "Gửi hồ sơ" : "Submit Application"}</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-8 text-center shadow-soft-sm"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              {locale === "vi" ? "Hồ sơ đã được gửi!" : "Application Submitted!"}
            </h2>
            <p className="mb-6 text-slate-500">
              {locale === "vi"
                ? "Hồ sơ KYC của bạn đang được xét duyệt. Thường mất 1-3 ngày làm việc. Bạn sẽ nhận được thông báo qua email khi có kết quả."
                : "Your KYC application is under review. Usually takes 1-3 business days. You will receive an email notification when the result is available."}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                {locale === "vi" ? "Quay lại Dashboard" : "Back to Dashboard"}
              </Link>
              <button
                onClick={() => { setStep(1); setCccdNumber(""); setCccdFront(""); setCccdBack(""); setAgreeTerms(false); }}
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                {locale === "vi" ? "Gửi hồ sơ khác" : "Submit Another"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Info Box */}
        {step < 3 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div className="text-sm text-slate-600">
              <strong className="text-slate-900">
                {locale === "vi" ? "Lưu ý:" : "Note:"}
              </strong>{" "}
              {locale === "vi"
                ? "Chỉ sử dụng ảnh CCCD gốc, rõ ràng, không bị chỉnh sửa. Ảnh mờ hoặc bị che có thể bị từ chối."
                : "Use only original, clear, unedited ID photos. Blurred or covered photos may be rejected."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
