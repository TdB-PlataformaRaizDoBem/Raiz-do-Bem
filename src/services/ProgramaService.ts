import type { ProgramaSocialAPI } from "../domain/types/api-schema";
import { handleResponse, safeFetch } from "./httpClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/programas-sociais`;

/**
 * GET /programas-sociais
 */
export async function getProgramasSociais(): Promise<ProgramaSocialAPI[]> {
  const res = await safeFetch(ENDPOINT);

  if (res.status === 404 || res.status === 204) {
    return [];
  }

  const data = await handleResponse<ProgramaSocialAPI[]>(res);
  
  return data ?? [];
}

export type { ProgramaSocialAPI };