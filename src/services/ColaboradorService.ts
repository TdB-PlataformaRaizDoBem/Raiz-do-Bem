import type { ColaboradorAPI } from "../domain/entities/ColaboradorAPI";
import {
  mapColaborador,
  mapColaboradores,
  type ColaboradorViewModel,
} from "../domain/mappers/ColaboradorMapper";
import { handleResponse, safeFetch } from "./httpClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/colaborador`;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * GET /colaborador
 */
export async function getColaboradoresCompletos(): Promise<
  ColaboradorViewModel[]
> {
  const res = await safeFetch(ENDPOINT);

  if (res.status === 404 || res.status === 204) {
    return [];
  }

  const data = await handleResponse<ColaboradorAPI[]>(res);
  
  return mapColaboradores(data ?? []);
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
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null; 
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  return mapColaborador(data);
}

export async function excluirColaborador(cpf: string): Promise<void> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export type ColaboradorCompleto = ColaboradorViewModel;

export async function criarColaborador(
  payload: Omit<ColaboradorAPI, "id">,
): Promise<ColaboradorViewModel> {
  const res = await safeFetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<ColaboradorAPI>(res);

  return mapColaborador(data);
}