import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Quản trị</h1>
      <p className="mt-2 text-slate-600">Không có menu hay sản phẩm mẫu — chỉ dữ liệu bạn tạo trong hệ thống.</p>
      <ul className="mt-8 space-y-3">
        <li>
          <Link href="/admin/menus" className="text-brand-blue underline">
            Quản lý menu cha / con
          </Link>
        </li>
        <li>
          <Link href="/admin/seller" className="text-brand-blue underline">
            Duyệt đăng ký bán hàng
          </Link>
        </li>
        <li>
          <Link href="/admin/kyc" className="text-brand-blue underline">
            Duyệt KYC CCCD
          </Link>
        </li>
      </ul>
    </div>
  );
}
