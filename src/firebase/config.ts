export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Simple check to help debug missing environment variables
if (typeof window !== 'undefined') {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value === 'undefined')
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.warn(
      `Firebase configuration is incomplete. Missing keys: ${missingKeys.join(', ')}. ` +
      'Please ensure your .env file or environment variables are set correctly.'
    );
  }
}
