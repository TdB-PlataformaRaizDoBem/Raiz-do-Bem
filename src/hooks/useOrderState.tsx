import React from 'react';
import { PedidoAjuda } from '../data/pedidosAjudaData';

export const useOrderStats = () => {
  return React.useMemo(() => {
    const pendentesList = PedidoAjuda.filter(p => p.situacao === "Pendente");

    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    // Ordenação: Mais antigo primeiro (Fila de Espera)
    const pedidosCriticos = [...pendentesList]
      .sort((a, b) => parseDate(a.data).getTime() - parseDate(b.data).getTime())
      .slice(0, 10);

    return {
      pendentes: pendentesList.length,
      aprovados: PedidoAjuda.filter(p => p.situacao === "Aprovado").length,
      negados: PedidoAjuda.filter(p => p.situacao === "Negado").length,
      total: PedidoAjuda.length,
      pedidosCriticos
    };
  }, [PedidoAjuda]);
};