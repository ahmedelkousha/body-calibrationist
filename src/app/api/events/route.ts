import { collectionHandlers } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const handlers = collectionHandlers("events", "evt");

export const GET = handlers.GET;
export const POST = handlers.POST;
