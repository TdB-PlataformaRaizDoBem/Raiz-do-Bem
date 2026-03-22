import React from "react";
import { PedidoAjuda } from "../data/pedidosAjudaData";

export const useOrderStats = () => {
  return React.useMemo(() => ({
    pendentes: PedidoAjuda.filter(p => p.situacao === "Pendente").length,
    aprovados: PedidoAjuda.filter(p => p.situacao === "Aprovado").length,
    negados: PedidoAjuda.filter(p => p.situacao === "Negado").length,
    total: PedidoAjuda.length
  }), [PedidoAjuda]);
};