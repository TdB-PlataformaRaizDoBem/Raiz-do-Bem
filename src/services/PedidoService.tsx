import { PedidoAjuda, type PedidoAjudaData } from "../data/pedidosAjudaData";
import { beneficiariosData } from "../data/beneficiariosData";

export type PedidoCompleto = PedidoAjudaData;

// GET /api/pedidos/:id
export const getPedidoCompleto = async (
  id: number
): Promise<PedidoCompleto | null> => {
  await new Promise((r) => setTimeout(r, 300));
  return PedidoAjuda.find((p) => p.id === id) ?? null;
};

// GET /api/pedidos
export const getPedidosCompletos = async (): Promise<PedidoCompleto[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return PedidoAjuda;
};

// GET /api/pedidos?situacao=Aprovado&sem_beneficiario=true
export const getPedidosAprovadosLivres = async (): Promise<PedidoCompleto[]> => {
  await new Promise((r) => setTimeout(r, 300));

  const vinculados = new Set(
    beneficiariosData.map((b) => b.id_pedido_ajuda)
  );

  return PedidoAjuda.filter(
    (p) => p.situacao === "Aprovado" && !vinculados.has(p.id)
  );
};

// PATCH /api/pedidos/:id/aprovar
export const aprovarPedido = async (id: number): Promise<void> => {
  await new Promise((r) => setTimeout(r, 300));

  const pedido = PedidoAjuda.find((p) => p.id === id);
  if (pedido) pedido.situacao = "Aprovado";
};

// PATCH /api/pedidos/:id/negado
export const negarPedido = async (id: number): Promise<void> => {
  await new Promise((r) => setTimeout(r, 300));

  const pedido = PedidoAjuda.find((p) => p.id === id);
  if (pedido) pedido.situacao = "Negado";
};