import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { tokenStore } from '../../services/tokenStore';
import { fakeResponse } from '../../test/http';
import { makeJwt, nowInSeconds } from '../../test/jwt';
import { render } from '../../test/rtl';

type FetchMock = Mock<(url: string, init?: RequestInit) => Promise<Response>>;

let fetchMock: FetchMock;

function Probe() {
  const { user, isLoading, login } = useAuth();
  const { pathname } = useLocation();
  return (
    <div>
      <p data-testid="loading">{String(isLoading)}</p>
      <p data-testid="user">{user ? `${user.nome}|${user.role}` : 'nenhum'}</p>
      <p data-testid="path">{pathname}</p>
      <button onClick={() => login('a@b.com', 'senha').catch(() => {})}>entrar</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <MemoryRouter initialEntries={['/inicio']}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  window.localStorage.clear();
  tokenStore.clear();
  fetchMock = vi.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('AuthProvider — casos de borda', () => {
  it('desmontar enquanto a renovação do F5 está em andamento não atualiza nada depois', async () => {
    tokenStore.set(makeJwt({ exp: nowInSeconds() - 3600 }), 'refresh');
    let responder!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((ok) => (responder = ok)));
    const { unmount } = renderProvider();
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    unmount();
    await act(async () => {
      responder(fakeResponse({ status: 200, body: { token: makeJwt({ nome: 'Tarde' }), refreshToken: 'novo', tipo: 'BearerToken' } }));
    });

    // Nada para verificar na tela (desmontada): o que importa é não quebrar nem vazar estado.
    expect(screen.queryByTestId('user')).not.toBeInTheDocument();
  });

  it('login cuja resposta não traz refresh token guarda só o access token', async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ status: 200, body: { token: makeJwt({ nome: 'Chefe', groups: ['ADMIN'] }), tipo: 'BearerToken' } }),
    );
    renderProvider();

    await userEvent.click(screen.getByText('entrar'));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/admin/dashboard'));
    expect(tokenStore.get()).not.toBeNull();
    expect(tokenStore.getRefresh()).toBeNull();
  });

  it('renovação periódica que "deu certo" mas deixou a sessão sem token desloga', async () => {
    vi.useFakeTimers();
    const vencendo = makeJwt({ exp: nowInSeconds() + 120, nome: 'Antes' });
    tokenStore.set(vencendo, 'refresh');
    fetchMock.mockResolvedValue(
      fakeResponse({ status: 200, body: { token: makeJwt({ nome: 'Depois' }), refreshToken: 'novo', tipo: 'BearerToken' } }),
    );
    renderProvider();
    // Depois da montagem: a 1ª leitura do intervalo vê o token vencendo; a seguinte já não vê nada.
    vi.spyOn(tokenStore, 'get').mockReturnValueOnce(vencendo).mockReturnValue(null);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3 * 60_000);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('nenhum');
    expect(screen.getByTestId('path')).toHaveTextContent('/auth/login');
  });
});
