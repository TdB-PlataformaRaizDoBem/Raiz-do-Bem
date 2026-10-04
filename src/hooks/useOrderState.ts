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

// Lê a mesma lista de pedidos da tela de Pedidos de Ajuda: os 3 gráficos do dashboard
// fazem uma única requisição, e o cálculo é refeito só quando a lista muda.
export const useOrderStats = (): OrderStats => {
  const { data } = useQuery({
    queryKey: queryKeys.pedidos,
    queryFn: getPedidosCompletos,
    select: calcularStats,
  });
  return data ?? EMPTY;
};
