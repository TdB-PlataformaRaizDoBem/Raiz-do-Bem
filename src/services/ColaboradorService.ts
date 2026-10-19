import type { ColaboradorAPI } from "../domain/entities/ColaboradorAPI";
import {
  mapColaborador,
  mapColaboradores,
  type ColaboradorViewModel,
} from "../domain/mappers/ColaboradorMapper";
import { assertOk, handleResponse, safeFetch } from "./httpClient";
import { buscarPagina, buscarTodos, TAMANHO_PAGINA_PADRAO, type Pagina } from "./paginacao";

const BASE_URL = import.meta.env.API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/colaborador`;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * GET /colaborador?pagina=&size= — uma página de colaboradores e o total.
 */
export async function getColaboradoresPaginados(
  pagina = 0,
  tamanho = TAMANHO_PAGINA_PADRAO,
): Promise<Pagina<ColaboradorViewModel>> {
  const p = await buscarPagina<ColaboradorAPI>(ENDPOINT, pagina, tamanho);
  return { ...p, itens: mapColaboradores(p.itens) };
}

/**
 * GET /colaborador — percorre todas as páginas (telas que filtram em memória).
 */
export async function getColaboradoresCompletos(): Promise<
  ColaboradorViewModel[]
> {
  return mapColaboradores(await buscarTodos<ColaboradorAPI>(ENDPOINT));
}

export async function getColaboradorCompleto(
  id: number,
): Promise<ColaboradorViewModel | null> {
  const todos = await getColaboradoresCompletos();
  return todos.find((c) => c.id === id) ?? null;
}

export async function atualizarColaborador(
  cpf: string,
  payload: Partial<Omit<ColaboradorAPI, "id">>,
): Promise<ColaboradorViewModel | null> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  // Sem isto, um erro do back (ex.: 409 e-mail em uso) seria exibido como sucesso.
  await assertOk(res);

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null; 
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  return mapColaborador(data);
}

export async function excluirColaborador(cpf: string): Promise<void> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export type ColaboradorCompleto = ColaboradorViewModel;

export interface ColaboradorCreatePayload {
  nomeCompleto: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  dataContratacao: string;
  role: 'ADMIN' | 'COLABORADOR';
  senha: string;
}

export async function criarColaborador(
  payload: ColaboradorCreatePayload,
): Promise<ColaboradorViewModel> {
  const res = await safeFetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<ColaboradorAPI>(res);

  return mapColaborador(data);
}