"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface CartItem {
  _id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product?: { titleVi: string; titleEn: string; demoImages?: string[] };
  variant?: { labelVi: string; labelEn: string; price: number };
  seller?: { fullName?: string; username?: string };
}

interface CheckoutClientProps {
  items: CartItem[];
  userBalance: number;
  cartTotal: number;
  locale: "vi" | "en";
  hasBankAccount: boolean;
  referralCode?: string;
}

type PaymentMethod = "balance" | "payos";

export function CheckoutClient({
  items,
  userBalance,
  cartTotal,
  locale = "vi",
  hasBankAccount,
  referralCode,
}: CheckoutClientProps) {
  const router = useRouter();
  const { success, error: notifyError, info, warning } = useNotification();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("balance");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handlePlaceOrder = async () => {
    if (!agreeTerms) {
      info({
        title: locale === "vi" ? "Vui lòng đồng ý điều khoản" : "Please agree to terms",
        message: locale === "vi"
          ? "Bạn cần đồng ý với điều khoản sử dụng trước khi đặt hàng."
          : "You must agree to the terms of service before placing an order.",
      });
      return;
    }

    if (paymentMethod === "balance") {
      if (userBalance < cartTotal) {
        const confirmed = await confirm({
          title: locale === "vi" ? "Số dư không đủ" : "Insufficient Balance",
          description: locale === "vi"
            ? `Bạn cần thêm ${formatPrice(cartTotal - userBalance, locale)} vào tài khoản. Bạn có muốn nạp tiền qua PayOS?`
            : `You need to add ${formatPrice(cartTotal - userBalance, locale)} to your account. Do you want to deposit via PayOS?`,
          confirmText: locale === "vi" ? "Nạp tiền ngay" : "Deposit Now",
          cancelText: locale === "vi" ? "Hủy" : "Cancel",
          variant: "warning",
        });
        if (confirmed) {
          router.push("/deposit");
        }
        return;
      }

      const confirmed = await confirm({
        title: locale === "vi" ? "Xác nhận đặt hàng" : "Confirm Order",
        description: locale === "vi"
          ? `Bạn có chắc muốn thanh toán ${formatPrice(cartTotal, locale)} từ số dư tài khoản?`
          : `Are you sure you want to pay ${formatPrice(cartTotal, locale)} from your account balance?`,
        confirmText: locale === "vi" ? "Xác nhận thanh toán" : "Confirm Payment",
        cancelText: locale === "vi" ? "Hủy" : "Cancel",
        variant: "success",
      });

      if (!confirmed) return;

      setIsProcessing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        success({
          title: locale === "vi" ? "Đặt hàng thành công!" : "Order placed!",
          message: locale === "vi"
            ? "Đơn hàng của bạn đã được tạo. Vui lòng đợi người bán giao hàng."
            : "Your order has been placed. Please wait for the seller to deliver.",
        });
        router.push("/orders");
      } catch {
        notifyError({
          title: locale === "vi" ? "Thanh toán thất bại" : "Payment failed",
          message: locale === "vi"
            ? "Đã xảy ra lỗi khi xử lý thanh toán."
            : "An error occurred while processing payment.",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // PayOS payment
      setIsProcessing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        success({
          title: locale === "vi" ? "Đang chuyển hướng..." : "Redirecting...",
          message: locale === "vi"
            ? "Bạn sẽ được chuyển đến cổng thanh toán PayOS."
            : "You will be redirected to the PayOS payment gateway.",
        });
        // In production: redirect to PayOS checkout URL
        // window.location.href = payosCheckoutUrl;
      } catch {
        notifyError({
          title: locale === "vi" ? "Lỗi thanh toán" : "Payment error",
          message: locale === "vi" ? "Không thể khởi tạo thanh toán PayOS." : "Could not initialize PayOS payment.",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <CreditCard className="mb-4 h-16 w-16 text-slate-200" />
        <h2 className="mb-2 text-xl font-bold text-slate-700">
          {locale === "vi" ? "Giỏ hàng trống" : "Your cart is empty"}
        </h2>
        <p className="mb-6 text-slate-500">
          {locale === "vi" ? "Hãy thêm sản phẩm vào giỏ hàng trước." : "Add some products to your cart first."}
        </p>
        <Link
          href="/products"
          className="rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          {locale === "vi" ? "Mua sắm ngay" : "Shop Now"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900 lg:text-3xl">
        {locale === "vi" ? "Thanh toán" : "Checkout"}
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left: Items + Payment */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft-sm"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <CreditCard className="h-5 w-5 text-primary-600" />
              {locale === "vi" ? "Đơn hàng" : "Order"} ({items.length} {locale === "vi" ? "sản phẩm" : "items"})
            </h2>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item._id} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
                    {item.product?.demoImages?.[0] ? (
                      <Image
                        src={item.product.demoImages[0]}
                        alt={item.product.titleVi}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="line-clamp-2 text-sm font-medium text-slate-900">
                      {locale === "vi" ? item.product?.titleVi : item.product?.titleEn}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {locale === "vi" ? item.variant?.labelVi : item.variant?.labelEn} × {item.quantity}
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {formatPrice((item.variant?.price || 0) * item.quantity, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft-sm"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Wallet className="h-5 w-5 text-primary-600" />
              {locale === "vi" ? "Phương thức thanh toán" : "Payment Method"}
            </h2>

            <div className="flex flex-col gap-3">
              {/* Balance */}
              <label
                className={cn(
                  "flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all",
                  paymentMethod === "balance"
                    ? "border-primary-600 bg-primary-50"
                    : "border-slate-200 hover:border-primary-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    paymentMethod === "balance"
                      ? "border-primary-600 bg-primary-600"
                      : "border-slate-300"
                  )}>
                    {paymentMethod === "balance" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {locale === "vi" ? "Số dư tài khoản" : "Account Balance"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {locale === "vi" ? "Thanh toán ngay từ số dư" : "Pay directly from your balance"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-600">{formatPrice(userBalance, locale)}</div>
                  {userBalance < cartTotal && (
                    <div className="flex items-center gap-1 text-xs text-red-500">
                      <AlertTriangle className="h-3 w-3" />
                      {locale === "vi" ? "Không đủ" : "Insufficient"}
                    </div>
                  )}
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "balance"}
                  onChange={() => setPaymentMethod("balance")}
                  className="sr-only"
                />
              </label>

              {/* PayOS */}
              <label
                className={cn(
                  "flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all",
                  paymentMethod === "payos"
                    ? "border-primary-600 bg-primary-50"
                    : "border-slate-200 hover:border-primary-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    paymentMethod === "payos"
                      ? "border-primary-600 bg-primary-600"
                      : "border-slate-300"
                  )}>
                    {paymentMethod === "payos" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      PayOS
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                        {locale === "vi" ? "Khuyến nghị" : "Recommended"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {locale === "vi" ? "Thanh toán qua ngân hàng VN" : "Pay via Vietnamese bank"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Visa, MB, VCB...</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "payos"}
                  onChange={() => setPaymentMethod("payos")}
                  className="sr-only"
                />
              </label>
            </div>
          </motion.div>

          {/* Terms */}
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="terms" className="cursor-pointer text-sm text-slate-600">
              {locale === "vi" ? (
                <>
                  Tôi đã đọc và đồng ý với{" "}
                  <Link href="/terms" className="text-primary-600 underline hover:text-primary-700">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link href="/privacy" className="text-primary-600 underline hover:text-primary-700">
                    Chính sách bảo mật
                  </Link>
                </>
              ) : (
                <>
                  I have read and agree to the{" "}
                  <Link href="/terms" className="text-primary-600 underline hover:text-primary-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary-600 underline hover:text-primary-700">
                    Privacy Policy
                  </Link>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-soft-sm"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {locale === "vi" ? "Tóm tắt đơn hàng" : "Order Summary"}
            </h2>

            <div className="mb-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {locale === "vi" ? "Tạm tính" : "Subtotal"} ({items.length} {locale === "vi" ? "sản phẩm" : "items"})
                </span>
                <span className="font-medium text-slate-900">{formatPrice(cartTotal, locale)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{locale === "vi" ? "Phí giao hàng" : "Delivery fee"}</span>
                <span className="font-medium text-green-600">
                  {locale === "vi" ? "Miễn phí" : "Free"}
                </span>
              </div>
              {referralCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{locale === "vi" ? "Mã giới thiệu" : "Referral code"}</span>
                  <span className="font-medium text-primary-600">{referralCode}</span>
                </div>
              )}
            </div>

            <div className="mb-6 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-slate-900">
                  {locale === "vi" ? "Tổng cộng" : "Total"}
                </span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(cartTotal, locale)}
                </span>
              </div>
              {paymentMethod === "balance" && userBalance >= cartTotal && (
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {locale === "vi" ? "Số dư đủ để thanh toán" : "Balance sufficient for payment"}
                </div>
              )}
              {paymentMethod === "balance" && userBalance < cartTotal && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {locale === "vi"
                    ? `Thiếu ${formatPrice(cartTotal - userBalance, locale)}`
                    : `Short by ${formatPrice(cartTotal - userBalance, locale)}`}
                </div>
              )}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all active:scale-95",
                !isProcessing
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {locale === "vi" ? "Đang xử lý..." : "Processing..."}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {paymentMethod === "balance"
                    ? (locale === "vi" ? "Thanh toán ngay" : "Pay Now")
                    : (locale === "vi" ? "Thanh toán PayOS" : "Pay with PayOS")}
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              {locale === "vi"
                ? "Thanh toán được bảo mật bởi PayOS"
                : "Secured payment by PayOS"}
            </div>

            <Link
              href="/cart"
              className="mt-3 flex items-center justify-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              {locale === "vi" ? "Quay lại giỏ hàng" : "Back to cart"}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
