import type { EspecialidadeAPI } from "../domain/entities/EspecialidadeAPI";
import { handleResponse, safeFetch } from "./httpClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/especialidades`;

/**
 * GET /especialidades
 */
export async function getEspecialidades(): Promise<EspecialidadeAPI[]> {
  const res = await safeFetch(ENDPOINT);

  if (res.status === 404 || res.status === 204) {
    return [];
  }

  const data = await handleResponse<EspecialidadeAPI[]>(res);
  
  // Garante o retorno de um array vazio seguro para o front se o dado vier nulo
  return data ?? [];
}

/**
 * GET /especialidades/{id}
 */
export async function getEspecialidadePorId(
  id: number,
): Promise<EspecialidadeAPI> {
  const res = await safeFetch(`${ENDPOINT}/${id}`);
  return handleResponse<EspecialidadeAPI>(res);
}