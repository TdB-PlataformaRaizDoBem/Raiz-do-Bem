import { useAsync } from "./useAsync";
import {
  getPedidosCompletos,
  getPedidosAprovadosLivres,
} from "../services/PedidoService";
import { getAtendimentos } from "../services/AtendimentoService";
import type { PedidoViewModel } from "../domain/mappers/PedidoMapper";

export type DesignacaoTab = "PENDENTE" | "EM_ATENDIMENTO" | "CONCLUIDO" | "TODOS";

async function fetchPorTab(tab: DesignacaoTab): Promise<PedidoViewModel[]> {
  switch (tab) {
    case "PENDENTE":
      return getPedidosAprovadosLivres();

    case "EM_ATENDIMENTO": {
      const todos = await getPedidosCompletos();
      return todos.filter((p) => p.dentistaAtribuido !== null);
    }

    case "CONCLUIDO": {
      const [todos, atendimentos] = await Promise.all([
        getPedidosCompletos(),
        getAtendimentos(),
      ]);
      const cpfsConcluidos = new Set(
        atendimentos
          .filter((a) => a.dataFim !== null)
          .map((a) => a.beneficiario)
          .filter((b): b is string => b !== null),
      );
      return todos.filter((p) => cpfsConcluidos.has(p.cpf));
    }

    case "TODOS":
      return getPedidosCompletos();
  }
}

export const useDesignacao = (tab: DesignacaoTab) => {
  const { data, loading, error, refetch } = useAsync(
    () => fetchPorTab(tab),
    [tab],
  );
  return {
    pendentes: data ?? ([] as PedidoViewModel[]),
    loading,
    error,
    refetch,
  };
};
