import { collectionHandlers } from "@/lib/api-helpers";
import { getById, updateItem } from "@/lib/db";

export const dynamic = "force-dynamic";

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Only these fields can be supplied by the public website. Status is forced to
 * "new" so a visitor cannot mark their own message as replied or archived.
 */
function publicInquiry(body: Record<string, unknown>) {
  return {
    name: text(body.name, 200),
    email: text(body.email, 200),
    phone: text(body.phone, 60),
    subject: text(body.subject, 200) || "Website enquiry",
    message: text(body.message, 8000),
    status: "new" as const,
    notes: text(body.notes, 2000),
  };
}

const handlers = collectionHandlers("inquiries", "inq", {
  publicPost: true,
  beforeCreate: async (body) => {
    // Workshop reservations ask the server to claim a seat. This replaces the
    // old public PUT /api/events/[id] call, which is now dashboard-only.
    if (typeof body.eventId === "string" && body.eventId) {
      const event = await getById("events", body.eventId);
      if (event) {
        await updateItem("events", event.id, {
          booked: Math.min(event.booked + 1, event.capacity),
        });
      }
    }

    return publicInquiry(body);
  },
  validate: (body) => {
    if (!body.name) return "Please include your name.";
    if (!body.email || !String(body.email).includes("@")) return "Please include a valid email address.";
    if (!body.message) return "Please include a message.";
    return null;
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;
