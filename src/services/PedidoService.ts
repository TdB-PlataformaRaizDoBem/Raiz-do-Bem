import type { CriarPedidoAjudaPayload } from "../domain/entities/CriarPedidoAjuda";
import type { PedidoAjudaAPI } from "../domain/entities/PedidoAjudaAPI";
import {
  mapPedido,
  mapPedidos,
  type PedidoViewModel,
} from "../domain/mappers/PedidoMapper";
import type { StatusPedidoAPI } from "../domain/types/api-schema";
import { handleResponse, safeFetch } from "./httpClient";
import { buscarPagina, buscarTodos, TAMANHO_PAGINA_PADRAO, type Pagina } from "./paginacao";

const BASE_URL = import.meta.env.API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/pedido-ajuda`;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * GET /pedido-ajuda?pagina=&size= — uma página de pedidos e o total.
 */
export async function getPedidosPaginados(
  pagina = 0,
  tamanho = TAMANHO_PAGINA_PADRAO,
): Promise<Pagina<PedidoViewModel>> {
  const p = await buscarPagina<PedidoAjudaAPI>(ENDPOINT, pagina, tamanho);
  return { ...p, itens: mapPedidos(p.itens) };
}

/**
 * GET /pedido-ajuda — percorre todas as páginas e devolve os pedidos mapeados para ViewModel.
 * Lista sem registros (404/204) vira array vazio.
 */
export async function getPedidosCompletos(): Promise<PedidoViewModel[]> {
  return mapPedidos(await buscarTodos<PedidoAjudaAPI>(ENDPOINT));
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