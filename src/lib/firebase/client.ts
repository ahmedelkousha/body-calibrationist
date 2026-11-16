import { getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const authDomain =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`;

export const isFirebaseConfigured = Boolean(apiKey && projectId);

function getClientApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to .env, then restart the dev server.",
    );
  }

  try {
    return getApp('client-app');
  } catch {
    return initializeApp({ apiKey, authDomain, projectId }, 'client-app');
  }
}

export const getClientAuth = (): Auth => getAuth(getClientApp());
export const getClientDb = (): Firestore => getFirestore(getClientApp());