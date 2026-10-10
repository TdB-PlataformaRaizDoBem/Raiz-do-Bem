import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fakeResponse } from '../../test/http';

type FetchMock = jest.Mock<(url: string, init?: RequestInit) => Promise<Response>>;

// httpClient e tokenStore guardam estado em módulo: cada teste carrega cópias limpas.
async function setup() {
  jest.resetModules();
  const http = await import('../../services/httpClient');
  const { tokenStore } = await import('../../services/tokenStore');
  const fetchMock: FetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return { http, tokenStore, fetchMock };
}

function headersOf(fetchMock: FetchMock, call: number): Record<string, string> {
  return fetchMock.mock.calls[call][1]?.headers as Record<string, string>;
}

describe('httpClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('safeFetch — cabeçalhos', () => {
    it('envia Authorization: Bearer quando há token', async () => {
      const { http, tokenStore, fetchMock } = await setup();
      tokenStore.set('meu-token');
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: [] }));

      await http.safeFetch('/beneficiario');

      expect(fetchMock.mock.calls[0][0]).toBe('/beneficiario');
      expect(headersOf(fetchMock, 0)).toMatchObject({
        Authorization: 'Bearer meu-token',
        'Content-Type': 'application/json',
      });
    });

    it('não envia Authorization sem token', async () => {
      const { http, fetchMock } = await setup();
      fetchMock.mockResolvedValue(fakeResponse({ status: 200 }));

      await http.safeFetch('/qualquer');

      expect(headersOf(fetchMock, 0)).not.toHaveProperty('Authorization');
    });

    it('mantém URLs absolutas e mescla cabeçalhos extras', async () => {
      const { http, fetchMock } = await setup();
      fetchMock.mockResolvedValue(fakeResponse({ status: 200 }));

      await http.safeFetch('http://outra-api/x', { headers: { 'X-Extra': '1' } });

      expect(fetchMock.mock.calls[0][0]).toBe('http://outra-api/x');
      expect(headersOf(fetchMock, 0)).toMatchObject({ 'X-Extra': '1' });
    });
  });

  describe('safeFetch — 401 e renovação do token', () => {
    it('sem refresh token: limpa a sessão, avisa o handler e lança erro', async () => {
      const { http, tokenStore, fetchMock } = await setup();
      const onUnauth = jest.fn();
      http.registerUnauthenticatedHandler(onUnauth);
      tokenStore.set('expirado');
      fetchMock.mockResolvedValue(fakeResponse({ status: 401 }));

      await expect(http.safeFetch('/dentista')).rejects.toThrow(
        'Sessão expirada. Por favor, faça login novamente.',
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(tokenStore.get()).toBeNull();
      expect(onUnauth).toHaveBeenCalledTimes(1);
    });

    it('com refresh token: renova, repete a requisição com o novo token e devolve o resultado', async () => {
      const { http, tokenStore, fetchMock } = await setup();
      const onUnauth = jest.fn();
      http.registerUnauthenticatedHandler(onUnauth);
      tokenStore.set('access-velho', 'refresh-1');

      fetchMock
        .mockResolvedValueOnce(fakeResponse({ status: 401 })) // requisição original
        .mockResolvedValueOnce(
          fakeResponse({
            status: 200,
            body: { token: 'access-novo', refreshToken: 'refresh-2', tipo: 'BearerToken' },
          }),
        ) // POST /auth/refreshToken
        .mockResolvedValueOnce(fakeResponse({ status: 200, body: [{ id: 1 }] })); // retry

      const res = await http.safeFetch('/dentista');

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(3);

      const [refreshUrl, refreshInit] = fetchMock.mock.calls[1];
      expect(refreshUrl).toBe('/auth/refreshToken');
      expect(refreshInit?.method).toBe('POST');
      expect(JSON.parse(String(refreshInit?.body))).toEqual({ refreshToken: 'refresh-1' });

      expect(headersOf(fetchMock, 0).Authorization).toBe('Bearer access-velho');
      expect(headersOf(fetchMock, 2).Authorization).toBe('Bearer access-novo');

      expect(tokenStore.get()).toBe('access-novo');
      expect(tokenStore.getRefresh()).toBe('refresh-2');
      expect(onUnauth).not.toHaveBeenCalled();
    });

    it('refresh recusado pelo back: limpa tudo e desloga', async () => {
      const { http, tokenStore, fetchMock } = await setup();
      const onUnauth = jest.fn();
      http.registerUnauthenticatedHandler(onUnauth);
      tokenStore.set('access-velho', 'refresh-vencido');

      fetchMock
        .mockResolvedValueOnce(fakeResponse({ status: 401 }))
        .mockResolvedValueOnce(fakeResponse({ status: 401 })) // refresh recusado
        .mockResolvedValueOnce(fakeResponse({ status: 401 })); // retry não ocorre com sucesso

      await expect(http.safeFetch('/dentista')).rejects.toThrow('Sessão expirada');

      expect(tokenStore.get()).toBeNull();
      expect(tokenStore.getRefresh()).toBeNull();
      expect(onUnauth).toHaveBeenCalledTimes(1);
    });

    it('não entra em loop: se o retry também der 401, desloga', async () => {
      const { http, tokenStore, fetchMock } = await setup();
      const onUnauth = jest.fn();
      http.registerUnauthenticatedHandler(onUnauth);
      tokenStore.set('a', 'r');

      fetchMock
        .mockResolvedValueOnce(fakeResponse({ status: 401 }))
        .mockResolvedValueOnce(
          fakeResponse({ status: 200, body: { token: 'a2', refreshToken: 'r2' } }),
        )
        .mockResolvedValueOnce(fakeResponse({ status: 401 })); // retry ainda 401

      await expect(http.safeFetch('/x')).rejects.toThrow('Sessão expirada');

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(onUnauth).toHaveBeenCalledTimes(1);
    });

    it('requisições simultâneas com 401 compartilham uma única renovação', async () => {
      const { http, tokenStore, fetchMock } = await setup();
      http.registerUnauthenticatedHandler(jest.fn());
      tokenStore.set('velho', 'refresh');

      fetchMock.mockImplementation(async (url, init) => {
        if (url === '/auth/refreshToken') {
          return fakeResponse({ status: 200, body: { token: 'novo', refreshToken: 'refresh-2' } });
        }
        const auth = (init?.headers as Record<string, string>).Authorization;
        return fakeResponse({ status: auth === 'Bearer novo' ? 200 : 401, body: [] });
      });

      const [a, b, c] = await Promise.all([
        http.safeFetch('/a'),
        http.safeFetch('/b'),
        http.safeFetch('/c'),
      ]);

      expect([a.status, b.status, c.status]).toEqual([200, 200, 200]);
      const chamadasRefresh = fetchMock.mock.calls.filter(([u]) => u === '/auth/refreshToken');
      expect(chamadasRefresh).toHaveLength(1);
    });

    it('falha de rede ao renovar mantém os tokens e devolve false', async () => {
      const { http, tokenStore, fetchMock } = await setup();
      tokenStore.set('a', 'r');
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(http.refreshAccessToken()).resolves.toBe(false);
      expect(tokenStore.get()).toBe('a');
      expect(tokenStore.getRefresh()).toBe('r');
    });

    it('refreshAccessToken sem refresh token não chama a rede', async () => {
      const { http, fetchMock } = await setup();

      await expect(http.refreshAccessToken()).resolves.toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('safeFetch — falha de rede', () => {
    it('traduz erro de rede para mensagem amigável', async () => {
      const { http, fetchMock } = await setup();
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(http.safeFetch('/x')).rejects.toThrow(
        'Sem conexão com o servidor. Verifique sua rede.',
      );
    });
  });

  describe('publicFetch', () => {
    it('não envia Authorization nem trata 401 como logout', async () => {
      const { http, tokenStore, fetchMock } = await setup();
      const onUnauth = jest.fn();
      http.registerUnauthenticatedHandler(onUnauth);
      tokenStore.set('token');
      fetchMock.mockResolvedValue(fakeResponse({ status: 401 }));

      const res = await http.publicFetch('/dentista', { method: 'POST' });

      expect(res.status).toBe(401);
      expect(headersOf(fetchMock, 0)).not.toHaveProperty('Authorization');
      expect(onUnauth).not.toHaveBeenCalled();
      expect(tokenStore.get()).toBe('token');
    });

    it('traduz erro de rede', async () => {
      const { http, fetchMock } = await setup();
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(http.publicFetch('/x')).rejects.toThrow('Sem conexão com o servidor');
    });
  });

  describe('handleResponse', () => {
    it('devolve o JSON em respostas 2xx', async () => {
      const { http } = await setup();
      await expect(
        http.handleResponse(fakeResponse({ status: 200, body: { id: 7 } })),
      ).resolves.toEqual({ id: 7 });
    });

    it.each([
      ['204 No Content', fakeResponse({ status: 204 })],
      ['content-length 0', fakeResponse({ status: 200, headers: { 'content-length': '0' } })],
      ['corpo vazio', fakeResponse({ status: 200, text: '' })],
      ['JSON inválido', fakeResponse({ status: 200, text: '<html>' })],
    ])('devolve undefined para %s', async (_nome, res) => {
      const { http } = await setup();
      await expect(http.handleResponse(res)).resolves.toBeUndefined();
    });

    it('usa body.mensagem (formato ErroResponse do back) em erros', async () => {
      const { http } = await setup();
      const res = fakeResponse({
        status: 422,
        body: { statusCode: 422, mensagem: 'Email ou senha inválido(s).' },
      });
      await expect(http.handleResponse(res)).rejects.toThrow('Email ou senha inválido(s).');
    });

    it.each([
      ['detail', { detail: 'via detail' }],
      ['message', { message: 'via message' }],
    ])('também entende %s', async (_campo, body) => {
      const { http } = await setup();
      await expect(
        http.handleResponse(fakeResponse({ status: 400, body })),
      ).rejects.toThrow(/via (detail|message)/);
    });

    it.each([
      [400, 'Requisição inválida. Verifique os dados enviados.'],
      [403, 'Você não tem permissão para realizar esta ação.'],
      [404, 'Recurso não encontrado.'],
      [500, 'Erro interno no servidor. Tente novamente mais tarde.'],
      [418, 'Erro 418'],
    ])('usa mensagem padrão para status %i sem corpo', async (status, mensagem) => {
      const { http } = await setup();
      await expect(
        http.handleResponse(fakeResponse({ status, text: 'não é json' })),
      ).rejects.toThrow(mensagem);
    });
  });

  describe('assertOk', () => {
    it('resolve em 2xx', async () => {
      const { http } = await setup();
      await expect(http.assertOk(fakeResponse({ status: 200 }))).resolves.toBeUndefined();
    });

    it('lança com a mensagem do back em erro', async () => {
      const { http } = await setup();
      await expect(
        http.assertOk(fakeResponse({ status: 409, body: { mensagem: 'CPF já cadastrado.' } })),
      ).rejects.toThrow('CPF já cadastrado.');
    });
  });
});
