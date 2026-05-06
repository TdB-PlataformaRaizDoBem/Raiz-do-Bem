import { useState, useEffect } from "react";
import { getPedidosCompletos } from "../services/PedidoService";
import type { PedidoViewModel } from "../domain/mappers/PedidoMapper";

interface OrderStats {
  pendentes: number;
  aprovados: number;
  negados: number;
  total: number;
  pedidosCriticos: PedidoViewModel[];
}

const EMPTY: OrderStats = { pendentes: 0, aprovados: 0, negados: 0, total: 0, pedidosCriticos: [] };

export const useOrderStats = () => {
  const [stats, setStats] = useState<OrderStats>(EMPTY);

  useEffect(() => {
    getPedidosCompletos()
      .then((lista: PedidoViewModel[]) => {
        const pendentes = lista.filter((p) => p.statusAPI === "PENDENTE");
        const aprovados = lista.filter((p) => p.statusAPI === "APROVADO").length;
        const negados = lista.filter((p) => p.statusAPI === "REJEITADO").length;

        // Top-10 mais antigos (ISO-8601 → comparação lexicográfica funciona diretamente)
        const pedidosCriticos = [...pendentes]
          .sort((a, b) => a.dataPedido.localeCompare(b.dataPedido))
          .slice(0, 10);

        setStats({ pendentes: pendentes.length, aprovados, negados, total: lista.length, pedidosCriticos });
      })
      .catch(() => setStats(EMPTY));
  }, []);

  return stats;
};
