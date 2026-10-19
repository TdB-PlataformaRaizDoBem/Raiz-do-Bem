import type { AtendimentoAPI } from "../domain/entities/AtendimentoAPI";
import { handleResponse, assertOk, safeFetch } from "./httpClient";
import { buscarPagina, buscarTodos, TAMANHO_PAGINA_PADRAO, type Pagina } from "./paginacao";

const BASE_URL = import.meta.env.API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/atendimento`;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export interface CriarAtendimentoPayload {
  prontuario: string;
  cpfBeneficiario: string;
}

/**
 * POST /atendimento
 */
export async function criarAtendimento(
  payload: CriarAtendimentoPayload,
): Promise<AtendimentoAPI> {
  const res = await safeFetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AtendimentoAPI>(res);
}

/**
 * GET /atendimento?pagina=&size= — uma página de atendimentos e o total.
 */
export function getAtendimentosPaginados(
  pagina = 0,
  tamanho = TAMANHO_PAGINA_PADRAO,
): Promise<Pagina<AtendimentoAPI>> {
  return buscarPagina<AtendimentoAPI>(ENDPOINT, pagina, tamanho);
}

/**
 * GET /atendimento — percorre todas as páginas (telas que filtram em memória).
 */
export function getAtendimentos(): Promise<AtendimentoAPI[]> {
  return buscarTodos<AtendimentoAPI>(ENDPOINT);
}

/**
 * GET /atendimento/:cpf
 */
export async function getAtendimentoPorCpf(
  cpf: string,
): Promise<AtendimentoAPI | null> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`);
  if (res.status === 404) return null;
  return handleResponse<AtendimentoAPI>(res);
}

export interface EncerrarAtendimentoPayload {
  prontuario: string;
  idColaborador: number;
}

/**
 * PUT /atendimento/:cpf
 * Encerra atendimento, registrando prontuário e colaborador responsável.
 */
export async function encerrarAtendimento(
  cpf: string,
  payload: EncerrarAtendimentoPayload,
): Promise<void> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  await handleResponse<void>(res);
}

/**
 * DELETE /atendimento/:id
 */
export async function excluirAtendimento(id: number): Promise<void> {
  const res = await safeFetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

/**
 * Retorna um Blob que pode ser usado para disparar o download no navegador
 * via URL.createObjectURL — use em conjunto com ExportCsvButton.
 */
export async function exportarAtendimentosCsv(): Promise<Blob> {
  const res = await safeFetch(`${ENDPOINT}/exportarCsv`);
  await assertOk(res);
  return res.blob();
}
