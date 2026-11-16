import InquiryManager from "@/components/dashboard/InquiryManager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Inquiries | Dashboard" };

export default function InquiriesPage() {
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Client care</p>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Inquiries</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Every message from the website — enquiries, workshop bookings and store orders. Reply, archive and
        keep private notes here.
      </p>
      <InquiryManager />
    </>
  );
}
