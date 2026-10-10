import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBeneficiariosCompletos } from "../services/Beneficiarioservice";
import { getAtendimentos } from "../services/AtendimentoService";
import { normalizeStr } from "../utils/formatUtils";
import type { BeneficiarioViewModel } from "../domain/mappers/Beneficiariomapper";
import {
  mapAtendimentos,
  type AtendimentoViewModel,
} from "../domain/mappers/AtendimentoMapper";
import type { AtendimentoAPI } from "../domain/entities/AtendimentoAPI";
import { queryKeys } from "./queryKeys";

export type DesignacaoTab =
  | "PENDENTE"
  | "EM_ATENDIMENTO"
  | "CONCLUIDO"
  | "TODOS";

export type AtendimentoTab = Exclude<DesignacaoTab, "PENDENTE">;

/** Beneficiários cujo nome ainda não aparece em nenhum atendimento. */
export const useDesignacaoPendentes = () => {
  const beneficiarios = useQuery({ queryKey: queryKeys.beneficiarios, queryFn: getBeneficiariosCompletos });
  const atendimentos = useQuery({ queryKey: queryKeys.atendimentos, queryFn: getAtendimentos });

  const pendentes = useMemo<BeneficiarioViewModel[]>(() => {
    const nomesEmAtendimento = new Set(
      (atendimentos.data ?? [])
        .map((a) => a.beneficiario)
        .filter((nome): nome is string => !!nome && nome !== "N/A")
        .map(normalizeStr),
    );
    return (beneficiarios.data ?? []).filter(
      (b) => !nomesEmAtendimento.has(normalizeStr(b.nomeCompleto)),
    );
  }, [beneficiarios.data, atendimentos.data]);

  const loading =
    (beneficiarios.isPending && beneficiarios.fetchStatus !== "idle") ||
    (atendimentos.isPending && atendimentos.fetchStatus !== "idle");

  return {
    pendentes,
    loading,
    error: beneficiarios.isError && beneficiarios.data === undefined ? beneficiarios.error.message : null,
    refetch: () =>
      Promise.all([
        beneficiarios.refetch({ cancelRefetch: false }),
        atendimentos.refetch({ cancelRefetch: false }),
      ]),
  };
};

/** Atendimentos da aba: EM_ATENDIMENTO (`dataFim` "NÃO FINALIZADO"), CONCLUIDO ou TODOS. */
function filtrarPorAba(api: AtendimentoAPI[], tab: AtendimentoTab): AtendimentoViewModel[] {
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
  const { data, isPending, fetchStatus, isError, error, refetch } = useQuery({
    queryKey: queryKeys.atendimentos,
    queryFn: getAtendimentos,
    select: (api) => filtrarPorAba(api, tab),
  });
  return {
    atendimentos: data ?? ([] as AtendimentoViewModel[]),
    loading: isPending && fetchStatus !== "idle",
    error: isError && data === undefined ? error.message : null,
    refetch: () => refetch({ cancelRefetch: false }),
  };
};
