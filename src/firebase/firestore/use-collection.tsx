'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';

export function useCollection<T extends object = DocumentData>(query: Query<DocumentData> | null) {
  const [data, setData] = useState<Array<T & { id: string }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = onSnapshot(
        query,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const items = snapshot.docs.map((doc) => ({
            ...(doc.data() as T),
            id: doc.id,
          }));
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore collection error:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Firestore collection subscription failed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [query]);

  return { data, loading, error };
}
