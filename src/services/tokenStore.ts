/**
 * tokenStore.ts — Armazenamento dos tokens JWT na sessionStorage da aba.
 *
 *   – Access token (8h) e refresh token (7d) sobrevivem ao F5, então o usuário
 *     continua logado ao recarregar a página.
 *   – São descartados ao fechar a aba/janela e não são compartilhados entre
 *     abas (diferente do localStorage, que persiste indefinidamente).
 *   – Mantém uma cópia em memória como fallback caso a sessionStorage esteja
 *     indisponível (modo privado restrito, storage bloqueado, etc.).
 *   – Risco conhecido: JS malicioso no mesmo origin (XSS) consegue ler a
 *     sessionStorage; mitigar com Content Security Policy no servidor.
 *
 * Acesso restrito:
 *   – Apenas httpClient (Authorization header + renovação) e AuthContext
 *     (set/clear após login/logout) devem importar este módulo.
 *   – Componentes e hooks de UI NUNCA devem ler os tokens diretamente.
 */

const ACCESS_KEY = 'rdb.accessToken';
const REFRESH_KEY = 'rdb.refreshToken';

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

function readStorage(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // Storage indisponível: segue apenas com a cópia em memória.
  }
}

export const tokenStore = {
  /** Persiste o access token (e o refresh token, se informado) na sessão. */
  set(token: string, refreshToken?: string | null): void {
    _accessToken = token;
    writeStorage(ACCESS_KEY, token);
    if (refreshToken !== undefined) {
      _refreshToken = refreshToken;
      writeStorage(REFRESH_KEY, refreshToken);
    }
  },

  /** Retorna o access token atual ou null se não há sessão ativa. */
  get(): string | null {
    if (_accessToken === null) {
      _accessToken = readStorage(ACCESS_KEY);
    }
    return _accessToken;
  },

  /** Retorna o refresh token atual ou null se não há. */
  getRefresh(): string | null {
    if (_refreshToken === null) {
      _refreshToken = readStorage(REFRESH_KEY);
    }
    return _refreshToken;
  },

  /** Apaga os dois tokens — logout, 401 sem renovação possível. */
  clear(): void {
    _accessToken = null;
    _refreshToken = null;
    writeStorage(ACCESS_KEY, null);
    writeStorage(REFRESH_KEY, null);
  },

  /** Retorna true se há um access token salvo (não verifica validade). */
  exists(): boolean {
    return tokenStore.get() !== null;
  },
} as const;
