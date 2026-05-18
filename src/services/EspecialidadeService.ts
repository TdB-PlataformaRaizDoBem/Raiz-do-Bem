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

export async function getEspecialidades(): Promise<EspecialidadeAPI[]> {
  const res = await fetch(ENDPOINT);
  return handleResponse<EspecialidadeAPI[]>(res);
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
