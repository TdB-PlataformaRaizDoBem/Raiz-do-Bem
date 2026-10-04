import { useQuery, type QueryKey } from "@tanstack/react-query";

export type DomainQueryState<T> = {
  status: "loading" | "success" | "error";
  data: T | null;
  error: string | null;
  /** true só enquanto não há nenhum dado (atualização em segundo plano não conta). */
  loading: boolean;
  /** Reaproveita uma busca já em andamento em vez de disparar outra. */
  refetch: () => Promise<unknown>;
};

type Options<TRaw, TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TRaw>;
  select?: (raw: TRaw) => TData;
  staleTime?: number;
  enabled?: boolean;
};

/**
 * Casca fina sobre `useQuery` que mantém o formato antigo dos hooks de domínio
 * (`data`, `loading`, `error`, `refetch`), para as telas não precisarem mudar.
 */
export function useDomainQuery<TRaw, TData = TRaw>(options: Options<TRaw, TData>): DomainQueryState<TData> {
  const query = useQuery(options);

  const semDados = query.data === undefined;
  const loading = query.isPending && query.fetchStatus !== "idle";
  // Falha ao atualizar com dados em cache: mantém a tela com os dados antigos em vez de apagá-la.
  const error = query.isError && semDados ? query.error.message : null;

  return {
    status: error ? "error" : query.isSuccess ? "success" : "loading",
    data: query.data ?? null,
    error,
    loading,
    refetch: () => query.refetch({ cancelRefetch: false }),
  };
}
