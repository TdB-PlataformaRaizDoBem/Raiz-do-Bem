import type { CriarPedidoAjudaPayload } from "../domain/entities/CriarPedidoAjuda";
import type { PedidoAjudaAPI } from "../domain/entities/PedidoAjudaAPI";
import {
  mapPedido,
  mapPedidos,
  type PedidoViewModel,
} from "../domain/mappers/PedidoMapper";
import type { StatusPedidoAPI } from "../domain/types/api-schema";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/pedido-ajuda`;

/**
 * Handler de resposta centralizado.
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensagem = `Erro ${res.status}`;
    try {
      const body = await res.json();
      mensagem = body?.mensagem ?? body?.message ?? mensagem;
    } catch {
      // body não é JSON — mantém mensagem padrão
    }
    throw new Error(mensagem);
  }
  // 204 No Content não tem corpo
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * GET /pedido-ajuda
 * Retorna todos os pedidos mapeados para ViewModel.
 */
export async function getPedidosCompletos(): Promise<PedidoViewModel[]> {
  const res = await fetch(ENDPOINT);
  const data = await handleResponse<PedidoAjudaAPI[]>(res);
  return mapPedidos(data);
}

/**
 * GET /pedido-ajuda/:id
 * Retorna pedido específico ou null se não encontrado (404).
 */
export async function getPedidoCompleto(
  id: number,
): Promise<PedidoViewModel | null> {
  const res = await fetch(`${ENDPOINT}/${id}`);
  if (res.status === 404) return null;
  const data = await handleResponse<PedidoAjudaAPI>(res);
  return mapPedido(data);
}

/**
 * GET /pedido-ajuda (filtrado no front)
 * Retorna pedidos com status APROVADO que ainda não possuem beneficiário vinculado.
 */
export async function getPedidosAprovadosLivres(): Promise<PedidoViewModel[]> {
  const todos = await getPedidosCompletos();
  // Excluir pedidos que já possuem beneficiário vinculado
  try {
    const { getBeneficiariosCompletos } = await import("./Beneficiarioservice");
    const beneficiarios = await getBeneficiariosCompletos();
    const vinculados = new Set(
      beneficiarios.map((b) => b.pedido?.id).filter(Boolean) as number[],
    );
    return todos.filter(
      (p) => p.statusAPI === "APROVADO" && !vinculados.has(p.id),
    );
  } catch {
    return todos.filter((p) => p.statusAPI === "APROVADO");
  }
}

/**
 * POST /pedido-ajuda
 * Cria um novo pedido de ajuda (formulário público — sem autenticação).
 */
export async function criarPedidoAjuda(
  payload: CriarPedidoAjudaPayload,
): Promise<PedidoViewModel> {
  const res = await fetch(ENDPOINT, {
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
  const res = await fetch(`${ENDPOINT}/${id}`, {
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
  const res = await fetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export type PedidoCompleto = PedidoViewModel;
