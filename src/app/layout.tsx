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

  useEffect(() => {
    const instance = initializeFirebase();
    setFirebaseInstance(instance);
  }, []);

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
