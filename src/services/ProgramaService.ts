import type { ProgramaSocialAPI } from "../domain/types/api-schema";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/programas-sociais`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensagem = `Erro ${res.status}`;
    try {
      const body = await res.json();
      mensagem = body?.message ?? body?.error ?? mensagem;
    } catch {
      /* manter mensagem padrão */
    }
    throw new Error(mensagem);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getProgramasSociais(): Promise<ProgramaSocialAPI[]> {
  const res = await fetch(ENDPOINT);
  return handleResponse<ProgramaSocialAPI[]>(res);
}

export type { ProgramaSocialAPI };
