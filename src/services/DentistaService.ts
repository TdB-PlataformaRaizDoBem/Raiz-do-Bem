import type { DentistaAPI } from "../domain/entities/DentistaAPI";
import type { CriarDentistaPayload } from "../domain/entities/CriarDentista";
import {
  mapDentista,
  mapDentistas,
  type DentistaViewModel,
} from "../domain/mappers/DentistaMapper";
import type { AtualizarDentistaPayload } from "../domain/entities/AtualizarDentista";
import { handleResponse, assertOk, safeFetch, publicFetch } from "./httpClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/dentista`;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * GET /dentista
 */
export async function getDentistasCompletos(): Promise<DentistaViewModel[]> {
  const res = await safeFetch(ENDPOINT);
  
  // Se o backend disser que não encontrou registros (404), tratamos como lista vazia amigavelmente
  if (res.status === 404 || res.status === 204) {
    return [];
  }

  const data = await handleResponse<DentistaAPI[]>(res);
  
  return mapDentistas(data ?? []);
}

export async function getDentistaCompleto(
  cpf: string,
): Promise<DentistaViewModel | null> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`);
  if (res.status === 404) return null;
  const data = await handleResponse<DentistaAPI>(res);
  return mapDentista(data);
}

/**
 * POST /dentista
 */
export async function criarDentista(
  payload: CriarDentistaPayload,
): Promise<DentistaViewModel> {
  const res = await safeFetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<DentistaAPI>(res);
  return mapDentista(data);
}

/**
 * POST /dentista/voluntario (público — sem autenticação)
 * Endpoint público para registro de dentistas voluntários
 */
export async function registrarDentistaVoluntario(
  payload: CriarDentistaPayload,
): Promise<DentistaViewModel> {
  const res = await publicFetch(`${ENDPOINT}/voluntario`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<DentistaAPI>(res);
  return mapDentista(data);
}

export async function atualizarDentista(
  cpf: string,
  payload: Partial<AtualizarDentistaPayload>,
): Promise<DentistaViewModel> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<DentistaAPI>(res);
  return mapDentista(data);
}

export async function excluirDentista(cpf: string): Promise<void> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export async function exportarDentistasCsv(): Promise<Blob> {
  const res = await safeFetch(`${ENDPOINT}/exportarCsv`);
  await assertOk(res);
  return res.blob();
}

export type DentistaCompleto = DentistaViewModel;