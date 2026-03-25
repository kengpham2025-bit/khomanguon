import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3 font-ui text-sm">
          <Link href="/admin" className="font-heading font-bold text-brand-blue">
            Admin
          </Link>
          <Link href="/admin/menus" className="text-slate-600 hover:text-brand-green">
            Menu
          </Link>
          <Link href="/admin/seller" className="text-slate-600 hover:text-brand-green">
            Đơn bán hàng
          </Link>
          <Link href="/admin/kyc" className="text-slate-600 hover:text-brand-green">
            KYC
          </Link>
          <Link href="/" className="ml-auto text-slate-400 hover:text-slate-700">
            Về trang chủ
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
