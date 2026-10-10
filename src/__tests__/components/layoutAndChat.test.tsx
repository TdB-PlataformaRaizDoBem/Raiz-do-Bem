import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/asidebar/Sidebar';
import { Menu_Data } from '../../components/asidebar/MenuData';
import { ChatSidebar } from '../../components/chat/Chatsidebar';
import { ChatWindow } from '../../components/chat/Chatwindow';
import { ConversationItem } from '../../components/chat/Conversationitem';
import { MessageBubble } from '../../components/chat/Messagebubble';
import Footer from '../../components/footer/Footer';
import { Header } from '../../components/header/Header';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { UnreadContext } from '../../context/unread';
import type { ConversationPreview } from '../../domain/entities/ConversationPreview';
import type { MessageResponse } from '../../domain/entities/MessageResponse';
import { AppLayout, AuthLayout, PublicLayout } from '../../layout/Layout';
import ScrollToTop from '../../layout/ScrollToTop';
import { fakeResponse, installFetch } from '../../test/http';

function Local() {
  const { pathname, search } = useLocation();
  return <p data-testid="local">{pathname + search}</p>;
}

const auth = (role: 'ADMIN' | 'COLABORADOR' | null, logout = vi.fn()): AuthContextValue => ({
  user: role ? { email: 'u@x.com', nome: 'Usuária Teste', role, exp: 9999999999 } : null,
  isLoading: false,
  isAuthenticated: !!role,
  login: async () => {},
  logout,
});

const comRota = (ui: ReactNode, rota = '/') => (
  <MemoryRouter initialEntries={[rota]}>
    {ui}
    <Local />
  </MemoryRouter>
);

afterEach(() => {
  window.history.pushState({}, '', '/');
});

/* ───────────── Header ───────────── */

