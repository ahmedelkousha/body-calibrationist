import "server-only";
import { getFirebaseDb } from "@/lib/firebase/admin";
import seedFile from "../../seed/firestore-seed.json";
import type { Database, ResourceKey } from "./types";

/**
 * Cloud Firestore is the only content store. `seed/firestore-seed.json` is the
 * baseline used by `npm run seed:firestore` and by the dashboard "restore demo
 * content" action. There is deliberately no local JSON persistence: the site
 * requires Firebase Admin credentials to read or write content.
 */

const COLLECTIONS: ResourceKey[] = [
  "services",
  "products",
  "blogs",
  "events",
  "stories",
  "inquiries",
];

/** The journal and inquiries read newest-first; catalogue keeps its seed order. */
const NEWEST_FIRST: ResourceKey[] = ["blogs", "inquiries"];

const seedDatabase = seedFile as unknown as Database;

function firestore() {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error(
      "Firebase is not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env.local, then restart the server.",
    );
  }
  return db;
}

/** Firestore rejects `undefined`, so drop those keys recursively before writing. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map((entry) => stripUndefined(entry)) as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const clean: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (entry !== undefined) clean[key] = stripUndefined(entry);
    }
    return clean as T;
  }
  return value;
}

function withId<T>(id: string, data: Record<string, unknown>): T {
  return { ...data, id } as T;
}

function sortByCreatedAt<T extends { createdAt?: string }>(items: T[], newestFirst: boolean): T[] {
  return [...items].sort((a, b) => {
    const left = Date.parse(a.createdAt ?? "") || 0;
    const right = Date.parse(b.createdAt ?? "") || 0;
    return newestFirst ? right - left : left - right;
  });
}

async function readCollection<K extends ResourceKey>(key: K): Promise<Database[K]> {
  const snapshot = await firestore().collection(key).get();
  const items = snapshot.docs.map((doc) => withId<Database[K][number]>(doc.id, doc.data()));
  return sortByCreatedAt(
    items as unknown as { createdAt?: string }[],
    NEWEST_FIRST.includes(key),
  ) as unknown as Database[K];
}

export async function readDb(): Promise<Database> {
  const [services, products, blogs, events, stories, inquiries] = await Promise.all([
    readCollection("services"),
    readCollection("products"),
    readCollection("blogs"),
    readCollection("events"),
    readCollection("stories"),
    readCollection("inquiries"),
  ]);

  return { services, products, blogs, events, stories, inquiries };
}

export async function writeDb(database: Database): Promise<void> {
  const db = firestore();

  for (const key of COLLECTIONS) {
    const refs = await db.collection(key).listDocuments();
    for (let index = 0; index < refs.length; index += 400) {
      const batch = db.batch();
      for (const ref of refs.slice(index, index + 400)) batch.delete(ref);
      await batch.commit();
    }

    const items = database[key] as { id: string }[];
    for (let index = 0; index < items.length; index += 400) {
      const batch = db.batch();
      for (const item of items.slice(index, index + 400)) {
        if (!item?.id) continue;
        batch.set(db.collection(key).doc(item.id), stripUndefined(item));
      }
      await batch.commit();
    }
  }
}

export async function getCollection<K extends ResourceKey>(key: K): Promise<Database[K]> {
  return readCollection(key);
}

export async function getBySlug<K extends ResourceKey>(
  key: K,
  slug: string,
): Promise<Database[K][number] | undefined> {
  const snapshot = await firestore().collection(key).where("slug", "==", slug).limit(1).get();
  if (snapshot.empty) return undefined;
  const doc = snapshot.docs[0];
  return withId<Database[K][number]>(doc.id, doc.data());
}

export async function getById<K extends ResourceKey>(
  key: K,
  id: string,
): Promise<Database[K][number] | undefined> {
  const doc = await firestore().collection(key).doc(id).get();
  if (!doc.exists) return undefined;
  return withId<Database[K][number]>(doc.id, doc.data() ?? {});
}

export async function createItem<K extends ResourceKey>(
  key: K,
  item: Database[K][number],
): Promise<Database[K][number]> {
  const record = item as unknown as { id: string };
  await firestore().collection(key).doc(record.id).set(stripUndefined(item));
  return item;
}

export async function updateItem<K extends ResourceKey>(
  key: K,
  id: string,
  patch: Partial<Database[K][number]>,
): Promise<Database[K][number] | null> {
  const ref = firestore().collection(key).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const cleanPatch = stripUndefined(patch);
  if (Object.keys(cleanPatch as Record<string, unknown>).length > 0) {
    await ref.set(cleanPatch, { merge: true });
  }

  const updated = await ref.get();
  return withId<Database[K][number]>(ref.id, updated.data() ?? {});
}

export async function deleteItem<K extends ResourceKey>(key: K, id: string): Promise<boolean> {
  const ref = firestore().collection(key).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return false;
  await ref.delete();
  return true;
}

/** Replaces every collection with the seed file. Used by the protected reset action. */
export async function resetDb(): Promise<Database> {
  const fresh = structuredClone(seedDatabase);
  await writeDb(fresh);
  return fresh;
}
