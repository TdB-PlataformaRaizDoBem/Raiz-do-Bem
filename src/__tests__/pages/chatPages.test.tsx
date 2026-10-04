import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { UnreadContext } from '../../context/unread';
import type { ConversationPreview } from '../../domain/entities/ConversationPreview';
import type { MessageResponse } from '../../domain/entities/MessageResponse';
import ChatScreen from '../../pages/chat/ChatScreen';
import ConversasScreen from '../../pages/conversas/ConversasScreen';
import { beneficiarioApi, colaboradorApi, dentistaApi } from '../../test/factories';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

const CHAT = 'http://localhost:8000';
const TEL = '+5511987654321';

let fetchMock: FetchMock;
let historico: MessageResponse[];
let conversas: ConversationPreview[];
let falhas: { enviar?: Response; historico?: Response };

const mensagem = (id: string, o: Partial<MessageResponse> = {}): MessageResponse => ({
  id_db: id,
  id_message_twilio: `t-${id}`,
  tel_client: TEL,
  text: `mensagem ${id}`,
  direction: 'entrada',
  date_time: '2026-03-09T14:05:00',
  ...o,
});

const conversa = (tel: string, o: Partial<ConversationPreview> = {}): ConversationPreview => ({
  tel_client: tel,
  text: 'oi',
  date_time: '2026-03-09T14:05:00',
  direction: 'entrada',
  unread_count: 0,
  ...o,
});

