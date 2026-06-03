import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
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
    
    // Safely initialize Firestore with long-polling to prevent assertion errors in cloud environments
    let firestore: Firestore;
    try {
      firestore = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      firestore = getFirestore(firebaseApp);
    }
    
    const auth = getAuth(firebaseApp);

    // Only connect to emulators if explicitly in a demo environment
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const isEmulatorConnected = (auth as any)._emulatorConfig !== undefined;
      if (!isEmulatorConnected && firebaseConfig.projectId?.startsWith('demo-')) {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        console.log('Connected to Firebase Local Emulators');
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