// SMARTMOVE Real-Time Data Hook
// Connects to Supabase Realtime when connected, and binds to reactive multi-tab cityStore

import { useState, useEffect } from 'react';
import { supabase, isRealSupabaseConfigured } from '../lib/supabase/client';
import { cityStore } from '../lib/supabase/mockStore';

export function useRealtimeTable<T = any>(table: string, filter?: { column: string; value: any }) {
  const [data, setData] = useState<T[]>(() => {
    const initial = cityStore.getTableData(table);
    if (Array.isArray(initial)) {
      if (filter) {
        return initial.filter((item: any) => item[filter.column] === filter.value);
      }
      return initial;
    }
    return initial ? [initial] : [];
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    let isMounted = true;

    const refreshData = () => {
      const raw = cityStore.getTableData(table);
      if (!isMounted) return;
      if (Array.isArray(raw)) {
        if (filter) {
          setData(raw.filter((item: any) => item[filter.column] === filter.value));
        } else {
          setData([...raw]);
        }
      } else if (raw) {
        setData([raw]);
      }
      setLastUpdated(new Date());
    };

    // Initial load & subscribe to local reactive store
    refreshData();
    const unsubscribeStore = cityStore.subscribe(table, refreshData);

    // If real Supabase configured, also subscribe to postgres_changes
    let channel: any = null;
    if (isRealSupabaseConfigured) {
      supabase
        .from(table)
        .select('*')
        .then(({ data: fetched, error }) => {
          if (!error && fetched && isMounted) {
            setData(fetched as T[]);
            setLastUpdated(new Date());
          }
        });

      const uniqueChannelName = `rt_${table}_${Math.random().toString(36).slice(2, 8)}`;
      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            if (!isMounted) return;
            // Merge changes
            if (payload.eventType === 'INSERT') {
              setData((prev) => [payload.new as T, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item: any) => (item.id === payload.new.id ? payload.new : item))
              );
            } else if (payload.eventType === 'DELETE') {
              setData((prev) => prev.filter((item: any) => item.id !== payload.old.id));
            }
            setLastUpdated(new Date());
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      unsubscribeStore();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, filter?.column, filter?.value]);

  return { data, lastUpdated };
}
