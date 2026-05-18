import type { ColaboradorAPI } from "../domain/entities/ColaboradorAPI";
import {
  mapColaborador,
  mapColaboradores,
  type ColaboradorViewModel,
} from "../domain/mappers/ColaboradorMapper";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/colaborador`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensagem = `Erro ${res.status}`;
    try {
      const body = await res.json();
      mensagem = body?.mensagem ?? body?.message ?? mensagem;
    } catch {
      /* manter mensagem padrão */
    }
    throw new Error(mensagem);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export async function getColaboradoresCompletos(): Promise<
  ColaboradorViewModel[]
> {
  const res = await fetch(ENDPOINT);
  const data = await handleResponse<ColaboradorAPI[]>(res);
  return mapColaboradores(data);
}

export async function getColaboradorCompleto(
  id: number,
): Promise<ColaboradorViewModel | null> {
  const todos = await getColaboradoresCompletos();
  return todos.find((c) => c.id === id) ?? null;
}

export async function atualizarColaborador(
  cpf: string,
  payload: Partial<Omit<ColaboradorAPI, "id">>,
): Promise<ColaboradorViewModel | null> {
  const res = await fetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    // Retorna algo genérico ou mapeia apenas o que você enviou, já que não veio corpo
    return null; 
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  return mapColaborador(data);
}

export async function excluirColaborador(cpf: string): Promise<void> {
  const res = await fetch(`${ENDPOINT}/${cpf}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export type ColaboradorCompleto = ColaboradorViewModel;

export async function criarColaborador(
  payload: Omit<ColaboradorAPI, "id">,
): Promise<ColaboradorViewModel> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<ColaboradorAPI>(res);

  return mapColaborador(data);
}