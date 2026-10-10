import { describe, expect, it, vi } from 'vitest';
import { fakeResponse } from '../../test/http';

describe('loginRequest', () => {
  it('faz POST em /auth/tokenAcesso com email e senha e devolve os tokens', async () => {
    vi.resetModules();
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockResolvedValue(
      fakeResponse({
        status: 200,
        body: { token: 'jwt', refreshToken: 'refresh', tipo: 'BearerToken' },
      }),
    );

    const { loginRequest } = await import('../../services/authService');
    const result = await loginRequest('ana@raizdobem.org', 'Senha@123');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/auth/tokenAcesso');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'ana@raizdobem.org',
      senha: 'Senha@123',
    });
    expect(result).toEqual({ token: 'jwt', refreshToken: 'refresh', tipo: 'BearerToken' });
  });

  it('propaga a mensagem do back quando as credenciais são inválidas (422)', async () => {
    vi.resetModules();
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockResolvedValue(
      fakeResponse({
        status: 422,
        body: { statusCode: 422, mensagem: 'Email ou senha inválido(s).' },
      }),
    );

    const { loginRequest } = await import('../../services/authService');

    await expect(loginRequest('x@y.com', 'errada')).rejects.toThrow(
      'Email ou senha inválido(s).',
    );
  });
});
