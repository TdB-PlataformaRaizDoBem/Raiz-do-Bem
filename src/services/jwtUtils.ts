import type { JwtPayload, AuthUser, UserRole } from '../domain/types/auth';

// ─── Decodificação Base64URL ──────────────────────────────────────────────────

/**
 * Converte Base64URL → Base64 padrão e decodifica para string UTF-8.
 * JWT usa Base64URL (RFC 4648 §5): substitui `+` por `-` e `/` por `_`,
 * sem padding `=`. O atob() nativo exige Base64 padrão com padding.
 */
function base64UrlDecode(base64Url: string): string {
  // Substitui caracteres Base64URL → Base64 padrão
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  // Adiciona padding `=` para completar múltiplo de 4
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  // Decodifica bytes e converte para string UTF-8 (suporta caracteres acentuados)
  const rawBytes = atob(padded);
  return decodeURIComponent(
    rawBytes
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
}

// ─── Parse do JWT ─────────────────────────────────────────────────────────────

/**
 * Decodifica o payload de um JWT sem verificar a assinatura.
 *
 * Estrutura JWT: `<header>.<payload>.<signature>` (cada parte em Base64URL)
 *
 * @returns Payload tipado ou null se o token for malformado.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = base64UrlDecode(parts[1]);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    // Token malformado, Base64 inválido ou JSON inválido
    return null;
  }
}

// ─── Validação de expiração ───────────────────────────────────────────────────

/**
 * Verifica se o token ainda está dentro do prazo de validade.
 *
 * @param payload Payload já decodificado
 * @param clockSkewSeconds Tolerância de clock skew em segundos (padrão: 30s)
 * @returns true se o token ainda é válido; false se expirado
 */
export function isTokenExpired(
  payload: JwtPayload,
  clockSkewSeconds = 30,
): boolean {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowInSeconds - clockSkewSeconds;
}

// ─── Extração de AuthUser ─────────────────────────────────────────────────────

/**
 * Extrai e valida o AuthUser a partir do token JWT bruto.
 *
 * Mapeia as claims do SmallRye JWT para o modelo público AuthUser:
 *   sub    → email
 *   nome   → nome
 *   groups → role (primeira entrada, normalizada para uppercase)
 *   exp    → exp
 *
 * @returns AuthUser populado ou null se o token for inválido/expirado/malformado.
 */
export function extractAuthUser(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);

  if (!payload) return null;
  if (isTokenExpired(payload)) return null;

  // Extrai a role do array `groups` (SmallRye emite como array JSON)
  const rawRole = Array.isArray(payload.groups) ? payload.groups[0] : null;
  if (!rawRole) return null;

  // Normaliza para uppercase e valida contra as roles conhecidas
  const role = rawRole.toUpperCase() as UserRole;
  const validRoles: UserRole[] = ['ADMIN', 'COLABORADOR'];
  if (!validRoles.includes(role)) {
    if (import.meta.env.DEV) {
      console.warn(`[jwtUtils] Role desconhecida no token: "${rawRole}"`);
    }
    return null;
  }

  // Valida claims obrigatórias
  if (!payload.sub || !payload.nome) return null;

  return {
    email: payload.sub,
    nome: payload.nome,
    role,
    exp: payload.exp,
  };
}
