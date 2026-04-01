import { KycApprovalClient } from "@/components/admin/KycApprovalClient";

interface AdminKycPageProps {
  searchParams: { locale?: string };
}

const demoPendingKyc = [
  {
    _id: "kyc-1",
    email: "user1@khomanguon.io.vn",
    username: "darkknight99",
    fullName: "Nguyễn Văn A",
    avatarUrl: undefined,
    kycData: {
      cccdFront: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80",
      cccdBack: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&q=80",
      cccdNumber: "079204567890",
      submittedAt: Date.now() - 86400000,
    },
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    _id: "kyc-2",
    email: "user2@khomanguon.io.vn",
    username: "techmaster",
    fullName: "Trần Văn B",
    avatarUrl: undefined,
    kycData: {
      cccdFront: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80",
      cccdBack: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&q=80",
      cccdNumber: "079209876543",
      submittedAt: Date.now() - 86400000 * 2,
    },
    createdAt: Date.now() - 86400000 * 10,
  },
];

export default function AdminKycPage({ searchParams }: AdminKycPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {locale === "vi" ? "Xét duyệt KYC" : "KYC Approval"}
        </h1>
      </div>
      <KycApprovalClient pendingUsers={demoPendingKyc} locale={locale} />
    </>
  );
}
