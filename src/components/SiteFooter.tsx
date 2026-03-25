import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50 py-12 font-body text-sm text-slate-600">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div>
          <p className="font-heading text-base font-semibold text-slate-900">Kho Mã Nguồn</p>
          <p className="mt-2 leading-relaxed">Mã nguồn, tài khoản MMO và dịch vụ AI — khomanguon.io.vn</p>
        </div>
        <div>
          <p className="font-ui text-sm font-semibold uppercase tracking-wide text-slate-800">Khách hàng</p>
          <ul className="mt-2 space-y-1 font-body">
            <li>
              <Link href="/cua-hang" className="hover:text-brand-blue">
                Cửa hàng
              </Link>
            </li>
            <li>
              <Link href="/dang-ky-ban-hang" className="hover:text-brand-blue">
                Đăng ký bán hàng
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-ui text-sm font-semibold uppercase tracking-wide text-slate-800">Pháp lý</p>
          <p className="mt-2 leading-relaxed">Tuân thủ bảo vệ dữ liệu cá nhân. KYC tùy chọn để hiển thị tích xanh.</p>
        </div>
      </div>
      <p className="mt-8 text-center font-ui text-xs text-slate-400">© {new Date().getFullYear()} Kho Mã Nguồn</p>
    </footer>
  );
}
