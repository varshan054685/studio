import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} | null {
  try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
      return null;
    }

    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Using initializeFirestore with settings to prevent assertion errors in cloud environments
    let firestore: Firestore;
    if (getApps().length > 0) {
      try {
        firestore = getFirestore(firebaseApp);
      } catch (e) {
        firestore = initializeFirestore(firebaseApp, {
          experimentalForceLongPolling: true,
        });
      }
    } else {
      firestore = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
      });
    }
    
    const auth = getAuth(firebaseApp);

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      if (firebaseConfig.projectId?.startsWith('demo-')) {
        // Only connect if not already connected (prevents multiple connection errors)
        const isEmulatorConnected = (auth as any)._emulatorConfig !== undefined;
        if (!isEmulatorConnected) {
          // connectAuthEmulator(auth, 'http://localhost:9099');
          // connectFirestoreEmulator(firestore, 'localhost', 8080);
        }
      }
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
