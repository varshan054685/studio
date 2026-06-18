
'use client';

import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';

export function useDoc<T = DocumentData>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = onSnapshot(
        ref,
        (snapshot: DocumentSnapshot<T>) => {
          setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore doc error:', err.code ?? 'unknown');
          setError(err instanceof Error ? err : new Error('Doc fetch failed'));
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Firestore doc subscription failed');
      setError(err instanceof Error ? err : new Error('Doc subscription failed'));
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [ref]);

  return { data, loading, error };
}
