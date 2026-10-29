import { NextResponse } from "next/server";
import { requireApiUser, unauthorizedResponse } from "./auth/require-session";
import { getCollection, getById, createItem, updateItem, deleteItem } from "./db";
import type { ResourceKey } from "./types";
import { safeImage, slugify } from "./utils";

type AnyRecord = Record<string, unknown> & { id?: string; slug?: string; createdAt?: string };

type CollectionOptions = {
  /** Public storefront forms may create inquiries without a dashboard session. */
  publicPost?: boolean;
  /** Transform the request body before validation and persistence. */
  beforeCreate?: (body: AnyRecord) => Promise<AnyRecord> | AnyRecord;
  /** Return an error message to reject the request with a 400. */
  validate?: (body: AnyRecord) => string | null;
};

async function guard(): Promise<NextResponse | null> {
  const user = await requireApiUser();
  return user ? null : unauthorizedResponse();
}

/** Normalises user-supplied image paths so next/image never receives an invalid src. */
function sanitizeBody(body: AnyRecord): AnyRecord {
  if (!("image" in body)) return body;
  return { ...body, image: safeImage(body.image) };
}

function uniqueSlug(existing: { slug: string }[], base: string): string {
  const safe = base || "item";
  if (!existing.some((item) => item.slug === safe)) return safe;
  let i = 2;
  while (existing.some((item) => item.slug === `${safe}-${i}`)) i += 1;
  return `${safe}-${i}`;
}

export function collectionHandlers(
  key: ResourceKey,
  prefix: string,
  options: CollectionOptions = {},
) {
  return {
    GET: async () => {
      const denied = await guard();
      if (denied) return denied;

      const items = await getCollection(key);
      return NextResponse.json(items);
    },
    POST: async (request: Request) => {
      if (!options.publicPost) {
        const denied = await guard();
        if (denied) return denied;
      }

      let body: AnyRecord;
      try {
        body = (await request.json()) as AnyRecord;
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      if (options.validate) {
        const message = options.validate(body);
        if (message) return NextResponse.json({ error: message }, { status: 400 });
      }

      if (options.beforeCreate) {
        body = await options.beforeCreate(body);
      }

      body = sanitizeBody(body);

      const existing = (await getCollection(key)) as unknown as { slug: string; id: string }[];
      const label = String(body.slug || body.title || body.name || "");
      const slug = uniqueSlug(existing, slugify(label));
      const id =
        typeof body.id === "string" && body.id.length > 0
          ? body.id
          : `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

      const item = {
        ...body,
        id,
        slug,
        createdAt: typeof body.createdAt === "string" ? body.createdAt : new Date().toISOString(),
      } as never;

      const created = await createItem(key, item);
      return NextResponse.json(created, { status: 201 });
    },
  };
}

export function itemHandlers(key: ResourceKey) {
  return {
    GET: async (_request: Request, context: { params: Promise<{ id: string }> }) => {
      const denied = await guard();
      if (denied) return denied;

      const { id } = await context.params;
      const item = await getById(key, id);
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(item);
    },
    PUT: async (request: Request, context: { params: Promise<{ id: string }> }) => {
      const denied = await guard();
      if (denied) return denied;

      const { id } = await context.params;
      let body: AnyRecord;
      try {
        body = (await request.json()) as AnyRecord;
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
      const updated = await updateItem(key, id, sanitizeBody(body) as never);
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(updated);
    },
    DELETE: async (_request: Request, context: { params: Promise<{ id: string }> }) => {
      const denied = await guard();
      if (denied) return denied;

      const { id } = await context.params;
      const removed = await deleteItem(key, id);
      if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    },
  };
}

export function unsupported(method: string) {
  return NextResponse.json({ error: `Method ${method} not allowed` }, { status: 405 });
}
