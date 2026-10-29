import { NextResponse } from "next/server";
import { requireApiUser, unauthorizedResponse } from "@/lib/auth/require-session";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireApiUser();
  if (!user) return unauthorizedResponse();

  const db = await readDb();

  const now = Date.now();
  const weekBuckets = Array.from({ length: 6 }).map((_, index) => {
    const start = new Date(now - (5 - index) * 7 * 86400000);
    const end = new Date(now - (4 - index) * 7 * 86400000);
    const count = db.inquiries.filter((inquiry) => {
      const created = new Date(inquiry.createdAt).getTime();
      return created >= start.getTime() && created < end.getTime();
    }).length;
    return {
      label: start.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
      count,
    };
  });

  const categories = Array.from(new Set(db.products.map((product) => product.category))).map(
    (category) => ({
      name: category,
      count: db.products.filter((product) => product.category === category).length,
    }),
  );

  const totalStock = db.products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = db.products.reduce((sum, product) => sum + product.stock * product.price, 0);

  return NextResponse.json({
    blogs: {
      total: db.blogs.length,
      published: db.blogs.filter((blog) => blog.status === "published").length,
      drafts: db.blogs.filter((blog) => blog.status === "draft").length,
    },
    products: {
      total: db.products.length,
      active: db.products.filter((product) => product.status === "active").length,
      lowStock: db.products.filter((product) => product.stock <= 10).length,
      totalStock,
      inventoryValue,
      categories,
    },
    inquiries: {
      total: db.inquiries.length,
      new: db.inquiries.filter((inquiry) => inquiry.status === "new").length,
      replied: db.inquiries.filter((inquiry) => inquiry.status === "replied").length,
      archived: db.inquiries.filter((inquiry) => inquiry.status === "archived").length,
      weekly: weekBuckets,
    },
    services: { total: db.services.length },
    events: {
      total: db.events.length,
      upcoming: db.events.filter((event) => event.status === "upcoming").length,
      seatsBooked: db.events.reduce((sum, event) => sum + event.booked, 0),
    },
    stories: { total: db.stories.length },
    recentInquiries: db.inquiries.slice(0, 5),
    recentBlogs: db.blogs.slice(0, 4),
  });
}
