import type { EspecialidadeAPI } from "../domain/entities/EspecialidadeAPI";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/especialidades`;

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
  return res.json() as Promise<T>;
}

/**
 * GET /especialidades
 */
export async function getEspecialidades(): Promise<EspecialidadeAPI[]> {
  const res = await fetch(ENDPOINT);

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
  const res = await fetch(`${ENDPOINT}/${id}`);
  return handleResponse<EspecialidadeAPI>(res);
}