import { useQuery } from "@tanstack/react-query";
import { getPedidosCompletos } from "../services/PedidoService";
import type { PedidoViewModel } from "../domain/mappers/PedidoMapper";
import { comparadorPorData } from "../utils/sortUtils";
import { queryKeys } from "./queryKeys";

/** Quantos pedidos entram na lista "mais recentes" do painel. */
export const LIMITE_PEDIDOS_RECENTES = 5;

interface OrderStats {
  pendentes: number;
  aprovados: number;
  negados: number;
  total: number;
  pedidosCriticos: PedidoViewModel[];
  pedidosRecentes: PedidoViewModel[];
}

const EMPTY: OrderStats = {
  pendentes: 0,
  aprovados: 0,
  negados: 0,
  total: 0,
  pedidosCriticos: [],
  pedidosRecentes: [],
};

const porId = (p: PedidoViewModel) => p.id;
const maisAntigosPrimeiro = comparadorPorData<PedidoViewModel>((p) => p.dataPedidoISO, porId, "antigos");
const maisRecentesPrimeiro = comparadorPorData<PedidoViewModel>((p) => p.dataPedidoISO, porId, "recentes");

function calcularStats(lista: PedidoViewModel[]): OrderStats {
  const pendentes = lista.filter((p) => p.statusAPI === "PENDENTE");
  const aprovados = lista.filter((p) => p.statusAPI === "APROVADO").length;
  const negados = lista.filter((p) => p.statusAPI === "REJEITADO").length;

  // Top-10 pendentes mais antigos. A data do pedido não tem hora; no mesmo dia vale a ordem de chegada (id).
  const pedidosCriticos = [...pendentes].sort(maisAntigosPrimeiro).slice(0, 10);

  // Últimos pedidos recebidos, de qualquer status.
  const pedidosRecentes = [...lista].sort(maisRecentesPrimeiro).slice(0, LIMITE_PEDIDOS_RECENTES);

  return { pendentes: pendentes.length, aprovados, negados, total: lista.length, pedidosCriticos, pedidosRecentes };
}

/** Contagem de pedidos por status, os 10 pendentes mais antigos e os pedidos mais recentes. */
export const useOrderStats = (): OrderStats => {
  const { data } = useQuery({
    queryKey: queryKeys.pedidos,
    queryFn: getPedidosCompletos,
    select: calcularStats,
  });
  return data ?? EMPTY;
};
