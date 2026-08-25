/**
 * tokenStore.ts — Armazenamento do Bearer token em memória, espelhado em
 * sessionStorage para sobreviver a um F5.
 *
 * OWASP A02 – Cryptographic Failures / XSS Mitigation:
 *   – Token nunca vai para localStorage nem cookie JS-acessível — só
 *     sessionStorage, que não sobrevive ao fechar a aba/navegador (ao
 *     contrário de localStorage, que persistiria indefinidamente).
 *   – A leitura em runtime (get) usa a variável de módulo; sessionStorage é
 *     só o backup lido uma vez, na inicialização do módulo, para restaurar a
 *     sessão após o F5 apagar o estado do React.
 *   – Único vetor de ataque restante é JS malicioso no mesmo origin (XSS),
 *     mitigado pela Content Security Policy (CSP) configurada no servidor —
 *     mesma exposição que qualquer app SPA com sessionStorage.
 *
 * Acesso restrito:
 *   – Apenas httpClient (para injetar o Authorization header) e
 *     AuthContext (para set/clear após login/logout) devem importar este módulo.
 *   – Componentes e hooks de UI NUNCA devem ler o token diretamente.
 */

const STORAGE_KEY = 'auth_token';

let _accessToken: string | null = sessionStorage.getItem(STORAGE_KEY);

export const tokenStore = {
  /** Persiste o JWT em memória e em sessionStorage após um login bem-sucedido. */
  set(token: string): void {
    _accessToken = token;
    sessionStorage.setItem(STORAGE_KEY, token);
  },

  /** Retorna o token atual ou null se não há sessão ativa. */
  get(): string | null {
    return _accessToken;
  },

  /** Apaga o token — chamado no logout ou quando o interceptor detecta 401. */
  clear(): void {
    _accessToken = null;
    sessionStorage.removeItem(STORAGE_KEY);
  },

  /** Retorna true se há um token em memória (não verifica validade). */
  exists(): boolean {
    return _accessToken !== null;
  },
} as const;
