"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getClientAuth, isFirebaseConfigured } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  /** True until Firebase has restored (or rejected) the persisted session. */
  loading: boolean;
  /** A configuration or network problem, shown instead of an endless spinner. */
  error: string | null;
  signOutNow: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Owns the browser Firebase Auth session for the dashboard.
 *
 * `onAuthStateChanged` is the single source of truth: no session cookie, no
 * server redirect. While `loading` is true the dashboard shows a neutral
 * holding screen so it never flashes protected content before the SDK answers.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string | null>(
    configured
      ? null
      : "Firebase Authentication is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to .env.local, then restart the dev server.",
  );

  useEffect(() => {
    if (!configured) return;

    const unsubscribe = onAuthStateChanged(
      getClientAuth(),
      (nextUser) => {
        setUser(nextUser);
        setError(null);
        setLoading(false);
      },
      (caught) => {
        setError(caught instanceof Error ? caught.message : "Could not reach Firebase Authentication.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [configured]);

  const signOutNow = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    await signOut(getClientAuth());
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, signOutNow }),
    [user, loading, error, signOutNow],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>.");
  return value;
}
