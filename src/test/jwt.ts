/// <reference types="node" />
import type { JwtPayload } from '../domain/types/auth';

/** Base64URL (RFC 4648 §5) com UTF-8, como o SmallRye JWT emite. */
function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
}

export function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/** Monta um JWT de teste (assinatura falsa — o front só decodifica, não verifica). */
export function makeJwt(
  overrides: Partial<JwtPayload> | Record<string, unknown> = {},
): string {
  const payload = {
    iss: 'raiz-do-bem',
    sub: 'admin@raizdobem.org',
    nome: 'Admin Teste',
    groups: ['ADMIN'],
    iat: nowInSeconds(),
    exp: nowInSeconds() + 3600,
    ...overrides,
  };
  return `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url(payload)}.assinatura-falsa`;
}
