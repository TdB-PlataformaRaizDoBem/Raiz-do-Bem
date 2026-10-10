import { getProgramasSociais } from "../services/ProgramaService";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

/** Programas sociais (dado de referência, `staleTime` de 10 min). */
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
