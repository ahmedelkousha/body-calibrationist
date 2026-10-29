/**
 * Reads Firebase configuration from the environment.
 *
 * Two credentials sets are used:
 * - Admin SDK: project ID, client email and private key (server only).
 * - Web/Identity Toolkit: the public API key, used by the login form.
 *
 * Nothing here is imported into client components directly; the login page
 * passes only the public values it needs to the form.
 */

export type FirebaseServerConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
};

function clean(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

export function getFirebaseServerConfig(): FirebaseServerConfig | null {
  const projectId = clean(process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = clean(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function getFirebaseClientConfig(): FirebaseClientConfig | null {
  const apiKey = clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const projectId = clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID);
  const authDomain = clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || (projectId ? `${projectId}.firebaseapp.com` : "");

  if (!apiKey || !projectId) return null;
  return { apiKey, authDomain, projectId };
}

/** True when the Admin SDK has enough credentials to reach Firestore. */
export function hasFirebaseAdminConfig(): boolean {
  return getFirebaseServerConfig() !== null;
}

/** True when both server and browser credentials are present, so sign-in can work. */
export function hasFirebaseLoginConfig(): boolean {
  return hasFirebaseAdminConfig() && getFirebaseClientConfig() !== null;
}