describe('Header', () => {
  const setScroll = (y: number) => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
  };

  afterEach(() => setScroll(0));

  it('mostra logos, links de navegação e CTAs', () => {
    render(comRota(<Header />));

    const principal = screen.getByRole('navigation', { name: 'Navegação principal' });
    ['Início', 'Sobre', 'Integrantes', 'FAQ', 'Contato'].forEach((nome) =>
      expect(within(principal).getByRole('link', { name: nome })).toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: 'Seja um Voluntário' })).toHaveAttribute('href', '/voluntario');
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/auth/login');
    expect(screen.getByAltText('FIAP')).toBeInTheDocument();
  });

  it('marca o link da página atual como ativo', () => {
    render(comRota(<Header />, '/sobre'));

    const principal = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(principal).getByRole('link', { name: 'Sobre' })).toHaveClass('active');
    expect(within(principal).getByRole('link', { name: 'Início' })).not.toHaveClass('active');
  });

  it('o menu mobile abre, lista os links e fecha ao escolher um', async () => {
    render(comRota(<Header />));
    expect(screen.queryByRole('navigation', { name: 'Navegação mobile' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const mobile = screen.getByRole('navigation', { name: 'Navegação mobile' });
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(within(mobile).getByRole('link', { name: 'FAQ' }));

    expect(screen.queryByRole('navigation', { name: 'Navegação mobile' })).not.toBeInTheDocument();
    expect(screen.getByTestId('local')).toHaveTextContent('/faq');
  });

  it('os CTAs do menu mobile também fecham o menu', async () => {
    render(comRota(<Header />));
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const mobile = screen.getByRole('navigation', { name: 'Navegação mobile' });

    await userEvent.click(within(mobile).getByRole('link', { name: 'Seja um Voluntário' }));
    expect(screen.queryByRole('navigation', { name: 'Navegação mobile' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Navegação mobile' })).getByRole('link', { name: 'Entrar' }));
    expect(screen.getByTestId('local')).toHaveTextContent('/auth/login');
  });

  it('esconde ao rolar para baixo (> 120px) e reaparece ao rolar para cima', () => {
    render(comRota(<Header />));
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('translate-y-0');

    setScroll(50);
    expect(header).toHaveClass('translate-y-0'); // desceu pouco

    setScroll(300);
    expect(header).toHaveClass('-translate-y-full');

    setScroll(200);
    expect(header).toHaveClass('translate-y-0');
  });

  it('com o menu mobile aberto, não esconde ao rolar', async () => {
    render(comRota(<Header />));
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    setScroll(500);

    expect(screen.getByRole('banner')).toHaveClass('translate-y-0');
  });
});

/* ───────────── Footer ───────────── */

describe('Footer', () => {
  it('mostra redes sociais, links, contatos e o ano atual', () => {
    render(comRota(<Footer />));

    expect(screen.getByRole('contentinfo', { name: 'Rodapé' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Instagram da Turma do Bem' })).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('link').filter((l) => l.getAttribute('rel') === 'noopener noreferrer')).toHaveLength(5);
    expect(screen.getByRole('link', { name: 'Seja Voluntário' })).toHaveAttribute('href', '/voluntario');
    expect(screen.getByRole('link', { name: 'Nossa História' })).toHaveAttribute('href', '/sobre');
    expect(screen.getByRole('link', { name: 'faleconosco@tdb.org.br' })).toHaveAttribute('href', 'mailto:faleconosco@tdb.org.br');
    const ano = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`© ${ano}`))).toBeInTheDocument();
  });
});

/* ───────────── Menu / Sidebar ───────────── */

describe('Menu_Data', () => {
  it('admin tem 8 itens e coordenador 6, todos com rota do seu painel', () => {
    expect(Menu_Data.admin).toHaveLength(8);
    expect(Menu_Data.coordenador).toHaveLength(6);
    expect(Menu_Data.admin.every((i) => i.path.startsWith('/admin/'))).toBe(true);
    expect(Menu_Data.coordenador.every((i) => i.path.startsWith('/coord/'))).toBe(true);
  });

  it('só "Conversas" tem badge de não lidas', () => {
    expect([...Menu_Data.admin, ...Menu_Data.coordenador].filter((i) => i.hasBadge).map((i) => i.label)).toEqual([
      'Conversas',
      'Conversas',
    ]);
  });
});

describe('Sidebar', () => {
  const renderSidebar = (role: 'ADMIN' | 'COLABORADOR' | null, opts: { collapsed?: boolean; unread?: number; logout?: Mock } = {}) => {
    const setCollapsed = vi.fn();
    const logout = opts.logout ?? vi.fn();
    render(
      <AuthContext.Provider value={auth(role, logout)}>
        <UnreadContext.Provider value={{ totalUnread: opts.unread ?? 0, conversations: [], refresh: async () => {} }}>
          {comRota(<Sidebar isCollapsed={opts.collapsed ?? false} setCollapsed={setCollapsed} />, '/admin/dashboard')}
        </UnreadContext.Provider>
      </AuthContext.Provider>,
    );
    return { setCollapsed, logout };
  };

  it('admin: avatar AD, nome, e-mail e todos os links do menu', () => {
    renderSidebar('ADMIN');

    expect(screen.getByText('AD')).toBeInTheDocument();
    expect(screen.getByText('Usuária Teste')).toBeInTheDocument();
    expect(screen.getByText('u@x.com')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(nav).getAllByRole('link')).toHaveLength(8);
    expect(within(nav).getByRole('link', { name: /Colaboradores/ })).toHaveAttribute('href', '/admin/colaboradores');
  });

  it('coordenador: avatar CO e menu reduzido', () => {
    renderSidebar('COLABORADOR');

    expect(screen.getByText('CO')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(nav).getAllByRole('link')).toHaveLength(6);
    expect(within(nav).queryByRole('link', { name: /Colaboradores/ })).not.toBeInTheDocument();
  });

  it('sem nome no usuário usa o rótulo do papel', () => {
    render(
      <AuthContext.Provider value={{ ...auth('ADMIN'), user: { email: '', nome: '', role: 'ADMIN', exp: 1 } }}>
        <UnreadContext.Provider value={{ totalUnread: 0, conversations: [], refresh: async () => {} }}>
          {comRota(<Sidebar isCollapsed={false} setCollapsed={() => {}} />)}
        </UnreadContext.Provider>
      </AuthContext.Provider>,
    );
    // nome vazio ("") não é null/undefined: mantém vazio; sem usuário usa o papel
    expect(screen.getByText('AD')).toBeInTheDocument();
  });

  it('sem usuário mostra "Coordenador" como padrão', () => {
    renderSidebar(null);
    expect(screen.getByText('Coordenador')).toBeInTheDocument();
    expect(screen.getByText('CO')).toBeInTheDocument();
  });

  it('o botão de recolher chama setCollapsed com o valor invertido', async () => {
    const { setCollapsed } = renderSidebar('ADMIN');

    await userEvent.click(screen.getByRole('button', { name: 'Recolher menu lateral' }));

    expect(setCollapsed).toHaveBeenCalledWith(true);
  });

  it('recolhida: esconde nome e rótulos, e o botão passa a "Expandir"', () => {
    renderSidebar('ADMIN', { collapsed: true });

    expect(screen.queryByText('Usuária Teste')).not.toBeInTheDocument();
    expect(screen.queryByText('Colaboradores')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expandir menu lateral' })).toBeInTheDocument();
  });

  it('Sair da conta chama logout', async () => {
    const { logout } = renderSidebar('ADMIN');

    await userEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('badge de conversas não lidas: número, e "99+" acima de 99', () => {
    const { unmount } = render(
      <AuthContext.Provider value={auth('ADMIN')}>
        <UnreadContext.Provider value={{ totalUnread: 7, conversations: [], refresh: async () => {} }}>
          {comRota(<Sidebar isCollapsed={false} setCollapsed={() => {}} />)}
        </UnreadContext.Provider>
      </AuthContext.Provider>,
    );
    expect(screen.getAllByText('7').length).toBeGreaterThan(0);
    unmount();

    renderSidebar('ADMIN', { unread: 250 });
    expect(screen.getAllByText('99+').length).toBeGreaterThan(0);
  });

  it('sem não lidas não mostra badge', () => {
    renderSidebar('ADMIN', { unread: 0 });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('o menu mobile (hambúrguer) abre o painel completo e o botão fecha', async () => {
    const { setCollapsed } = renderSidebar('ADMIN');

    await userEvent.click(screen.getByRole('button', { name: 'Abrir Menu Lateral' }));
    // aberto no mobile: o botão de recolher passa a fechar o painel em vez de recolher
    await userEvent.click(screen.getByRole('button', { name: 'Recolher menu lateral' }));

    expect(setCollapsed).not.toHaveBeenCalled();
  });

  it('clicar num link do menu navega e fecha o painel mobile', async () => {
    renderSidebar('ADMIN');
    await userEvent.click(screen.getByRole('button', { name: 'Abrir Menu Lateral' }));

    await userEvent.click(within(screen.getByRole('navigation', { name: 'Navegação principal' })).getByRole('link', { name: /Dentistas/ }));

    expect(screen.getByTestId('local')).toHaveTextContent('/admin/dentistas');
  });

  it('a barra inferior mobile tem os 4 primeiros atalhos', () => {
    renderSidebar('ADMIN');
    expect(screen.getByAltText('Painel Geral')).toBeInTheDocument();
    expect(screen.getByAltText('Colaboradores')).toBeInTheDocument();
    expect(screen.getByAltText('Conversas')).toBeInTheDocument();
    expect(screen.getByAltText('Dentistas')).toBeInTheDocument();
  });
});

/* ───────────── Layouts / ScrollToTop ───────────── */

describe('layouts', () => {
  beforeEach(() => {
    installFetch().mockResolvedValue(fakeResponse({ status: 200, body: [] }));
  });

  const comRotas = (layout: ReactNode, rota: string, usuario: AuthContextValue = auth('ADMIN')) =>
    render(
      <AuthContext.Provider value={usuario}>
        <MemoryRouter initialEntries={[rota]}>
          <Routes>
            <Route element={layout}>
              <Route path="*" element={<p>conteúdo da página</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

  it('PublicLayout: header, conteúdo e footer', () => {
    comRotas(<PublicLayout />, '/');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('AuthLayout: só o conteúdo', () => {
    comRotas(<AuthLayout />, '/auth/login');

    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('AppLayout: sidebar + título da página + conteúdo', async () => {
    comRotas(<AppLayout />, '/admin/dentistas');

    expect(screen.getByRole('complementary', { name: 'Menu lateral' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gerenciar Dentistas');
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled()); // UnreadProvider consulta as conversas
  });

  it('AppLayout em rota de chat: sem título e com altura fixa', () => {
    comRotas(<AppLayout />, '/admin/chat');

    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('overflow-hidden');
  });

  it('AppLayout: recolher a sidebar ajusta a margem do conteúdo', async () => {
    comRotas(<AppLayout />, '/admin/dentistas');
    expect(screen.getByRole('main')).toHaveClass('lg:ml-75');

    await userEvent.click(screen.getByRole('button', { name: 'Recolher menu lateral' }));

    expect(screen.getByRole('main')).toHaveClass('lg:ml-24');
  });
});

describe('ScrollToTop', () => {
  it('rola para o topo ao montar e a cada mudança de rota', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/a']}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<NavegarPara destino="/b" />} />
          <Route path="/b" element={<p>página b</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(scrollTo.mock.calls[0][0]).toEqual({ top: 0, left: 0, behavior: 'smooth' });
    scrollTo.mockClear();

    await userEvent.click(screen.getByRole('button', { name: 'ir' }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    scrollTo.mockRestore();
  });

  function NavegarPara({ destino }: { destino: string }) {
    const navigate = useNavigate();
    return <button onClick={() => navigate(destino)}>ir</button>;
  }
});

/* ───────────── Chat ───────────── */

const conversa = (o: Partial<ConversationPreview> = {}): ConversationPreview => ({
  tel_client: '+5511987654321',
  text: 'Olá, tudo bem?',
  date_time: new Date(2026, 2, 9, 14, 5).toISOString(),
  direction: 'entrada',
  unread_count: 0,
  ...o,
});

const mensagem = (o: Partial<MessageResponse> = {}): MessageResponse => ({
  id_db: 'm1',
  id_message_twilio: 't1',
  tel_client: '+5511987654321',
  text: 'Oi!',
  direction: 'entrada',
  date_time: new Date(2026, 2, 9, 14, 5).toISOString(),
  ...o,
});

describe('ConversationItem', () => {
  it('mostra telefone formatado, prévia, hora e avatar', () => {
    render(<ConversationItem conversation={conversa()} isActive={false} onClick={() => {}} />);

    expect(screen.getByText('+5511987654321')).toBeInTheDocument(); // 13 dígitos: formatPhone mantém o original
    expect(screen.getByText('Olá, tudo bem?')).toBeInTheDocument();
    expect(screen.getByText('14:05')).toBeInTheDocument();
    expect(screen.queryByLabelText(/não lidas/)).not.toBeInTheDocument();
  });

  it('mensagens de saída ganham o prefixo "Você:"', () => {
    render(<ConversationItem conversation={conversa({ direction: 'saida' })} isActive={false} onClick={() => {}} />);
    expect(screen.getByText('Você:')).toBeInTheDocument();
  });

  it('badge de não lidas com contagem e "99+"', () => {
    const { rerender } = render(
      <ConversationItem conversation={conversa({ unread_count: 3 })} isActive={false} onClick={() => {}} />,
    );
    expect(screen.getByLabelText('3 mensagens não lidas')).toHaveTextContent('3');

    rerender(<ConversationItem conversation={conversa({ unread_count: 150 })} isActive={false} onClick={() => {}} />);
    expect(screen.getByLabelText('150 mensagens não lidas')).toHaveTextContent('99+');
  });

  it('destaca a conversa ativa e dispara onClick', async () => {
    const onClick = vi.fn();
    render(<ConversationItem conversation={conversa({ text: null })} isActive onClick={onClick} />);

    expect(screen.getByRole('button')).toHaveClass('bg-[#f0f2f5]');
    expect(screen.getByText('…')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('MessageBubble', () => {
  it('mensagem de entrada: à esquerda, sem marcações de envio', () => {
    const { container } = render(<MessageBubble msg={mensagem()} />);

    expect(screen.getByText('Oi!')).toBeInTheDocument();
    expect(screen.getByText('14:05')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('justify-start');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('mensagem de saída: à direita, com ícone de enviado e o id do colaborador', () => {
    const { container } = render(<MessageBubble msg={mensagem({ direction: 'saida', id_colaborador: 7 })} />);

    expect(container.firstChild).toHaveClass('justify-end');
    expect(screen.getByText('· #7')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('saída sem colaborador não mostra o id; texto nulo vira vazio', () => {
    render(<MessageBubble msg={mensagem({ direction: 'saida', id_colaborador: null, text: null as unknown as string })} />);

    expect(screen.queryByText(/· #/)).not.toBeInTheDocument();
  });
});

describe('ChatSidebar', () => {
  const renderSidebar = (props: Partial<React.ComponentProps<typeof ChatSidebar>> = {}) => {
    const onClose = vi.fn();
    window.history.pushState({}, '', '/admin/chat');
    render(
      comRota(
        <ChatSidebar conversations={[]} activeTel="" isOpen onClose={onClose} {...props} />,
        '/admin/chat',
      ),
    );
    return { onClose };
  };

  it('sem conversas mostra o estado vazio e nenhum rodapé', () => {
    renderSidebar();

    expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument();
    expect(screen.queryByText(/conversa(s)? ativa/)).not.toBeInTheDocument();
  });

  it('lista as conversas, destaca a ativa e conta no rodapé (singular/plural)', () => {
    const { unmount } = render(
      comRota(<ChatSidebar conversations={[conversa()]} activeTel="+5511987654321" isOpen onClose={() => {}} />),
    );
    expect(screen.getByText('1 conversa ativa')).toBeInTheDocument();
    unmount();

    renderSidebar({ conversations: [conversa(), conversa({ tel_client: '+5521912345678' })] });
    expect(screen.getByText('2 conversas ativas')).toBeInTheDocument();
  });

  it('escolher uma conversa fecha o painel e navega ao chat dela', async () => {
    const { onClose } = renderSidebar({ conversations: [conversa()] });

    await userEvent.click(screen.getByRole('button', { name: /Olá, tudo bem\?/ }));

    expect(onClose).toHaveBeenCalled();
    expect(screen.getByTestId('local')).toHaveTextContent('/admin/chat/%2B5511987654321');
  });

  it('o botão de fechar e o fundo escuro chamam onClose', async () => {
    const { onClose } = renderSidebar();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar barra lateral' }));
    fireEvent.click(document.querySelector('.backdrop-blur-\\[1px\\]')!);

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('fechada não mostra o fundo escuro', () => {
    renderSidebar({ isOpen: false });
    expect(document.querySelector('.backdrop-blur-\\[1px\\]')).toBeNull();
  });
});

describe('ChatWindow', () => {
  const baseProps = () => ({
    telefone: '11987654321',
    messages: [] as MessageResponse[],
    loading: false,
    sending: false,
    error: null as string | null,
    onSend: vi.fn<(texto: string) => Promise<void>>(async () => {}),
    onClearError: vi.fn(),
    onOpenSidebar: vi.fn(),
  });

  const renderar = (o: Partial<ReturnType<typeof baseProps>> & { contact?: React.ComponentProps<typeof ChatWindow>['contact'] } = {}) => {
    const props = { ...baseProps(), ...o };
    render(<ChatWindow {...props} />);
    return props;
  };

  it('sem contato: mostra o telefone formatado e bruto', () => {
    renderar();

    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument();
    expect(screen.getByText('11987654321')).toBeInTheDocument();
  });

  it.each([
    ['beneficiario', 'Beneficiário'],
    ['dentista', 'Dentista'],
  ] as const)('com contato %s: mostra o nome e a etiqueta "%s"', (tipo, etiqueta) => {
    renderar({ contact: { nome: 'Maria Contato', tipo } });

    expect(screen.getByText('Maria Contato')).toBeInTheDocument();
    expect(screen.getByText(etiqueta)).toBeInTheDocument();
  });

  it('estados do feed: carregando, vazio e com mensagens', () => {
    const { unmount } = render(<ChatWindow {...baseProps()} loading />);
    expect(document.querySelectorAll('.animate-bounce')).toHaveLength(3);
    expect(screen.queryByText('Nenhuma mensagem ainda')).not.toBeInTheDocument();
    unmount();

    const vazio = render(<ChatWindow {...baseProps()} />);
    expect(screen.getByText('Nenhuma mensagem ainda')).toBeInTheDocument();
    vazio.unmount();

    render(<ChatWindow {...baseProps()} messages={[mensagem({ text: 'Primeira' }), mensagem({ id_db: 'm2', text: 'Segunda' })]} />);
    expect(screen.getByText('Primeira')).toBeInTheDocument();
    expect(screen.getByText('Segunda')).toBeInTheDocument();
  });

  it('enviando: mostra o indicador e desabilita o campo', () => {
    renderar({ sending: true });

    expect(screen.getByPlaceholderText('Digite uma mensagem')).toBeDisabled();
    expect(document.querySelectorAll('.animate-bounce')).toHaveLength(3);
  });

  it('o botão de enviar só habilita com texto', async () => {
    renderar();
    const enviar = screen.getByRole('button', { name: 'Enviar mensagem' });
    expect(enviar).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), '   ');
    expect(enviar).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), 'Olá');
    expect(enviar).toBeEnabled();
  });

  it('enviar chama onSend com o texto sem espaços nas pontas e limpa o campo', async () => {
    const props = renderar();
    const campo = screen.getByPlaceholderText('Digite uma mensagem');

    await userEvent.type(campo, '  Bom dia  ');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }));

    await waitFor(() => expect(props.onSend).toHaveBeenCalledWith('Bom dia'));
    await waitFor(() => expect(campo).toHaveValue(''));
  });

  it('Enter envia; Shift+Enter quebra linha', async () => {
    const props = renderar();
    const campo = screen.getByPlaceholderText('Digite uma mensagem');

    await userEvent.type(campo, 'linha 1{Shift>}{Enter}{/Shift}linha 2');
    expect(props.onSend).not.toHaveBeenCalled();
    expect(campo).toHaveValue('linha 1\nlinha 2');

    await userEvent.type(campo, '{Enter}');
    await waitFor(() => expect(props.onSend).toHaveBeenCalledWith('linha 1\nlinha 2'));
  });

  it('Enter com campo vazio não envia', async () => {
    const props = renderar();

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), '{Enter}');

    expect(props.onSend).not.toHaveBeenCalled();
  });

  it('erro: mostra o alerta e permite fechar', async () => {
    const props = renderar({ error: 'Falha ao enviar pelo Twilio' });

    expect(screen.getByText('Falha ao enviar pelo Twilio')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar alerta de erro' }));

    expect(props.onClearError).toHaveBeenCalled();
  });

  it('o botão de hambúrguer abre a lista de conversas', async () => {
    const props = renderar();

    await userEvent.click(screen.getByRole('button', { name: 'Ver conversas' }));

    expect(props.onOpenSidebar).toHaveBeenCalled();
  });

  it('rola o feed para o fim quando chegam novas mensagens', () => {
    const { rerender } = render(<ChatWindow {...baseProps()} messages={[mensagem()]} />);
    const feed = document.querySelector('.overflow-y-auto.overscroll-contain') as HTMLElement;
    Object.defineProperty(feed, 'scrollHeight', { value: 900, configurable: true });

    rerender(<ChatWindow {...baseProps()} messages={[mensagem(), mensagem({ id_db: 'm2' })]} />);

    expect(feed.scrollTop).toBe(900);
  });

  it('o texto digitado persiste enquanto o componente pai re-renderiza', async () => {
    function Pai() {
      const [n, setN] = useState(0);
      return (
        <>
          <button onClick={() => setN(n + 1)}>re-render {n}</button>
          <ChatWindow {...baseProps()} />
        </>
      );
    }
    render(<Pai />);

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), 'rascunho');
    await userEvent.click(screen.getByRole('button', { name: /re-render/ }));

    expect(screen.getByPlaceholderText('Digite uma mensagem')).toHaveValue('rascunho');
  });
});
