import { useAsync } from "./useAsync";
import { getProgramasSociais } from "../services/ProgramaService";

export const useProgramasSociais = () => {
  const { data, loading, error, refetch } = useAsync(getProgramasSociais);
  return {
    programas: data ?? [],
    loading,
    error,
    refetch,
  };
};
