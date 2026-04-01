import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SeoSettings } from "@/components/admin/SeoSettings";

export const dynamic = "force-dynamic";

export default function AdminSeoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar locale="vi" activeItem="seo" />

      <div className="pl-64">
        <main className="p-8">
          <SeoSettings locale="vi" />
        </main>
      </div>
    </div>
  );
}
