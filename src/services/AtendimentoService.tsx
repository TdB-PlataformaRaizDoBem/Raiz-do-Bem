/**
 * Endpoints consumidos (AtendimentoResource.java):
 *   GET    /atendimento          → listar todos
 *   GET    /atendimento/:cpf     → buscar por CPF do beneficiário
 *   POST   /atendimento          → criar designação (beneficiário + dentista)
 *   PUT    /atendimento/:cpf     → encerrar atendimento (prontuário + idColaborador)
 *   DELETE /atendimento/:id      → excluir atendimento
 */

import type { AtendimentoAPI } from "../domain/entities/AtendimentoAPI";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/atendimento`;

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

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export interface CriarAtendimentoPayload {
  prontuario?: string;
  beneficiario: { id: number };
  dentista: { id: number };
}

/**
 * POST /atendimento
 * Cria designação vinculando beneficiário a um dentista.
 * O back-end seta dataInicial = LocalDate.now() automaticamente.
 */
export async function criarAtendimento(
  payload: CriarAtendimentoPayload
): Promise<AtendimentoAPI> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AtendimentoAPI>(res);
}

/**
 * GET /atendimento
 * Lista todos os atendimentos.
 */
export async function getAtendimentos(): Promise<AtendimentoAPI[]> {
  const res = await fetch(ENDPOINT);
  return handleResponse<AtendimentoAPI[]>(res);
}

/**
 * GET /atendimento/:cpf
 * Busca atendimento pelo CPF do beneficiário.
 */
export async function getAtendimentoPorCpf(
  cpf: string
): Promise<AtendimentoAPI | null> {
  const res = await fetch(`${ENDPOINT}/${cpf}`);
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
  payload: EncerrarAtendimentoPayload
): Promise<void> {
  const res = await fetch(`${ENDPOINT}/${cpf}`, {
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
  const res = await fetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
  await handleResponse<void>(res);
}
