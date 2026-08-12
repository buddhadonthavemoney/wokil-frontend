'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Defaults matter more here than they look. react-query ships staleTime 0,
  // which marks every result stale the moment it resolves — so every page
  // remount and every tab focus refires the query. ['profile'] is read by four
  // pages, so just moving between them was one request each time.
  // Mutations still call invalidateQueries, which refetches regardless of
  // staleTime, so writes stay immediately visible.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
