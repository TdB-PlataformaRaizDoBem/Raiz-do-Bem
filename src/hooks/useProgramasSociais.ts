import { getProgramasSociais } from "../services/ProgramaService";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

// Dado de referência: muda raramente, então fica 10 minutos em cache.
export const useProgramasSociais = () => {
  const { data, loading, error, refetch } = useDomainQuery({
    queryKey: queryKeys.programasSociais,
    queryFn: getProgramasSociais,
    staleTime: 10 * 60_000,
  });
  return {
    programas: data ?? [],
    loading,
    error,
    refetch,
  };
};
