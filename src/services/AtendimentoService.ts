import type { AtendimentoAPI } from "../domain/entities/AtendimentoAPI";
import { handleResponse, assertOk, safeFetch } from "./httpClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
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
 * GET /atendimento
 */
export async function getAtendimentos(): Promise<AtendimentoAPI[]> {
  const res = await safeFetch(ENDPOINT);

  if (res.status === 404 || res.status === 204) {
    return [];
  }

  const data = await handleResponse<AtendimentoAPI[]>(res);

  // Garante o retorno de um array vazio seguro para o front se o dado vier nulo
  return data ?? [];
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