const auth: AuthContextValue = {
  user: { email: 'u@x.com', nome: 'Usuária', role: 'ADMIN', exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

const chamadas = (parte: string, metodo?: string) =>
  fetchMock.mock.calls.filter(([url, init]) => url.includes(parte) && (!metodo || init?.method === metodo));

function Local() {
  const { pathname, search } = useLocation();
  return <p data-testid="local">{pathname + search}</p>;
}

const media = (matches: Record<string, boolean>) => {
  window.matchMedia = ((q: string) => ({ matches: matches[q] ?? false, media: q }) as MediaQueryList) as typeof window.matchMedia;
};

beforeEach(() => {
  historico = [mensagem('m1'), mensagem('m2', { direction: 'saida', id_colaborador: 5 })];
  conversas = [conversa(TEL, { unread_count: 2 }), conversa('+5521912345678')];
  falhas = {};
  media({ '(min-width: 768px)': true });

  fetchMock = installFetch();
  fetchMock.mockImplementation(async (url, init) => {
    if (url.startsWith(`${CHAT}/chat/history`)) return falhas.historico ?? fakeResponse({ status: 200, body: historico });
    if (url === `${CHAT}/chat/send`) return falhas.enviar ?? fakeResponse({ status: 200, body: { status: 'ok', id_db: 'x', id_twilio: 'y' } });
    if (url === `${CHAT}/chat/conversations`) return fakeResponse({ status: 200, body: conversas });
    if (url.startsWith(`${CHAT}/chat/read`)) return fakeResponse({ status: 200, body: { status: 'ok', messagens_updated: 1 } });
    if (url === '/beneficiario') return fakeResponse({ status: 200, body: [beneficiarioApi({ nomeCompleto: 'Maria Contato', telefone: '11987654321' })] });
    if (url === '/dentista') return fakeResponse({ status: 200, body: [dentistaApi()] });
    if (url === '/colaborador') return fakeResponse({ status: 200, body: [colaboradorApi({ id: 5, email: 'u@x.com' })] });
    void init;
    return fakeResponse({ status: 404 });
  });
});

afterEach(() => {
  jest.useRealTimers();
});

/* ───────────── ChatScreen (/chat/:telefone) ───────────── */

describe('ChatScreen', () => {
  const renderChat = (rota = `/admin/chat/${encodeURIComponent(TEL)}`) => {
    window.history.pushState({}, '', rota); // buildChatUrl lê o window.location real
    return render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={[rota]}>
          <Routes>
            <Route path="/admin/chat" element={<ChatScreen />} />
            <Route path="/admin/chat/:telefone" element={<ChatScreen />} />
          </Routes>
          <Local />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
  };

  it('sem número na URL pede para selecionar um contato', () => {
    renderChat('/admin/chat');

    expect(screen.getByText('Nenhum número selecionado.')).toBeInTheDocument();
    expect(chamadas('/chat/')).toHaveLength(0);
  });

  it('carrega o histórico do número normalizado, marca como lido e lista as conversas', async () => {
    renderChat('/admin/chat/11987654321');

    expect(await screen.findByText('mensagem m1')).toBeInTheDocument();
    expect(screen.getByText('mensagem m2')).toBeInTheDocument();
    expect(chamadas('/chat/history')[0][0]).toBe(`${CHAT}/chat/history/%2B5511987654321?skip=0&limit=20`);
    await waitFor(() => expect(chamadas('/chat/read/', 'PUT')).toHaveLength(1));
    expect(await screen.findByText('2 conversas ativas')).toBeInTheDocument();
  });

  it('identifica o contato pelo telefone (beneficiário)', async () => {
    renderChat();

    expect(await screen.findByText('Maria Contato')).toBeInTheDocument();
    expect(screen.getByText('Beneficiário')).toBeInTheDocument();
  });

  it('envia a mensagem com o id do colaborador logado e recarrega o histórico', async () => {
    renderChat();
    await screen.findByText('mensagem m1');
    await waitFor(() => expect(chamadas('/colaborador')).toHaveLength(1));
    historico = [...historico, mensagem('m3', { text: 'Bom dia!', direction: 'saida' })];

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), 'Bom dia!');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }));

    expect(await screen.findAllByText('Bom dia!')).not.toHaveLength(0);
    const envio = chamadas('/chat/send', 'POST')[0];
    expect(JSON.parse(String(envio[1]?.body))).toEqual({ tel_client: TEL, text: 'Bom dia!', id_colaborador: 5 });
  });

  it('falha ao enviar mostra o erro e permite fechá-lo', async () => {
    falhas.enviar = fakeResponse({ status: 500, body: { detail: 'Twilio indisponível' } });
    renderChat();
    await screen.findByText('mensagem m1');

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), 'oi');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }));

    expect(await screen.findByText('Twilio indisponível')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar alerta de erro' }));
    expect(screen.queryByText('Twilio indisponível')).not.toBeInTheDocument();
  });

  it('erro ao carregar o histórico é mostrado', async () => {
    falhas.historico = fakeResponse({ status: 500, body: { detail: 'Mongo fora do ar' } });
    renderChat();

    expect(await screen.findByText('Mongo fora do ar')).toBeInTheDocument();
  });

  it('histórico vazio (404) mostra o estado inicial', async () => {
    falhas.historico = fakeResponse({ status: 404 });
    renderChat();

    expect(await screen.findByText('Nenhuma mensagem ainda')).toBeInTheDocument();
  });

  it('a barra lateral começa recolhida no mobile e abre/fecha pelos botões', async () => {
    media({ '(min-width: 768px)': false });
    renderChat();
    await screen.findByText('mensagem m1');

    await userEvent.click(screen.getByRole('button', { name: 'Ver conversas' }));
    expect(document.querySelector('.backdrop-blur-\\[1px\\]')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar barra lateral' }));
    expect(document.querySelector('.backdrop-blur-\\[1px\\]')).toBeNull();
  });

  it('escolher outra conversa na barra lateral navega para ela', async () => {
    renderChat();
    await screen.findByText('2 conversas ativas');

    await userEvent.click(screen.getByRole('button', { name: /\+5521912345678/ }));

    expect(screen.getByTestId('local')).toHaveTextContent('/admin/chat/%2B5521912345678');
  });

  it('atualiza a cada 5 segundos e marca como lido quando chega mensagem nova de entrada', async () => {
    jest.useFakeTimers();
    renderChat();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10);
    });
    const leiturasIniciais = chamadas('/chat/read/', 'PUT').length;
    const buscasIniciais = chamadas('/chat/history').length;

    historico = [...historico, mensagem('m9', { text: 'Chegou agora' })];
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });

    expect(chamadas('/chat/history').length).toBeGreaterThan(buscasIniciais);
    expect(screen.getByText('Chegou agora')).toBeInTheDocument();
    expect(chamadas('/chat/read/', 'PUT').length).toBe(leiturasIniciais + 1);
  });

  it('mensagem nova que é de saída não dispara marcação de leitura', async () => {
    jest.useFakeTimers();
    renderChat();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10);
    });
    const leituras = chamadas('/chat/read/', 'PUT').length;

    historico = [...historico, mensagem('m9', { direction: 'saida' })];
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });

    expect(chamadas('/chat/read/', 'PUT').length).toBe(leituras);
  });

  it('falha ao marcar como lido não quebra a tela', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (url.startsWith(`${CHAT}/chat/read`)) throw new TypeError('Failed to fetch');
      if (url.startsWith(`${CHAT}/chat/history`)) return fakeResponse({ status: 200, body: historico });
      if (url === `${CHAT}/chat/conversations`) return fakeResponse({ status: 200, body: conversas });
      return fakeResponse({ status: 200, body: [] });
    });

    renderChat();

    expect(await screen.findByText('mensagem m1')).toBeInTheDocument();
  });

  it('para o polling ao desmontar', async () => {
    jest.useFakeTimers();
    const { unmount } = renderChat();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10);
    });

    unmount();
    const total = fetchMock.mock.calls.length;
    await act(async () => {
      await jest.advanceTimersByTimeAsync(20000);
    });

    expect(fetchMock.mock.calls.length).toBe(total);
  });
});

/* ───────────── ConversasScreen (/chat?phone=) ───────────── */

