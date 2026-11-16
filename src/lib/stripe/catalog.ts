import { doc, getDoc } from "firebase/firestore";
import type { Product, Service } from "@/lib/types";
import { getClientDb } from "@/lib/firebase/client";

/**
 * Reads catalogue prices on the server through the public Firestore API.
 *
 * The public site already reads Firestore without a signed-in user, so these
 * documents are readable under the published rules. Using the document ID
 * keeps the lookup cheap and means the payment amount is never trusted from
 * the browser.
 */

async function getDocument<T>(collectionName: "products" | "services", id: string): Promise<T | null> {
  const snapshot = await getDoc(doc(getClientDb(), collectionName, id));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Record<string, unknown>), id: snapshot.id } as T;
}

export async function getProduct(id: string): Promise<Product | null> {
  return getDocument<Product>("products", id);
}

export async function getService(id: string): Promise<Service | null> {
  return getDocument<Service>("services", id);
}
