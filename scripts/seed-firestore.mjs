#!/usr/bin/env node
/**
 * Loads the studio content into Cloud Firestore.
 *
 * Usage:
 *   npm run seed:firestore
 *   npm run seed:firestore -- path/to/another-seed.json
 *
 * By default it reads seed/firestore-seed.json, which contains the existing
 * catalogue, journal posts, workshops, stories and demo inquiries.
 *
 * Credentials are read from .env.local (or .env) and must include
 * FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.
 *
 * The script replaces the contents of each collection. It is intended for the
 * first migration and for restoring demo content — do not run it against a
 * live project without a backup.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const COLLECTIONS = ["services", "products", "blogs", "events", "stories", "inquiries"];
const BATCH_SIZE = 400;
const DEFAULT_SOURCE = "seed/firestore-seed.json";

function clean(value) {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === "object") {
    const output = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) output[key] = stripUndefined(entry);
    }
    return output;
  }
  return value;
}

const projectId = clean(process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
const privateKey = clean(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Firebase Admin credentials.\n" +
      "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local.",
  );
  process.exit(1);
}

const sourcePath = path.resolve(process.argv[2] || DEFAULT_SOURCE);
let source;
try {
  source = JSON.parse(await readFile(sourcePath, "utf8"));
} catch (error) {
  console.error(`Could not read ${sourcePath}: ${error.message}`);
  process.exit(1);
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });

const db = getFirestore(app);

console.log(`Seeding Firebase project "${projectId}" from ${sourcePath}`);

for (const key of COLLECTIONS) {
  const items = Array.isArray(source[key]) ? source[key] : [];

  const existing = await db.collection(key).listDocuments();
  for (let index = 0; index < existing.length; index += BATCH_SIZE) {
    const batch = db.batch();
    for (const ref of existing.slice(index, index + BATCH_SIZE)) batch.delete(ref);
    await batch.commit();
  }

  let written = 0;
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    const batch = db.batch();
    for (const item of items.slice(index, index + BATCH_SIZE)) {
      if (!item?.id) continue;
      batch.set(db.collection(key).doc(item.id), stripUndefined(item));
      written += 1;
    }
    await batch.commit();
  }

  console.log(`  ${key}: ${written} document${written === 1 ? "" : "s"}`);
}

console.log("Done.");
