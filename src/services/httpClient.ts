import type { LoginResponseDTO } from '../domain/types/auth';
import { tokenStore } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  400: 'Requisição inválida. Verifique os dados enviados.',
  401: 'Sessão expirada. Por favor, faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  422: 'Dados inválidos. Verifique os campos preenchidos.',
  500: 'Erro interno no servidor. Tente novamente mais tarde.',
};

async function extractErrorMessage(res: Response): Promise<string> {
  const fallback = STATUS_MESSAGES[res.status] ?? `Erro ${res.status}`;
  try {
    const body = await res.clone().json();
    return body?.detail ?? body?.mensagem ?? body?.message ?? fallback;
  } catch {
    return fallback;
  }
}

let _onUnauthenticated: (() => void) | null = null;

export function registerUnauthenticatedHandler(handler: () => void): void {
  _onUnauthenticated = handler;
}

function handleUnauthorized(): void {
  tokenStore.clear();

  if (_onUnauthenticated) {
    _onUnauthenticated();
  } else {
    // Fallback: hard redirect caso o AuthProvider ainda não tenha montado.
    // Evita janela de vulnerabilidade durante carregamento inicial.
    window.location.replace('/auth/login');
  }
}

let _onMutation: ((url: string) => void) | null = null;

/**
 * Avisa quando uma escrita (POST/PUT/PATCH/DELETE) termina com sucesso. O cache de requisições
 * usa isso para se invalidar sozinho (ver lib/queryClient).
 */
export function registerMutationListener(listener: (url: string) => void): void {
  _onMutation = listener;
}

function buildHeaders(extra?: HeadersInit): HeadersInit {
  const token = tokenStore.get();
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    base['Authorization'] = `Bearer ${token}`;
  }
  return { ...base, ...(extra as Record<string, string> ?? {}) };
}

let _refreshInFlight: Promise<boolean> | null = null;

/**
 * Troca o refresh token por um novo par de tokens (POST /auth/refreshToken).
 * Chamadas simultâneas compartilham a mesma requisição.
 *
 * @returns true se os tokens foram renovados; false (e tokenStore limpo, se o
 *          back recusou o refresh token) caso contrário.
 */
export function refreshAccessToken(): Promise<boolean> {
  if (_refreshInFlight) return _refreshInFlight;

  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return Promise.resolve(false);

  _refreshInFlight = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refreshToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      const data = (await res.json()) as LoginResponseDTO;
      tokenStore.set(data.token, data.refreshToken);
      return true;
    } catch {
      // Falha de rede: mantém os tokens para uma nova tentativa depois.
      return false;
    } finally {
      _refreshInFlight = null;
    }
  })();

  return _refreshInFlight;
}

function fetchComAuth(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, headers: buildHeaders(init?.headers) });
}

export async function safeFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  try {
    let res = await fetchComAuth(url, init);

    // Access token expirado: tenta renovar uma vez e repete a requisição.
    if (res.status === 401 && tokenStore.getRefresh() && (await refreshAccessToken())) {
      res = await fetchComAuth(url, init);
    }

    if (res.status === 401) {
      handleUnauthorized();
      throw new Error(STATUS_MESSAGES[401]!);
    }

    const metodo = (init?.method ?? 'GET').toUpperCase();
    if (res.ok && metodo !== 'GET' && metodo !== 'HEAD') _onMutation?.(url);

    return res;
  } catch (err) {
    // Re-lança erros já tratados (ex: 401 acima)
    if (err instanceof Error && err.message === STATUS_MESSAGES[401]) {
      throw err;
    }
    // Falha de rede (servidor offline, sem internet)
    throw new Error('Sem conexão com o servidor. Verifique sua rede.');
  }
}

export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }

  if (res.status === 204) return undefined as T;

  const contentLength = res.headers.get('content-length');
  if (contentLength === '0') return undefined as T;

  try {
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  } catch {
    return undefined as T;
  }
}

export async function assertOk(res: Response): Promise<void> {
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }
}

/**
 * Versão pública do safeFetch que não redireciona em 401.
 * Usada para endpoints públicos como registro de voluntários.
 */
export async function publicFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: init?.headers as Record<string, string> ?? {},
    });

    return res;
  } catch {
    // Falha de rede (servidor offline, sem internet)
    throw new Error('Sem conexão com o servidor. Verifique sua rede.');
  }
}
