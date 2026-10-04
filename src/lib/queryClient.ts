import { QueryClient } from "@tanstack/react-query";
import { registerMutationListener } from "../services/httpClient";

/**
 * Cache de requisições do app (TanStack Query).
 *
 * - `staleTime` 30s: abrir/voltar para uma tela dentro desse prazo reaproveita o que já foi
 *   buscado, e vários componentes que pedem o mesmo dado compartilham UMA requisição.
 * - `retry: false`: erros aparecem na hora (mesmo comportamento de antes do cache).
 * - Sem refetch ao focar a janela: evita requisições surpresa durante uma demonstração.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** Cliente único do app. */
export const queryClient = createQueryClient();

/** Endpoints que não alteram dados de domínio (chat e autenticação não invalidam o cache). */
const NAO_INVALIDA = /\/(chat|auth)\//;

/**
 * Qualquer escrita bem-sucedida (POST/PUT/PATCH/DELETE) invalida o cache: as telas que estão
 * abertas buscam de novo e as demais ficam marcadas como desatualizadas. Assim ninguém precisa
 * lembrar de chamar `refetch` depois de criar, editar ou excluir.
 */
export function connectMutationInvalidation(client: QueryClient): void {
  registerMutationListener((url) => {
    if (NAO_INVALIDA.test(url)) return;
    void client.invalidateQueries();
  });
}

connectMutationInvalidation(queryClient);
