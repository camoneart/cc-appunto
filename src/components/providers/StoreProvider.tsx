'use client';

import { useEffect } from 'react';
import { useBoardStore } from '@/stores/boardStore';

// Triggers zustand persist rehydration on client mount
// Prevents SSR hydration mismatch by deferring localStorage read to useEffect
export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useBoardStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
