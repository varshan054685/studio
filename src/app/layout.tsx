'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { initializeFirebase, FirebaseClientProvider, useUser } from '@/firebase';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [firebaseInstance, setFirebaseInstance] = useState<ReturnType<typeof initializeFirebase> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const instance = initializeFirebase();
      if (instance) {
        setFirebaseInstance(instance);
      } else {
        // Check if config is actually missing
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          setError(true);
        }
      }
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <html lang="en" className="dark">
        <body className="bg-background flex items-center justify-center min-h-screen p-4 text-center">
          <div className="max-w-md space-y-6 glass-card p-10 rounded-3xl border border-white/10">
            <h1 className="text-3xl font-headline font-bold text-primary">Configuration Needed</h1>
            <p className="text-muted-foreground">
              Lumina Finance requires a Firebase project. Please add your configuration 
              to the environment variables.
            </p>
            <div className="p-4 bg-muted/50 rounded-xl text-left text-xs font-mono overflow-auto border border-white/5">
              NEXT_PUBLIC_FIREBASE_API_KEY=...<br/>
              NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...<br/>
              NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <head>
        <title>Lumina Finance | Intelligent Budgeting</title>
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        {!firebaseInstance ? (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40" />
              <p className="text-sm font-headline font-bold text-muted-foreground tracking-widest uppercase">Initializing Lumina...</p>
            </div>
          </div>
        ) : (
          <FirebaseClientProvider 
            firebaseApp={firebaseInstance.firebaseApp} 
            firestore={firebaseInstance.firestore} 
            auth={firebaseInstance.auth}
          >
            <AuthGuard>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <MobileNav />
                  <main className="flex-1 overflow-y-auto">
                    {children}
                  </main>
                </div>
              </div>
            </AuthGuard>
            <Toaster />
          </FirebaseClientProvider>
        )}
      </body>
    </html>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40" />
          <p className="text-sm font-headline font-bold text-muted-foreground tracking-widest uppercase">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/login') return <>{children}</>;

  return user ? <>{children}</> : null;
}
