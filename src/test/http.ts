import { vi, type Mock } from 'vitest';

/**
 * O ambiente jsdom dos testes não garante fetch/Response completos. Este fake implementa só o que
 * o httpClient usa: status, ok, headers.get, text(), json() e clone().
 */
export interface FakeResponseInit {
  status?: number;
  body?: unknown;
  /** Texto cru (ignora `body`) — útil para simular corpo vazio ou JSON inválido. */
  text?: string;
  headers?: Record<string, string>;
}

export function fakeResponse({
  status = 200,
  body,
  text,
  headers = {},
}: FakeResponseInit = {}): Response {
  const raw = text ?? (body === undefined ? '' : JSON.stringify(body));
  const lower = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
  );

  const res = {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (name: string) => lower[name.toLowerCase()] ?? null },
    text: async () => raw,
    json: async () => JSON.parse(raw),
    blob: async () => raw,
    clone: () => fakeResponse({ status, text: raw, headers }),
  };

  return res as unknown as Response;
}

export type FetchMock = Mock<(url: string, init?: RequestInit) => Promise<Response>>;

/** Instala um fetch falso global e o devolve para configurar respostas/inspecionar chamadas. */
export function installFetch(): FetchMock {
  const mock: FetchMock = vi.fn();
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

/** Corpo JSON da chamada n (padrão: a última) do fetch falso. */
export function bodyOf(mock: FetchMock, call = mock.mock.calls.length - 1): unknown {
  return JSON.parse(String(mock.mock.calls[call][1]?.body));
}

/**
 * Roteia o fetch falso por URL exata. O valor pode ser o corpo JSON (responde 200),
 * ou uma Response pronta (fakeResponse). URL não mapeada responde 404.
 */
export function routeFetch(mock: FetchMock, routes: Record<string, unknown>): void {
  mock.mockImplementation(async (url) => {
    if (!(url in routes)) return fakeResponse({ status: 404 });
    const value = routes[url];
    const isResponse = typeof value === 'object' && value !== null && 'ok' in value && 'clone' in value;
    return isResponse ? (value as Response) : fakeResponse({ status: 200, body: value });
  });
}
