'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseCollectionOptions {
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

/**
 * Realtime-like collection hook for Supabase.
 * Returns { data, loading, error, refetch }.
 * Call `refetch()` after mutations to refresh data.
 */
export function useCollection<T extends object = Record<string, unknown>>(
  table: string | null,
  userId: string | undefined,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<Array<T & { id: string }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!table || !userId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let q = supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);

    if (options?.orderBy) {
      q = q.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }
    if (options?.limit) {
      q = q.limit(options.limit);
    }

    const { data: rows, error: err } = await q;

    if (err) {
      console.error(`Supabase ${table} error:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } else {
      setData(
        ((rows as Record<string, unknown>[]) ?? []).map((row) => ({
          ...(row as unknown as T),
          id: row.id as string,
        }))
      );
    }
    setLoading(false);
  }, [table, userId, options?.orderBy?.column, options?.orderBy?.ascending, options?.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
