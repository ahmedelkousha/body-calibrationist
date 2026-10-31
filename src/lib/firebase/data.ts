import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { Database, ResourceKey } from "@/lib/types";
import { NEWEST_FIRST, slugify, sortByCreatedAt } from "@/lib/utils";
import { getClientDb } from "./client";

export type ResourceItem = Record<string, unknown> & { id: string };
export type ContentKey = Exclude<ResourceKey, "inquiries">;
export type ContentDatabase = Pick<Database, ContentKey>;

/** Drops undefined keys so Firestore doesn't reject the payload. */
function cleanData<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  ) as T;
}

export async function listResource<K extends ResourceKey>(key: K): Promise<Database[K]> {
  const snapshot = await getDocs(collection(getClientDb(), key));
  const items = snapshot.docs.map((d) => ({
    ...(d.data() as Record<string, unknown>),
    id: d.id,
  }));

  return sortByCreatedAt(
    items as unknown as { createdAt?: string }[],
    NEWEST_FIRST.includes(key),
  ) as unknown as Database[K];
}

/** Alias for listResource, used by public site pages */
export const readCollection = listResource;

/** Reads public content collections for the public website. */
export async function readContent(): Promise<ContentDatabase> {
  const [services, products, blogs, events, stories] = await Promise.all([
    listResource("services"),
    listResource("products"),
    listResource("blogs"),
    listResource("events"),
    listResource("stories"),
  ]);

  return { services, products, blogs, events, stories };
}

/** Reads every collection at once for the dashboard overview. */
export async function readAllContent(): Promise<Database> {
  const [services, products, blogs, events, stories, inquiries] = await Promise.all([
    listResource("services"),
    listResource("products"),
    listResource("blogs"),
    listResource("events"),
    listResource("stories"),
    listResource("inquiries"),
  ]);

  return { services, products, blogs, events, stories, inquiries };
}

export async function getBySlug<K extends ResourceKey>(
  key: K,
  slug: string,
): Promise<Database[K][number] | undefined> {
  const snapshot = await getDocs(
    query(collection(getClientDb(), key), where("slug", "==", slug), limit(1)),
  );
  if (snapshot.empty) return undefined;
  const doc = snapshot.docs[0];
  return { ...(doc.data() as Record<string, unknown>), id: doc.id } as Database[K][number];
}

export async function createResource(
  key: ResourceKey,
  prefix: string,
  payload: Record<string, unknown>,
): Promise<ResourceItem> {
  const db = getClientDb();
  const label = String(payload.slug || payload.title || payload.name || "item");
  const baseSlug = slugify(label) || "item";

  // Check if base slug is taken with a targeted single-document query
  const existing = await getDocs(query(collection(db, key), where("slug", "==", baseSlug), limit(1)));
  const slug = existing.empty ? baseSlug : `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

  const id = `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const record: ResourceItem = {
    ...cleanData(payload),
    id,
    slug,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, key, id), record);
  return record;
}

export async function updateResource(
  key: ResourceKey,
  id: string,
  patch: Record<string, unknown>,
): Promise<ResourceItem> {
  const clean = cleanData(patch);
  await setDoc(doc(getClientDb(), key, id), clean, { merge: true });
  return { ...clean, id };
}

export async function deleteResource(key: ResourceKey, id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), key, id));
}

export type PublicInquiry = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  notes?: string;
};

function formatInquiry(input: PublicInquiry) {
  return {
    name: input.name?.trim().slice(0, 200) || "",
    email: input.email?.trim().slice(0, 200) || "",
    phone: input.phone?.trim().slice(0, 60) || "",
    subject: input.subject?.trim().slice(0, 200) || "Website enquiry",
    message: input.message?.trim().slice(0, 8000) || "",
    status: "new" as const,
    notes: input.notes?.trim().slice(0, 2000) || "",
    createdAt: new Date().toISOString(),
  };
}

export async function createInquiry(input: PublicInquiry): Promise<string> {
  const db = getClientDb();
  const ref = doc(collection(db, "inquiries"));
  await setDoc(ref, formatInquiry(input));
  return ref.id;
}

export async function createEventBooking(input: PublicInquiry, eventId: string): Promise<void> {
  const db = getClientDb();
  const ref = doc(collection(db, "inquiries"));
  const batch = writeBatch(db);

  batch.set(ref, formatInquiry(input));
  batch.update(doc(db, "events", eventId), { booked: increment(1) });
  await batch.commit();
}
