import { useAsync } from "./useAsync";
import { getBeneficiariosCompletos } from "../services/Beneficiarioservice";
import { getAtendimentos } from "../services/AtendimentoService";
import type { BeneficiarioViewModel } from "../domain/mappers/Beneficiariomapper";
import {
  mapAtendimentos,
  type AtendimentoViewModel,
} from "../domain/mappers/AtendimentoMapper";

export type DesignacaoTab =
  | "PENDENTE"
  | "EM_ATENDIMENTO"
  | "CONCLUIDO"
  | "TODOS";

export type AtendimentoTab = Exclude<DesignacaoTab, "PENDENTE">;

/**
 * Beneficiários pendentes de designação.
 *
 * Um beneficiário é considerado "pendente" quando seu nomeCompleto NÃO
 * aparece em nenhum registro de Atendimento (campo `beneficiario` do
 * AtendimentoDTO — que vem como string, justamente o nome completo).
 *
 * As buscas são feitas em paralelo e o cruzamento é feito no front,
 * comparando nomes normalizados (trim + lower).
 */
async function fetchBeneficiariosPendentes(): Promise<BeneficiarioViewModel[]> {
  const [beneficiarios, atendimentosApi] = await Promise.all([
    getBeneficiariosCompletos(),
    getAtendimentos().catch(() => []),
  ]);

  const nomesEmAtendimento = new Set(
    atendimentosApi
      .map((a) => a.beneficiario)
      .filter((nome): nome is string => !!nome && nome !== "N/A")
      .map((nome) => nome.trim().toLowerCase()),
  );

  return beneficiarios.filter(
    (b) => !nomesEmAtendimento.has(b.nomeCompleto.trim().toLowerCase()),
  );
}

export const useDesignacaoPendentes = () => {
  const { data, loading, error, refetch } = useAsync(
    fetchBeneficiariosPendentes,
    [],
  );
  return {
    pendentes: data ?? ([] as BeneficiarioViewModel[]),
    loading,
    error,
    refetch,
  };
};

/**
 * Atendimentos, filtrados conforme a aba.
 *
 * - EM_ATENDIMENTO: dataFim === "NÃO FINALIZADO" (encerrado === false)
 * - CONCLUIDO: dataFim diferente de "NÃO FINALIZADO" e não-nulo
 * - TODOS: sem filtro
 */
async function fetchAtendimentos(
  tab: AtendimentoTab,
): Promise<AtendimentoViewModel[]> {
  const api = await getAtendimentos();
  const lista = mapAtendimentos(api);

  switch (tab) {
    case "EM_ATENDIMENTO":
      return lista.filter((a) => !a.encerrado);
    case "CONCLUIDO":
      return lista.filter((a) => a.encerrado);
    case "TODOS":
    default:
      return lista;
  }
}

export const useAtendimentos = (tab: AtendimentoTab) => {
  const { data, loading, error, refetch } = useAsync(
    () => fetchAtendimentos(tab),
    [tab],
  );
  return {
    atendimentos: data ?? ([] as AtendimentoViewModel[]),
    loading,
    error,
    refetch,
  };
};
