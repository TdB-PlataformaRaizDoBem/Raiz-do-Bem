import { QueryClient } from '@tanstack/react-query';
import { connectMutationInvalidation } from '../lib/queryClient';

/**
 * Cliente de cache para testes: mesmas regras do app (staleTime, invalidação por escrita),
 * sem retry e sem timers de coleta (gcTime infinito) para os testes terminarem limpos.
 */
export function createTestQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, gcTime: Infinity, retry: false, refetchOnWindowFocus: false },
    },
  });
  connectMutationInvalidation(client);
  return client;
}
