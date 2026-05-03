import { useAsync } from "./useAsync";
import { getPedidosCompletos, getPedidoCompleto, getPedidosAprovadosLivres, type PedidoCompleto } from "../services/PedidoService";

export const usePedidos = () =>
  useAsync<PedidoCompleto[]>(getPedidosCompletos);

export const usePedido = (id: number) =>
  useAsync<PedidoCompleto | null>(
    () => getPedidoCompleto(id),
    [id]
  );

export const usePedidosAprovadosLivres = () =>
  useAsync<PedidoCompleto[]>(getPedidosAprovadosLivres);