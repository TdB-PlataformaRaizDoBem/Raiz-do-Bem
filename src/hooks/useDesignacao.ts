import { useAsync } from "./useAsync";
import { getBeneficiariosParaDesignacao } from "../services/DesignacaoService";

export const useDesignacao = () => {
  const {
    data,
    loading,
    error,
    refetch,
  } = useAsync(getBeneficiariosParaDesignacao);

  return {
    pendentes: data ?? [],
    loading,
    error,
    refetch,
  };
};