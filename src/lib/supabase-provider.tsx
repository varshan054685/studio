'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Handle OAuth callback code exchange
    (async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code') || hashParams.get('code');

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40" />
          <p className="text-sm font-headline font-bold text-muted-foreground tracking-widest uppercase">
            Initializing Lumina...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
