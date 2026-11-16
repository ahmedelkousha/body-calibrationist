import DashboardShell from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio dashboard",
  description: "Manage blogs, products and client inquiries.",
  robots: { index: false, follow: false },
};

/**
 * The layout itself stays a server component so `metadata` and the `robots`
 * directive survive. Everything below it is gated in the browser by the
 * AuthProvider inside DashboardShell.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
