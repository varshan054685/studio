import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} | null {
  try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
      return null;
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
      // Force long polling to prevent assertion failures in cloud environments
      firestore = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
      });
      auth = getAuth(firebaseApp);
    } else {
      firebaseApp = getApp();
      firestore = getFirestore(firebaseApp);
      auth = getAuth(firebaseApp);
    }

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
