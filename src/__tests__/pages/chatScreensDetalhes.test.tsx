import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { UnreadContext } from '../../context/unread';
import type { ConversationPreview } from '../../domain/entities/ConversationPreview';
import ChatScreen from '../../pages/chat/ChatScreen';
import ConversasScreen from '../../pages/conversas/ConversasScreen';
import { getActiveConversations, getChatHistory, markAsRead, sendMessage } from '../../services/ChatService';
import { fakeResponse, installFetch } from '../../test/http';

// Aqui o serviço de chat é controlado diretamente: os caminhos de erro que NÃO vêm como `Error`
// (e o colaborador sem cadastro) não dá para provocar pelo fetch, que sempre devolve `Error`.
vi.mock('../../services/ChatService', async () => ({
  ...(await vi.importActual<object>('../../services/ChatService')),
  getChatHistory: vi.fn(),
  getActiveConversations: vi.fn(),
  markAsRead: vi.fn(),
  sendMessage: vi.fn(),
}));

const TEL = '+5511987654321';

const auth: AuthContextValue = {
  user: { email: 'u@x.com', nome: 'Usuária', role: 'ADMIN', exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

const conversa = (tel: string): ConversationPreview => ({
  tel_client: tel,
  text: 'oi',
  date_time: '2026-03-09T14:05:00',
  direction: 'entrada',
  unread_count: 0,
});

const media = (mobile: boolean) => {
  window.matchMedia = ((q: string) => ({ matches: !mobile && q === '(min-width: 768px)', media: q }) as MediaQueryList) as typeof window.matchMedia;
};

beforeEach(() => {
  media(false);
  vi.mocked(getChatHistory).mockReset().mockResolvedValue([]);
  vi.mocked(getActiveConversations).mockReset().mockResolvedValue([conversa(TEL)]);
  vi.mocked(markAsRead).mockReset().mockResolvedValue({ status: 'ok', messagens_updated: 0 } as never);
  vi.mocked(sendMessage).mockReset().mockResolvedValue({ status: 'ok', id_db: 'x', id_twilio: 'y' });

  // Contato e colaboradores: a lista de colaboradores vem VAZIA, então o usuário logado não é achado.
  const fetchMock = installFetch();
  fetchMock.mockImplementation(async () => fakeResponse({ status: 200, body: [] }));
});

const enviar = async (texto: string) => {
  await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), texto);
  await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
};

function renderChatScreen() {
  window.history.pushState({}, '', `/admin/chat/${encodeURIComponent(TEL)}`);
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[`/admin/chat/${encodeURIComponent(TEL)}`]}>
        <Routes>
          <Route path="/admin/chat/:telefone" element={<ChatScreen />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

function renderConversas(conversas: ConversationPreview[] = [conversa(TEL)]) {
  return render(
    <AuthContext.Provider value={auth}>
      <UnreadContext.Provider value={{ totalUnread: 0, conversations: conversas, refresh: async () => {} }}>
        <MemoryRouter initialEntries={[`/admin/chat?phone=${encodeURIComponent(TEL)}`]}>
          <Routes>
            <Route path="/admin/chat" element={<ConversasScreen />} />
          </Routes>
        </MemoryRouter>
      </UnreadContext.Provider>
    </AuthContext.Provider>,
  );
}

describe.each([
  ['ChatScreen', renderChatScreen],
  ['ConversasScreen', () => renderConversas()],
] as const)('%s — falhas e casos de borda', (_nome, renderTela) => {
  it('falha do histórico que não é um Error mostra a mensagem padrão', async () => {
    vi.mocked(getChatHistory).mockRejectedValue('quebrou');

    renderTela();

    expect(await screen.findByText('Erro ao carregar histórico.')).toBeInTheDocument();
  });

  it('falha do histórico com Error mostra a mensagem do erro', async () => {
    vi.mocked(getChatHistory).mockRejectedValue(new Error('Sem conexão com o servidor.'));

    renderTela();

    expect(await screen.findByText('Sem conexão com o servidor.')).toBeInTheDocument();
  });

  it('falha do envio que não é um Error mostra a mensagem padrão', async () => {
    vi.mocked(sendMessage).mockRejectedValue('quebrou');
    renderTela();
    await screen.findByPlaceholderText('Digite uma mensagem');

    await enviar('Olá');

    expect(await screen.findByText('Falha ao enviar mensagem.')).toBeInTheDocument();
  });

  it('falha do envio com Error mostra a mensagem do erro', async () => {
    vi.mocked(sendMessage).mockRejectedValue(new Error('Twilio recusou'));
    renderTela();
    await screen.findByPlaceholderText('Digite uma mensagem');

    await enviar('Olá');

    expect(await screen.findByText('Twilio recusou')).toBeInTheDocument();
  });

  it('usuário sem cadastro de colaborador envia com id 0 (não bloqueia o atendimento)', async () => {
    renderTela();
    await screen.findByPlaceholderText('Digite uma mensagem');

    await enviar('Olá');

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith({ tel_client: TEL, text: 'Olá', id_colaborador: 0 }),
    );
  });
});

describe('ConversasScreen — barra lateral', () => {
  it('uma conversa só usa o singular no rodapé', () => {
    renderConversas([conversa(TEL)]);

    expect(screen.getByText('1 conversa ativa')).toBeInTheDocument();
  });

  it('várias conversas usam o plural', () => {
    renderConversas([conversa(TEL), conversa('+5521912345678')]);

    expect(screen.getByText('2 conversas ativas')).toBeInTheDocument();
  });

  it('no celular a barra começa fechada e o botão do cabeçalho do chat a abre', async () => {
    media(true);
    const { container } = renderConversas();
    await screen.findByPlaceholderText('Digite uma mensagem');
    const fundo = () => container.querySelector('[class*="backdrop-blur-[1px]"]');
    expect(fundo()).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Ver conversas' }));

    expect(fundo()).not.toBeNull();
  });
});
