import { handleResponse, safeFetch } from "./httpClient";

/** Formato que a API devolve nas listagens (`PageResponse` do back-end). */
export interface PaginaAPI<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}

/** Uma página de resultados, já no formato usado pelo front. */
export interface Pagina<T> {
  itens: T[];
  pagina: number;
  tamanho: number;
  total: number;
  totalPaginas: number;
}

export const TAMANHO_PAGINA_PADRAO = 20;

/** Tamanho do lote usado por `buscarTodos` para reduzir o número de requisições. */
const TAMANHO_LOTE = 100;

function paginaVazia<T>(pagina: number, tamanho: number): Pagina<T> {
  return { itens: [], pagina, tamanho, total: 0, totalPaginas: 0 };
}

/**
 * GET {endpoint}?pagina=&size= — lê `conteudo` e os totais da resposta paginada.
 * Aceita também um array simples (endpoint ainda sem paginação) e trata 404/204 como lista vazia.
 */
export async function buscarPagina<T>(
  endpoint: string,
  pagina = 0,
  tamanho = TAMANHO_PAGINA_PADRAO,
): Promise<Pagina<T>> {
  const res = await safeFetch(`${endpoint}?pagina=${pagina}&size=${tamanho}`);

  if (res.status === 404 || res.status === 204) {
    return paginaVazia(pagina, tamanho);
  }

  const data = await handleResponse<PaginaAPI<T> | T[]>(res);

  if (Array.isArray(data)) {
    return { itens: data, pagina: 0, tamanho: data.length, total: data.length, totalPaginas: 1 };
  }

  return {
    itens: data?.conteudo ?? [],
    pagina: data?.pagina ?? pagina,
    tamanho: data?.tamanho ?? tamanho,
    total: data?.totalElementos ?? 0,
    totalPaginas: data?.totalPaginas ?? 0,
  };
}

/** Percorre todas as páginas de {endpoint} e devolve os itens juntos (telas que filtram em memória). */
export async function buscarTodos<T>(endpoint: string): Promise<T[]> {
  const primeira = await buscarPagina<T>(endpoint, 0, TAMANHO_LOTE);
  const itens = [...primeira.itens];

  for (let pagina = 1; pagina < primeira.totalPaginas; pagina++) {
    itens.push(...(await buscarPagina<T>(endpoint, pagina, TAMANHO_LOTE)).itens);
  }

  return itens;
}
