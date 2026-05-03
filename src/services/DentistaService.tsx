/**
 * Endpoints consumidos (DentistaController.java):
 *   GET    /dentista         → listar todos
 *   GET    /dentista/:cpf    → buscar por CPF
 *   POST   /dentista         → criar (voluntário)
 *   PUT    /dentista/:cpf    → atualizar
 *   DELETE /dentista/:cpf    → excluir
 */

import type { DentistaAPI } from "../domain/entities/DentistaAPI";
import type { CriarDentistaPayload } from "../domain/entities/CriarDentista"
import {
  mapDentista,
  mapDentistas,
  isDentistaDisponivel,
  programaCompativel,
  type DentistaViewModel,
} from "../domain/mappers/DentistaMapper ";
import type { BeneficiarioViewModel } from "../domain/mappers/Beneficiariomapper";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/dentista`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensagem = `Erro ${res.status}`;
    try {
      const body = await res.json();
      mensagem = body?.message ?? body?.error ?? mensagem;
    } catch { /* manter mensagem padrão */ }
    throw new Error(mensagem);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export async function getDentistasCompletos(): Promise<DentistaViewModel[]> {
  const res = await fetch(ENDPOINT);
  const data = await handleResponse<DentistaAPI[]>(res);
  return mapDentistas(data);
}

export async function getDentistaCompleto(
  cpf: string
): Promise<DentistaViewModel | null> {
  const res = await fetch(`${ENDPOINT}/${cpf}`);
  if (res.status === 404) return null;
  const data = await handleResponse<DentistaAPI>(res);
  return mapDentista(data);
}

/**
 * Retorna dentistas disponíveis próximos ao beneficiário.
 */
export async function getDentistasProximos(
  beneficiario: BeneficiarioViewModel
): Promise<DentistaViewModel[]> {
  const todos = await getDentistasCompletos();

  const disponiveis = todos.filter(
    (d) =>
      isDentistaDisponivel(d) &&
      programaCompativel(d, beneficiario.programaSocial)
  );

  const cidade = beneficiario.endereco?.cidade;
  const estado = beneficiario.endereco?.estado;

  const porCidade = cidade
    ? disponiveis.filter((d) => d.endereco?.cidade === cidade)
    : [];

  if (porCidade.length > 0) return porCidade;

  return estado
    ? disponiveis.filter((d) => d.endereco?.estado === estado)
    : disponiveis;
}

/**
 * POST /dentista
 * Cadastro de voluntário (VoluntaryForm.tsx).
 */
export async function criarDentista(
  payload: CriarDentistaPayload
): Promise<DentistaViewModel> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<DentistaAPI>(res);
  return mapDentista(data);
}

export async function atualizarDentista(
  cpf: string,
  payload: Partial<CriarDentistaPayload>
): Promise<DentistaViewModel> {
  const res = await fetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<DentistaAPI>(res);
  return mapDentista(data);
}

export async function excluirDentista(cpf: string): Promise<void> {
  const res = await fetch(`${ENDPOINT}/${cpf}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export type DentistaCompleto = DentistaViewModel;