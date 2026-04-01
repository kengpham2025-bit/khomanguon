"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  QrCode,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";

interface DepositClientProps {
  locale: "vi" | "en";
  currentBalance: number;
}

const AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export function DepositClient({ locale, currentBalance }: DepositClientProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "momo" | "payos">("payos");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { success, error: notifyError } = useNotification();

  const depositAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handleDeposit = async () => {
    if (depositAmount < 10000) {
      notifyError({
        title: locale === "vi" ? "Số tiền không hợp lệ" : "Invalid amount",
        message: locale === "vi" ? "Số tiền nạp tối thiểu là 10.000đ" : "Minimum deposit is 10,000 VND",
      });
      return;
    }

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setShowQR(true);
    setIsProcessing(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    success({
      title: locale === "vi" ? "Đã sao chép!" : "Copied!",
      message: "",
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {locale === "vi" ? "Nạp tiền" : "Deposit"}
          </h1>
          <p className="mt-2 text-slate-500">
            {locale === "vi"
              ? "Nạp tiền vào tài khoản để mua sản phẩm"
              : "Add funds to your account to purchase products"}
          </p>
        </div>

        {/* Current Balance */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white shadow-soft-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/80">
                {locale === "vi" ? "Số dư hiện tại" : "Current Balance"}
              </p>
              <p className="text-2xl font-bold">{formatPrice(currentBalance, locale)}</p>
            </div>
          </div>
        </div>

        {!showQR ? (
          <div className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                {locale === "vi" ? "Chọn số tiền nạp" : "Select deposit amount"}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount("");
                    }}
                    className={cn(
                      "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all",
                      selectedAmount === amount
                        ? "border-primary-600 bg-primary-50 text-primary-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-300"
                    )}
                  >
                    {formatPrice(amount, locale)}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder={locale === "vi" ? "Hoặc nhập số tiền khác..." : "Or enter custom amount..."}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                {locale === "vi" ? "Phương thức thanh toán" : "Payment method"}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "payos" as const, label: "PayOS", icon: CreditCard },
                  { id: "bank" as const, label: locale === "vi" ? "Chuyển khoản" : "Bank Transfer", icon: CreditCard },
                  { id: "momo" as const, label: "MoMo", icon: Wallet },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all",
                      paymentMethod === method.id
                        ? "border-primary-600 bg-primary-50 text-primary-600"
                        : "border-slate-200 bg-white text-slate-600 hover:border-primary-300"
                    )}
                  >
                    <method.icon className="h-5 w-5" />
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleDeposit}
              disabled={depositAmount < 10000 || isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {locale === "vi" ? "Đang xử lý..." : "Processing..."}</>
              ) : (
                <>{locale === "vi" ? "Nạp" : "Deposit"} {depositAmount > 0 ? formatPrice(depositAmount, locale) : ""} <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        ) : (
          /* QR Code / Payment Info */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft-md"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <QrCode className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              {locale === "vi" ? "Quét QR để thanh toán" : "Scan QR to pay"}
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              {locale === "vi"
                ? `Chuyển khoản ${formatPrice(depositAmount, locale)} qua ${paymentMethod.toUpperCase()}`
                : `Transfer ${formatPrice(depositAmount, locale)} via ${paymentMethod.toUpperCase()}`}
            </p>

            {/* QR Placeholder */}
            <div className="mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <QrCode className="h-20 w-20 text-slate-300" />
            </div>

            {/* Bank Info */}
            <div className="mb-6 space-y-3 rounded-xl bg-slate-50 p-4 text-left text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{locale === "vi" ? "Ngân hàng" : "Bank"}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Vietcombank</span>
                  <button onClick={() => handleCopy("Vietcombank")}>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{locale === "vi" ? "Số tài khoản" : "Account"}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">1234567890</span>
                  <button onClick={() => handleCopy("1234567890")}>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{locale === "vi" ? "Nội dung CK" : "Message"}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary-600">NAP {depositAmount}</span>
                  <button onClick={() => handleCopy(`NAP ${depositAmount}`)}>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {locale === "vi" ? "Quay lại" : "Go Back"}
              </button>
              <button
                onClick={() => {
                  success({
                    title: locale === "vi" ? "Đã xác nhận!" : "Confirmed!",
                    message: locale === "vi" ? "Giao dịch đang được xử lý." : "Transaction is being processed.",
                  });
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                {locale === "vi" ? "Đã chuyển khoản" : "I've transferred"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
