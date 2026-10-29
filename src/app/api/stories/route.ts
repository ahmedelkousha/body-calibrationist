import { collectionHandlers } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const handlers = collectionHandlers("stories", "str");

export const GET = handlers.GET;
export const POST = handlers.POST;
