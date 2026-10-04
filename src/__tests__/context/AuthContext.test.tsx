import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { tokenStore } from '../../services/tokenStore';
import { safeFetch } from '../../services/httpClient';
import { fakeResponse } from '../../test/http';
import { makeJwt, nowInSeconds } from '../../test/jwt';

type FetchMock = jest.Mock<(url: string, init?: RequestInit) => Promise<Response>>;

let fetchMock: FetchMock;

function Probe() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div>
      <p data-testid="loading">{String(isLoading)}</p>
      <p data-testid="auth">{String(isAuthenticated)}</p>
      <p data-testid="user">{user ? `${user.nome}|${user.role}` : 'nenhum'}</p>
      <p data-testid="path">{pathname}</p>
      <button onClick={() => login('a@b.com', 'senha').catch(() => {})}>entrar</button>
      <button onClick={logout}>sair</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <MemoryRouter initialEntries={['/inicio']}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  );
}

const expirado = () => makeJwt({ exp: nowInSeconds() - 3600 });
const refreshOk = (token: string) =>
  fakeResponse({ status: 200, body: { token, refreshToken: 'refresh-novo', tipo: 'BearerToken' } });

describe('AuthProvider', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    tokenStore.clear();
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ao carregar a página (F5)', () => {
    it('sem tokens: não autenticado e sem loader', () => {
      renderProvider();

      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('access token válido: continua logado sem chamar a rede', () => {
      tokenStore.set(makeJwt({ nome: 'Ana', groups: ['COLABORADOR'] }), 'refresh');

      renderProvider();

      expect(screen.getByTestId('auth')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Ana|COLABORADOR');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('access token expirado + refresh válido: mostra loader, renova e autentica', async () => {
      tokenStore.set(expirado(), 'refresh-velho');
      fetchMock.mockResolvedValue(refreshOk(makeJwt({ nome: 'Renovada', groups: ['ADMIN'] })));

      renderProvider();

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

      expect(screen.getByTestId('user')).toHaveTextContent('Renovada|ADMIN');
      expect(fetchMock.mock.calls[0][0]).toBe('/auth/refreshToken');
      expect(tokenStore.getRefresh()).toBe('refresh-novo');
    });

    it('access token expirado + refresh recusado: fica deslogado e limpa a sessão', async () => {
      tokenStore.set(expirado(), 'refresh-vencido');
      fetchMock.mockResolvedValue(fakeResponse({ status: 401 }));

      renderProvider();
      await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(tokenStore.get()).toBeNull();
      expect(tokenStore.getRefresh()).toBeNull();
    });

    it('access token expirado sem refresh token: limpa a sessão', () => {
      tokenStore.set(expirado());

      renderProvider();

      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(tokenStore.get()).toBeNull();
    });

    it('token válido mas sem a claim nome é tratado como inválido', () => {
      tokenStore.set(makeJwt({ nome: undefined }));

      renderProvider();

      expect(screen.getByTestId('auth')).toHaveTextContent('false');
    });
  });

  describe('login', () => {
    it('ADMIN: guarda os tokens e vai para /admin/dashboard', async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({
          status: 200,
          body: {
            token: makeJwt({ nome: 'Chefe', groups: ['ADMIN'] }),
            refreshToken: 'refresh-1',
            tipo: 'BearerToken',
          },
        }),
      );
      renderProvider();

      await userEvent.click(screen.getByText('entrar'));

      await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/admin/dashboard'));
      expect(screen.getByTestId('user')).toHaveTextContent('Chefe|ADMIN');
      expect(tokenStore.getRefresh()).toBe('refresh-1');
      expect(tokenStore.get()).not.toBeNull();
    });

    it('COLABORADOR: vai para /coord/dashboard', async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({
          status: 200,
          body: { token: makeJwt({ groups: ['COLABORADOR'] }), refreshToken: 'r', tipo: 'BearerToken' },
        }),
      );
      renderProvider();

      await userEvent.click(screen.getByText('entrar'));

      await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/coord/dashboard'));
    });

    it('token sem nome/role válida: rejeita o login e não guarda nada', async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({
          status: 200,
          body: { token: makeJwt({ nome: undefined }), refreshToken: 'r', tipo: 'BearerToken' },
        }),
      );
      renderProvider();

      await userEvent.click(screen.getByText('entrar'));

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(screen.getByTestId('path')).toHaveTextContent('/inicio');
      expect(tokenStore.get()).toBeNull();
    });

    it('credenciais inválidas (422): continua deslogado', async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({ status: 422, body: { mensagem: 'Email ou senha inválido(s).' } }),
      );
      renderProvider();

      await userEvent.click(screen.getByText('entrar'));

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(tokenStore.get()).toBeNull();
    });
  });

  describe('logout e sessão expirada', () => {
    it('logout limpa os tokens e redireciona para /auth/login', async () => {
      tokenStore.set(makeJwt(), 'refresh');
      renderProvider();

      await userEvent.click(screen.getByText('sair'));

      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(screen.getByTestId('path')).toHaveTextContent('/auth/login');
      expect(tokenStore.get()).toBeNull();
      expect(tokenStore.getRefresh()).toBeNull();
    });

    it('401 sem renovação possível em qualquer requisição desloga o usuário', async () => {
      tokenStore.set(makeJwt());
      fetchMock.mockResolvedValue(fakeResponse({ status: 401 }));
      renderProvider();
      expect(screen.getByTestId('auth')).toHaveTextContent('true');

      await act(async () => {
        await safeFetch('/dentista').catch(() => {});
      });

      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(screen.getByTestId('path')).toHaveTextContent('/auth/login');
    });

    it('a verificação periódica renova o token vencido sem deslogar', async () => {
      jest.useFakeTimers();
      // access válido na montagem; vence logo depois
      tokenStore.set(makeJwt({ exp: nowInSeconds() + 120, nome: 'Antes' }), 'refresh');
      fetchMock.mockResolvedValue(refreshOk(makeJwt({ nome: 'Depois' })));
      renderProvider();
      expect(screen.getByTestId('user')).toHaveTextContent('Antes');

      await act(async () => {
        await jest.advanceTimersByTimeAsync(3 * 60_000); // passa do exp + skew
      });

      expect(screen.getByTestId('user')).toHaveTextContent('Depois');
      expect(screen.getByTestId('path')).toHaveTextContent('/inicio');
    });

    it('a verificação periódica desloga quando a renovação falha', async () => {
      jest.useFakeTimers();
      tokenStore.set(makeJwt({ exp: nowInSeconds() + 120 }), 'refresh');
      fetchMock.mockResolvedValue(fakeResponse({ status: 401 }));
      renderProvider();

      await act(async () => {
        await jest.advanceTimersByTimeAsync(3 * 60_000);
      });

      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(screen.getByTestId('path')).toHaveTextContent('/auth/login');
    });
  });
});