describe('ConversasScreen', () => {
  const refresh = jest.fn(async () => {});

  const renderConversas = (rota = '/admin/chat') =>
    render(
      <AuthContext.Provider value={auth}>
        <UnreadContext.Provider value={{ totalUnread: 2, conversations: conversas, refresh }}>
          <MemoryRouter initialEntries={[rota]}>
            <Routes>
              <Route path="/admin/chat" element={<ConversasScreen />} />
            </Routes>
            <Local />
          </MemoryRouter>
        </UnreadContext.Provider>
      </AuthContext.Provider>,
    );

  it('sem conversa selecionada mostra a Central de Atendimentos e a lista', () => {
    renderConversas();

    expect(screen.getByText('Central de Atendimentos')).toBeInTheDocument();
    expect(screen.getByText('2 conversas ativas')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Digite uma mensagem')).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([u]) => u.includes('/chat/history'))).toHaveLength(0);
  });

  it('sem conversas mostra o estado vazio da lista', () => {
    conversas = [];
    renderConversas();

    expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument();
    expect(screen.queryByText(/conversas? ativas?/)).not.toBeInTheDocument();
  });

  it('escolher uma conversa grava ?phone=, carrega o histórico e marca como lido', async () => {
    renderConversas();

    await userEvent.click(screen.getByRole('button', { name: /\+5521912345678/ }));

    expect(screen.getByTestId('local')).toHaveTextContent('/admin/chat?phone=%2B5521912345678');
    expect(await screen.findByText('mensagem m1')).toBeInTheDocument();
    await waitFor(() => expect(chamadas('/chat/read/', 'PUT')).toHaveLength(1));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('abre direto pelo telefone da URL (normalizado)', async () => {
    renderConversas('/admin/chat?phone=11987654321');

    expect(await screen.findByText('mensagem m1')).toBeInTheDocument();
    expect(chamadas('/chat/history')[0][0]).toContain('%2B5511987654321');
    expect(await screen.findByText('Maria Contato')).toBeInTheDocument();
  });

  it('no mobile, escolher uma conversa fecha a lista', async () => {
    media({ '(min-width: 768px)': true, '(max-width: 767px)': true });
    renderConversas();
    expect(document.querySelector('.backdrop-blur-\\[1px\\]')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /\+5521912345678/ }));

    await waitFor(() => expect(document.querySelector('.backdrop-blur-\\[1px\\]')).toBeNull());
  });

  it('a lista pode ser fechada pelo botão e reaberta pelo hambúrguer da tela inicial', async () => {
    renderConversas();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar barra lateral' }));
    expect(document.querySelector('.backdrop-blur-\\[1px\\]')).toBeNull();

    const botoes = screen.getAllByRole('button');
    const hamburguer = botoes.find((b) => b.className.includes('md:hidden') && !b.getAttribute('aria-label'));
    await userEvent.click(hamburguer!);
    expect(document.querySelector('.backdrop-blur-\\[1px\\]')).toBeInTheDocument();
  });

  it('o fundo escuro fecha a lista', async () => {
    renderConversas();

    await userEvent.click(document.querySelector('.backdrop-blur-\\[1px\\]') as HTMLElement);

    expect(document.querySelector('.backdrop-blur-\\[1px\\]')).toBeNull();
  });

  it('envia mensagem com o id do colaborador e recarrega o histórico', async () => {
    renderConversas('/admin/chat?phone=11987654321');
    await screen.findByText('mensagem m1');
    await waitFor(() => expect(chamadas('/colaborador')).toHaveLength(1));

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), 'Olá!');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }));

    await waitFor(() => expect(chamadas('/chat/send', 'POST')).toHaveLength(1));
    expect(JSON.parse(String(chamadas('/chat/send', 'POST')[0][1]?.body))).toEqual({ tel_client: TEL, text: 'Olá!', id_colaborador: 5 });
  });

  it('falha ao enviar mostra o erro', async () => {
    falhas.enviar = fakeResponse({ status: 500, body: { detail: 'Sem saldo Twilio' } });
    renderConversas('/admin/chat?phone=11987654321');
    await screen.findByText('mensagem m1');

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }));

    expect(await screen.findByText('Sem saldo Twilio')).toBeInTheDocument();
  });

  it('erro ao carregar o histórico é mostrado e pode ser fechado', async () => {
    falhas.historico = fakeResponse({ status: 500, body: { detail: 'Histórico indisponível' } });
    renderConversas('/admin/chat?phone=11987654321');

    expect(await screen.findByText('Histórico indisponível')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar alerta de erro' }));
    expect(screen.queryByText('Histórico indisponível')).not.toBeInTheDocument();
  });

  it('atualiza o histórico a cada 5s e marca como lido ao chegar mensagem nova', async () => {
    jest.useFakeTimers();
    renderConversas('/admin/chat?phone=11987654321');
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10);
    });
    refresh.mockClear();

    historico = [...historico, mensagem('m9', { text: 'Nova entrada' })];
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });

    expect(screen.getByText('Nova entrada')).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  it('falha ao marcar como lido ainda atualiza a lista', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (url.startsWith(`${CHAT}/chat/read`)) throw new TypeError('Failed to fetch');
      if (url.startsWith(`${CHAT}/chat/history`)) return fakeResponse({ status: 200, body: historico });
      return fakeResponse({ status: 200, body: [] });
    });
    refresh.mockClear();

    renderConversas('/admin/chat?phone=11987654321');

    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
