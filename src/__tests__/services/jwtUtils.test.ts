import { describe, expect, it, vi } from 'vitest';
import { decodeJwtPayload, extractAuthUser, isTokenExpired } from '../../services/jwtUtils';
import { makeJwt, nowInSeconds } from '../../test/jwt';

describe('decodeJwtPayload', () => {
  it('decodifica o payload de um JWT válido', () => {
    const payload = decodeJwtPayload(makeJwt({ sub: 'a@b.com', nome: 'Ana' }));
    expect(payload).toMatchObject({ sub: 'a@b.com', nome: 'Ana', groups: ['ADMIN'] });
  });

  it('suporta caracteres acentuados (UTF-8)', () => {
    const payload = decodeJwtPayload(makeJwt({ nome: 'José da Conceição' }));
    expect(payload?.nome).toBe('José da Conceição');
  });

  it.each([
    ['sem 3 partes', 'abc.def'],
    ['string vazia', ''],
    ['base64 inválido', 'a.%%%.c'],
    ['payload que não é JSON', `a.${btoa('nao-json')}.c`],
  ])('devolve null para token malformado: %s', (_nome, token) => {
    expect(decodeJwtPayload(token)).toBeNull();
  });
});

describe('isTokenExpired', () => {
  const base = { iss: '', sub: '', nome: '', groups: [], iat: 0 };

  it('token no futuro não está expirado', () => {
    expect(isTokenExpired({ ...base, exp: nowInSeconds() + 60 })).toBe(false);
  });

  it('token no passado distante está expirado', () => {
    expect(isTokenExpired({ ...base, exp: nowInSeconds() - 3600 })).toBe(true);
  });

  it('respeita a tolerância de clock skew (30s por padrão)', () => {
    expect(isTokenExpired({ ...base, exp: nowInSeconds() - 10 })).toBe(false);
    expect(isTokenExpired({ ...base, exp: nowInSeconds() - 31 })).toBe(true);
  });

  it('permite customizar a tolerância', () => {
    expect(isTokenExpired({ ...base, exp: nowInSeconds() - 10 }, 0)).toBe(true);
  });
});

describe('extractAuthUser', () => {
  it('extrai email, nome, role e exp de um token ADMIN', () => {
    const exp = nowInSeconds() + 3600;
    const user = extractAuthUser(
      makeJwt({ sub: 'admin@raizdobem.org', nome: 'Admin Teste', groups: ['ADMIN'], exp }),
    );
    expect(user).toEqual({
      email: 'admin@raizdobem.org',
      nome: 'Admin Teste',
      role: 'ADMIN',
      exp,
    });
  });

  it('aceita role COLABORADOR', () => {
    expect(extractAuthUser(makeJwt({ groups: ['COLABORADOR'] }))?.role).toBe('COLABORADOR');
  });

  it('normaliza a role para maiúsculas', () => {
    expect(extractAuthUser(makeJwt({ groups: ['admin'] }))?.role).toBe('ADMIN');
  });

  it('usa apenas a primeira entrada de groups', () => {
    expect(extractAuthUser(makeJwt({ groups: ['COLABORADOR', 'ADMIN'] }))?.role).toBe(
      'COLABORADOR',
    );
  });

  it('rejeita token expirado', () => {
    expect(extractAuthUser(makeJwt({ exp: nowInSeconds() - 3600 }))).toBeNull();
  });

  it('rejeita token malformado', () => {
    expect(extractAuthUser('lixo')).toBeNull();
  });

  it('rejeita role desconhecida', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(extractAuthUser(makeJwt({ groups: ['SUPERUSER'] }))).toBeNull();
    warn.mockRestore();
  });

  it.each([
    ['groups ausente', { groups: undefined }],
    ['groups vazio', { groups: [] }],
    ['groups que não é array', { groups: 'ADMIN' }],
  ])('rejeita token com %s', (_nome, extra) => {
    expect(extractAuthUser(makeJwt(extra))).toBeNull();
  });

  it.each([
    ['sub ausente', { sub: undefined }],
    ['nome ausente (claim que o back precisa emitir)', { nome: undefined }],
    ['nome vazio', { nome: '' }],
  ])('rejeita token com %s', (_nome, extra) => {
    expect(extractAuthUser(makeJwt(extra))).toBeNull();
  });
});
