
'use client';

import { useState, useEffect, useRef } from 'react';
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
  const prevRefRef = useRef<DocumentReference<T> | null>(null);
  const prevDataRef = useRef<(T & { id: string }) | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setError(null);
      setData(null);
      prevRefRef.current = null;
      prevDataRef.current = null;
      isFirstRenderRef.current = true;
      return;
    }

    if (!isFirstRenderRef.current && prevRefRef.current === ref && prevDataRef.current !== null) {
      return;
    }
    isFirstRenderRef.current = false;
    prevRefRef.current = ref;

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = onSnapshot(
        ref,
        (snapshot: DocumentSnapshot<T>) => {
          const nextData = snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;
          prevDataRef.current = nextData;
          setData(nextData);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore doc error:', err.code ?? 'unknown');
          setError(err instanceof Error ? err : new Error('Doc fetch failed'));
          setLoading(false);
        }
      );

      return () => {
        unsubscribe();
        if (prevRefRef.current === ref) {
          prevRefRef.current = null;
        }
      };
    } catch (err) {
      console.error('Firestore doc subscription failed');
      setError(err instanceof Error ? err : new Error('Doc subscription failed'));
      setLoading(false);
      return;
    }
  }, [ref]);

  return { data, loading, error };
}
