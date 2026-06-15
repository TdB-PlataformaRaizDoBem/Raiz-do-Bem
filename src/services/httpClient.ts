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

export async function safeFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: buildHeaders(init?.headers),
    });

    if (res.status === 401) {
      handleUnauthorized();
      throw new Error(STATUS_MESSAGES[401]!);
    }

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
  } catch (err) {
    // Falha de rede (servidor offline, sem internet)
    throw new Error('Sem conexão com o servidor. Verifique sua rede.');
  }
}
