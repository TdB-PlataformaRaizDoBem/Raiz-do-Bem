import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import Toast from '../../components/ui/Toast';
import { SpeechProvider, useSpeechContext } from '../../context/SpeechContext';
import { UnreadProvider } from '../../context/UnreadContext';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { useUnread } from '../../hooks/useUnread';
import { getUser, useUser } from '../../hooks/useUser';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

type Synth = { speak: Mock; cancel: Mock };
const synth = () => (window as unknown as { speechSynthesis: Synth }).speechSynthesis;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

/* ───────────── Toast ───────────── */

describe('Toast', () => {
  it('não renderiza nada quando oculto', () => {
    const { container } = render(<Toast show={false} message="oi" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['success', 'bg-green-600'],
    ['error', 'bg-red-600'],
    ['info', 'bg-darkgreen'],
  ] as const)('tipo %s usa a cor %s', (type, classe) => {
    render(<Toast show message="Mensagem" type={type} />);
    expect(screen.getByText('Mensagem')).toHaveClass(classe);
  });

  it('o tipo padrão é info', () => {
    render(<Toast show message="Mensagem" />);
    expect(screen.getByText('Mensagem')).toHaveClass('bg-darkgreen');
  });
});

/* ───────────── NotificationProvider / useNotification ───────────── */

describe('NotificationProvider', () => {
  function Disparador() {
    const { showNotification } = useNotification();
    return (
      <>
        <button onClick={() => showNotification('Salvo com sucesso!', 'success')}>sucesso</button>
        <button onClick={() => showNotification('Informação')}>info</button>
      </>
    );
  }

  it('useNotification fora do provider lança erro explicativo', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useNotification())).toThrow(
      'useNotification deve ser usado dentro de um NotificationProvider',
    );
    erro.mockRestore();
  });

  it('mostra o toast com a cor do tipo e some depois de 3 segundos', async () => {
    vi.useFakeTimers();
    render(
      <NotificationProvider>
        <Disparador />
      </NotificationProvider>,
    );

    act(() => screen.getByText('sucesso').click());
    expect(screen.getByText('Salvo com sucesso!')).toHaveClass('bg-green-600');

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(screen.getByText('Salvo com sucesso!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('Salvo com sucesso!')).not.toBeInTheDocument();
  });

  it('o tipo padrão da notificação é info', () => {
    render(
      <NotificationProvider>
        <Disparador />
      </NotificationProvider>,
    );

    act(() => screen.getByText('info').click());

    expect(screen.getByText('Informação')).toHaveClass('bg-darkgreen');
  });

  it('lê a mensagem em voz alta quando a leitura está ativada', async () => {
    localStorage.setItem('raiz-do-bem:tts', 'true');
    render(
      <SpeechProvider>
        <NotificationProvider>
          <Disparador />
        </NotificationProvider>
      </SpeechProvider>,
    );

    await userEvent.click(screen.getByText('sucesso'));

    expect(synth().speak).toHaveBeenCalledTimes(1);
    expect((synth().speak.mock.calls[0][0] as SpeechSynthesisUtterance).text).toBe('Salvo com sucesso!');
  });
});

/* ───────────── SpeechProvider ───────────── */

describe('SpeechProvider', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <SpeechProvider>{children}</SpeechProvider>;

  it('sem provider: valores padrão inofensivos', () => {
    const { result } = renderHook(() => useSpeechContext());

    expect(result.current.ttsEnabled).toBe(false);
    expect(result.current.ttsSupported).toBe(false);
    expect(() => {
      result.current.speak('x');
      result.current.cancel();
      result.current.setTtsEnabled(true);
    }).not.toThrow();
  });

  it('começa desativado e informa o suporte do navegador', () => {
    const { result } = renderHook(() => useSpeechContext(), { wrapper });

    expect(result.current.ttsEnabled).toBe(false);
    expect(result.current.ttsSupported).toBe(true);
  });

  it('restaura a preferência salva no localStorage', () => {
    localStorage.setItem('raiz-do-bem:tts', 'true');

    const { result } = renderHook(() => useSpeechContext(), { wrapper });

    expect(result.current.ttsEnabled).toBe(true);
  });

  it('não fala enquanto desativado', () => {
    const { result } = renderHook(() => useSpeechContext(), { wrapper });

    act(() => result.current.speak('texto'));

    expect(synth().speak).not.toHaveBeenCalled();
  });

  it('ativar salva a preferência e passa a falar', () => {
    const { result } = renderHook(() => useSpeechContext(), { wrapper });

    act(() => result.current.setTtsEnabled(true));
    act(() => result.current.speak('texto'));

    expect(localStorage.getItem('raiz-do-bem:tts')).toBe('true');
    expect(synth().speak).toHaveBeenCalledTimes(1);
  });

  it('desativar salva a preferência e interrompe a fala em andamento', () => {
    localStorage.setItem('raiz-do-bem:tts', 'true');
    const { result } = renderHook(() => useSpeechContext(), { wrapper });
    synth().cancel.mockClear();

    act(() => result.current.setTtsEnabled(false));

    expect(localStorage.getItem('raiz-do-bem:tts')).toBe('false');
    expect(synth().cancel).toHaveBeenCalled();
  });

  it('cancela a fala ao desmontar (troca de rota)', () => {
    const { unmount } = renderHook(() => useSpeechContext(), { wrapper });
    synth().cancel.mockClear();

    unmount();

    expect(synth().cancel).toHaveBeenCalled();
  });

  it('funciona mesmo com o localStorage bloqueado', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    const { result } = renderHook(() => useSpeechContext(), { wrapper });
    expect(result.current.ttsEnabled).toBe(false);

    act(() => result.current.setTtsEnabled(true));
    expect(result.current.ttsEnabled).toBe(true);

    get.mockRestore();
    set.mockRestore();
  });
});

