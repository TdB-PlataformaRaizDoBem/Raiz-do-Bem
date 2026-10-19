import type { DentistaAPI } from "../domain/entities/DentistaAPI";
import type { CriarDentistaPayload } from "../domain/entities/CriarDentista";
import {
  mapDentista,
  mapDentistas,
  type DentistaViewModel,
} from "../domain/mappers/DentistaMapper";
import type { AtualizarDentistaPayload } from "../domain/entities/AtualizarDentista";
import { handleResponse, assertOk, safeFetch, publicFetch } from "./httpClient";
import { buscarPagina, buscarTodos, TAMANHO_PAGINA_PADRAO, type Pagina } from "./paginacao";

const BASE_URL = import.meta.env.API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/dentista`;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * GET /dentista?pagina=&size= — uma página de dentistas e o total.
 */
export async function getDentistasPaginados(
  pagina = 0,
  tamanho = TAMANHO_PAGINA_PADRAO,
): Promise<Pagina<DentistaViewModel>> {
  const p = await buscarPagina<DentistaAPI>(ENDPOINT, pagina, tamanho);
  return { ...p, itens: mapDentistas(p.itens) };
}

/**
 * GET /dentista — percorre todas as páginas (telas que filtram em memória).
 */
export async function getDentistasCompletos(): Promise<DentistaViewModel[]> {
  return mapDentistas(await buscarTodos<DentistaAPI>(ENDPOINT));
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
 * POST /dentista (público — sem autenticação)
 * Mesmo endpoint de criarDentista, liberado no back (@PermitAll); usado pelo
 * formulário de voluntário, que roda antes do login.
 */
export async function registrarDentistaVoluntario(
  payload: CriarDentistaPayload,
): Promise<DentistaViewModel> {
  const res = await publicFetch(`${ENDPOINT}`, {
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