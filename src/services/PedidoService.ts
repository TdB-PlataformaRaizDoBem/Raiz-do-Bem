import type { CriarPedidoAjudaPayload } from "../domain/entities/CriarPedidoAjuda";
import type { PedidoAjudaAPI } from "../domain/entities/PedidoAjudaAPI";
import {
  mapPedido,
  mapPedidos,
  type PedidoViewModel,
} from "../domain/mappers/PedidoMapper";
import type { StatusPedidoAPI } from "../domain/types/api-schema";
import { handleResponse, safeFetch } from "./httpClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/pedido-ajuda`;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * GET /pedido-ajuda
 * Retorna todos os pedidos mapeados para ViewModel.
 * Alterado para retornar um array vazio caso o backend responda com 404 ou 204 (Lista sem registros)
 */
export async function getPedidosCompletos(): Promise<PedidoViewModel[]> {
  const res = await safeFetch(ENDPOINT);

  // Se o backend disser que não encontrou registros (404 ou 204), tratamos como lista vazia amigavelmente
  if (res.status === 404 || res.status === 204) {
    return [];
  }

  const data = await handleResponse<PedidoAjudaAPI[]>(res);
  
  // Garante que se o data vier nulo ou indefinido, não quebre o mapPedidos
  return mapPedidos(data ?? []);
}

/**
 * O backend não expõe GET /pedido-ajuda/{id}; o pedido é localizado na listagem
 * (GET /pedido-ajuda). Retorna null se não encontrado.
 */
export async function getPedidoCompleto(
  id: number,
): Promise<PedidoViewModel | null> {
  const todos = await getPedidosCompletos();
  return todos.find((p) => p.id === id) ?? null;
}

/**
 * POST /pedido-ajuda
 */
export async function criarPedidoAjuda(
  payload: CriarPedidoAjudaPayload,
): Promise<PedidoViewModel> {
  const res = await safeFetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<PedidoAjudaAPI>(res);
  return mapPedido(data);
}

/**
 * PATCH /pedido-ajuda/:id — Aprovar pedido
 */
export async function aprovarPedido(
  id: number,
  idDentista: number,
): Promise<void> {
  await atualizarStatus(id, "APROVADO", idDentista);
}

/**
 * PATCH /pedido-ajuda/:id — Rejeitar pedido
 */
export async function negarPedido(
  id: number,
  idDentista: number,
): Promise<void> {
  await atualizarStatus(id, "REJEITADO", idDentista);
}

/**
 * PUT /pedido-ajuda/:id —  Atualização genérica de status
 */
async function atualizarStatus(
  id: number,
  novoStatus: StatusPedidoAPI,
  idDentista: number,
): Promise<void> {
  const res = await safeFetch(`${ENDPOINT}/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify({ statusPedido: novoStatus, idDentista }),
  });
  await handleResponse<void>(res);
}

/**
 * DELETE /pedido-ajuda/:id
 */
export async function excluirPedido(id: number): Promise<void> {
  const res = await safeFetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export type PedidoCompleto = PedidoViewModel;