/* ───────────── UnreadProvider / useUnread ───────────── */

describe('UnreadProvider', () => {
  let fetchMock: FetchMock;
  const conversas = (...counts: (number | undefined)[]) =>
    counts.map((n, i) => ({ tel_client: `+55${i}`, text: 'oi', unread_count: n }));
  const wrapper = ({ children }: { children: ReactNode }) => <UnreadProvider>{children}</UnreadProvider>;

  beforeEach(() => {
    fetchMock = installFetch();
  });

  it('sem provider: valores padrão', async () => {
    const { result } = renderHook(() => useUnread());

    expect(result.current.totalUnread).toBe(0);
    expect(result.current.conversations).toEqual([]);
    await expect(result.current.refresh()).resolves.toBeUndefined();
  });

  it('carrega as conversas logo após montar e soma as não lidas', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: conversas(2, 3, undefined) }));

    const { result } = renderHook(() => useUnread(), { wrapper });

    await waitFor(() => expect(result.current.totalUnread).toBe(5));
    expect(result.current.conversations).toHaveLength(3);
  });

  it('atualiza a cada 5 segundos', async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: conversas(1) }));
    const { result } = renderHook(() => useUnread(), { wrapper });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    const chamadasIniciais = fetchMock.mock.calls.length;

    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: conversas(1, 4) }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(fetchMock.mock.calls.length).toBeGreaterThan(chamadasIniciais);
    expect(result.current.totalUnread).toBe(5);
  });

  it('refresh manual busca de novo', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: conversas(1) }));
    const { result } = renderHook(() => useUnread(), { wrapper });
    await waitFor(() => expect(result.current.totalUnread).toBe(1));

    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: conversas(7) }));
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.totalUnread).toBe(7);
  });

  it('para de atualizar ao desmontar', async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: [] }));
    const { unmount } = renderHook(() => useUnread(), { wrapper });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    unmount();
    const aposDesmontar = fetchMock.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });

    expect(fetchMock.mock.calls.length).toBe(aposDesmontar);
  });
});

/* ───────────── useAuth / useUser ───────────── */

describe('useAuth / useUser', () => {
  const valor = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: async () => {},
    logout: () => {},
    ...overrides,
  });
  const providerCom = (v: AuthContextValue) =>
    function Wrapper({ children }: { children: ReactNode }) {
      return <AuthContext.Provider value={v}>{children}</AuthContext.Provider>;
    };

  it('useAuth fora do AuthProvider lança erro explicativo', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('[useAuth] Deve ser usado dentro de <AuthProvider>');
    erro.mockRestore();
  });

  it('useUser devolve o usuário autenticado', () => {
    const user = { email: 'a@b.com', nome: 'Ana', role: 'ADMIN' as const, exp: 1 };
    const { result } = renderHook(() => useUser(), { wrapper: providerCom(valor({ user, isAuthenticated: true })) });
    expect(result.current).toEqual(user);
  });

  it('useUser devolve null sem sessão', () => {
    const { result } = renderHook(() => useUser(), { wrapper: providerCom(valor()) });
    expect(result.current).toBeNull();
  });

  it('getUser (deprecada) devolve null', () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getUser()).toBeNull();
    aviso.mockRestore();
  });
});
