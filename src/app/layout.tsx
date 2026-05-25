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
  const [firebaseInstance, setFirebaseInstance] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const instance = initializeFirebase();
    if (instance) {
      setFirebaseInstance(instance);
    } else {
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <html lang="en" className="dark">
        <body className="bg-background flex items-center justify-center min-h-screen p-4 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Configuration Required</h1>
            <p className="text-muted-foreground">
              Lumina Finance could not initialize Firebase. Please ensure you have added your 
              Firebase configuration to your environment variables (e.g., in a <code>.env</code> file).
            </p>
            <div className="p-4 bg-muted rounded-lg text-left text-xs font-mono overflow-auto">
              NEXT_PUBLIC_FIREBASE_API_KEY=...<br/>
              NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...<br/>
              NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
            </div>
          </div>
        </body>
      </html>
    );
  }

<<<<<<< HEAD
=======
  if (!firebaseInstance) return (
    <html lang="en" className="dark">
      <body className="bg-background" />
    </html>
  );

>>>>>>> 679ba8a (there is lot of arror fix it)
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <title>Lumina Finance | Intelligent Budgeting</title>
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        {!firebaseInstance ? (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40" />
              <div className="h-4 w-32 bg-muted rounded" />
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
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (pathname === '/login') return <>{children}</>;

  return user ? <>{children}</> : null;
}
