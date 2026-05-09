/**
 * Endpoints consumidos (ColaboradorController.java):
 *   GET    /colaborador         → listar todos
 *   PUT    /colaborador/:cpf    → atualizar
 *   DELETE /colaborador/:cpf    → excluir
 *
 * NOTA: ColaboradorController não possui GET /:cpf individual ainda.
 *       getColaboradorCompleto busca da lista completa como fallback temporário.
 */

import type { ColaboradorAPI } from "../domain/entities/ColaboradorAPI";
import {
  mapColaborador,
  mapColaboradores,
  type ColaboradorViewModel,
} from '../domain/mappers/ColaboradorMapper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/colaborador`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensagem = `Erro ${res.status}`;
    try {
      const body = await res.json();
      mensagem = body?.message ?? body?.error ?? mensagem;
    } catch { /* manter mensagem padrão */ }
    throw new Error(mensagem);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export async function getColaboradoresCompletos(): Promise<ColaboradorViewModel[]> {
  const res = await fetch(ENDPOINT);
  const data = await handleResponse<ColaboradorAPI[]>(res);
  return mapColaboradores(data);
} 

export async function getColaboradorCompleto(
  id: number
): Promise<ColaboradorViewModel | null> {
  const todos = await getColaboradoresCompletos();
  return todos.find((c) => c.id === id) ?? null;
}

export async function atualizarColaborador(
  cpf: string,
  payload: Partial<Omit<ColaboradorAPI, "id">>
): Promise<ColaboradorViewModel> {
  const res = await fetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<ColaboradorAPI>(res);
  return mapColaborador(data);
}

type RequestFn = (
  url: string,
  options?: RequestInit,
) => Promise<{
  response: Response | null;
  json: unknown;
}>;

export async function excluirColaborador(request: RequestFn, cpf: string): Promise<void> {
  await request(`${ENDPOINT}/${cpf}`, { method: "DELETE" });
}

export type ColaboradorCompleto = ColaboradorViewModel;
 