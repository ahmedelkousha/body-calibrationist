import { requireSession } from "@/lib/auth/require-session";
import { readDb } from "@/lib/db";
import Sidebar from "@/components/dashboard/Sidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio dashboard",
  description: "Manage blogs, products and client inquiries.",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();
  const db = await readDb();
  const newInquiries = db.inquiries.filter((inquiry) => inquiry.status === "new").length;

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <Sidebar newInquiries={newInquiries} user={{ email: user.email, name: user.name }} />
      <div className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:px-8 lg:pt-10">{children}</div>
      </div>
    </div>
  );
}
