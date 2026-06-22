'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { SupabaseProvider } from '@/lib/supabase-provider';
import { useUser } from '@/lib/use-user';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>Lumina Finance | Intelligent Budgeting</title>
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <SupabaseProvider>
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
        </SupabaseProvider>
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
