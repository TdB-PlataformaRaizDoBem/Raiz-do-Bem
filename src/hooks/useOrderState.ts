import { useQuery } from "@tanstack/react-query";
import { getPedidosCompletos } from "../services/PedidoService";
import type { PedidoViewModel } from "../domain/mappers/PedidoMapper";
import { queryKeys } from "./queryKeys";

interface OrderStats {
  pendentes: number;
  aprovados: number;
  negados: number;
  total: number;
  pedidosCriticos: PedidoViewModel[];
}

const EMPTY: OrderStats = { pendentes: 0, aprovados: 0, negados: 0, total: 0, pedidosCriticos: [] };

function calcularStats(lista: PedidoViewModel[]): OrderStats {
  const pendentes = lista.filter((p) => p.statusAPI === "PENDENTE");
  const aprovados = lista.filter((p) => p.statusAPI === "APROVADO").length;
  const negados = lista.filter((p) => p.statusAPI === "REJEITADO").length;

  // Top-10 mais antigos (ISO-8601 → comparação lexicográfica funciona diretamente)
  const pedidosCriticos = [...pendentes]
    .sort((a, b) => a.dataPedidoISO.localeCompare(b.dataPedidoISO))
    .slice(0, 10);

  return { pendentes: pendentes.length, aprovados, negados, total: lista.length, pedidosCriticos };
}

/** Contagem de pedidos por status e os 10 pendentes mais antigos. */
export const useOrderStats = (): OrderStats => {
  const { data } = useQuery({
    queryKey: queryKeys.pedidos,
    queryFn: getPedidosCompletos,
    select: calcularStats,
  });
  return data ?? EMPTY;
};
