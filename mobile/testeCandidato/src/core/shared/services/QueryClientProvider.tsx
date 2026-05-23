import { QueryClient, QueryClientProvider as TanstackProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * React Query handles server-state caching, retries and dedup. We keep the
 * QueryClient inside this provider so the rest of the app only needs to wrap
 * itself once at the root.
 */
const buildClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(buildClient);
  return <TanstackProvider client={client}>{children}</TanstackProvider>;
};
