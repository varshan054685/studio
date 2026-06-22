'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

/** Normalized user shape compatible with the old Firebase User interface */
export interface AppUser {
  uid: string;
  id: string;
  email: string | undefined;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
  provider: string;
  raw: User;
}

function wrapUser(user: User | null): AppUser | null {
  if (!user) return null;
  const provider =
    user.app_metadata?.provider ||
    (user.identities?.[0]?.provider ?? 'email');

  return {
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName:
      user.user_metadata?.full_name ||
      user.user_metadata?.display_name ||
      null,
    photoURL: user.user_metadata?.avatar_url || null,
    emailVerified: !!user.email_confirmed_at,
    createdAt: user.created_at,
    provider,
    raw: user,
  };
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(wrapUser(user));
  }, []);

  useEffect(() => {
    // Get initial session (also handles OAuth code exchange via detectSessionInUrl)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(wrapUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(wrapUser(session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, refresh };
}
