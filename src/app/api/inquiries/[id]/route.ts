import { itemHandlers } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const handlers = itemHandlers("inquiries");

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
