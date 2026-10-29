import 'server-only';
import { cert, initializeApp, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseServerConfig } from '@/lib/auth/config';

function getAdminApp() {
  try {
    return getApp('admin-app');
  } catch {
    const config = getFirebaseServerConfig();
    if (!config) throw new Error('Firebase is not configured');
    return initializeApp(
      {
        credential: cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
      },
      'admin-app'
    );
  }
}

export const getFirebaseAuth = () => getAuth(getAdminApp());
export const getFirebaseDb = () => getFirestore(getAdminApp());
