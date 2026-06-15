/**
 * tokenStore.ts — Armazenamento do Bearer token em memória pura.
 *
 * OWASP A02 – Cryptographic Failures / XSS Mitigation:
 *   – Token NUNCA é gravado em localStorage, sessionStorage ou cookie JS-acessível.
 *   – Vive em um closure de módulo: inacessível fora deste arquivo exceto via API pública.
 *   – Ao fechar a aba ou dar F5, o token desaparece automaticamente.
 *     → Comportamento esperado para este MVP: usuário precisa fazer login novamente.
 *   – Único vetor de ataque restante é JS malicioso no mesmo origin (XSS),
 *     mitigado pela Content Security Policy (CSP) configurada no servidor.
 *
 * Acesso restrito:
 *   – Apenas httpClient (para injetar o Authorization header) e
 *     AuthContext (para set/clear após login/logout) devem importar este módulo.
 *   – Componentes e hooks de UI NUNCA devem ler o token diretamente.
 */

let _accessToken: string | null = null;

export const tokenStore = {
  /** Persiste o JWT em memória após um login bem-sucedido. */
  set(token: string): void {
    _accessToken = token;
  },

  /** Retorna o token atual ou null se não há sessão ativa. */
  get(): string | null {
    return _accessToken;
  },

  /** Apaga o token — chamado no logout ou quando o interceptor detecta 401. */
  clear(): void {
    _accessToken = null;
  },

  /** Retorna true se há um token em memória (não verifica validade). */
  exists(): boolean {
    return _accessToken !== null;
  },
} as const;
