import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { queryClient } from '../../lib/queryClient';
import { tokenStore } from '../../services/tokenStore';
import { beneficiarioApi, dentistaApi, pedidoApi } from '../../test/factories';
import { resetGsapMock } from '../../test/gsapMock';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';
import { makeJwt, nowInSeconds } from '../../test/jwt';

vi.mock('../../lib/gsap', () => import('../../test/gsapMock'));
vi.mock('@gsap/react', async () => ({ useGSAP: (await import('../../test/gsapMock')).useGSAP }));
vi.mock('lenis', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({ on: vi.fn(), raf: vi.fn(), destroy: vi.fn() })),
}));

let fetchMock: FetchMock;

const ok = (body: unknown, status = 200) => fakeResponse({ status, body });

/** Back "completo" o bastante para o dashboard e o login; o resto responde lista vazia. */
function backFalso(overrides: (url: string, init?: RequestInit) => Response | undefined = () => undefined) {
  fetchMock.mockImplementation(async (url, init) => {
    const custom = overrides(url, init);
    if (custom) return custom;
    if (url === '/pedido-ajuda') return ok([pedidoApi({ status: 'PENDENTE' })]);
    if (url === '/beneficiario') return ok([beneficiarioApi()]);
    if (url === '/dentista') return ok([dentistaApi()]);
    return ok([]);
  });
}

const irPara = (path: string) => window.history.pushState({}, '', path);
/** A sidebar desktop e a barra inferior mobile repetem os links: usa o menu lateral. */
const menuLateral = () => screen.getByRole('navigation', { name: 'Navegação principal' });

const tokenAdmin = () => makeJwt({ nome: 'Admin Teste', groups: ['ADMIN'], sub: 'admin@x.com' });
const tokenColaborador = () => makeJwt({ nome: 'Colab Teste', groups: ['COLABORADOR'], sub: 'colab@x.com' });

beforeEach(() => {
  resetGsapMock();
  Object.assign(document, { fonts: { ready: Promise.resolve() } });
  window.localStorage.clear();
  tokenStore.clear();
  queryClient.clear(); // o App usa o cache único do módulo: limpa entre os testes
  localStorage.clear();
  fetchMock = installFetch();
  backFalso();
  document.title = 'Raiz do Bem';
});

afterEach(() => {
  irPara('/');
});

describe('App — rotas públicas', () => {
  it('a Home carrega no "/" e atualiza o título da aba', async () => {
    irPara('/');
    render(<App />);

    expect(await screen.findByRole('img', { name: /Dentista voluntário da Turma do Bem/ })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Home | Raiz do Bem'));
    expect(screen.getByRole('banner')).toBeInTheDocument(); // PublicLayout
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it.each([
    ['/sobre', 'Sobre | Raiz do Bem', 'Raiz do Bem:'],
    ['/integrantes', 'Integrantes | Raiz do Bem', 'Quem Faz Acontecer'],
    ['/faq', 'FAQ | Raiz do Bem', 'Perguntas Frequentes'],
    ['/contato', 'Contato | Raiz do Bem', 'Inclusão Social Através do Sorriso'],
    ['/voluntario', 'Seja Voluntário | Raiz do Bem', 'Seja um Dentista Voluntário'],
  ])('%s → título "%s"', async (rota, titulo, heading) => {
    irPara(rota);
    render(<App />);

    expect(await screen.findByRole('heading', { level: 1, name: new RegExp(heading) })).toBeInTheDocument();
    expect(document.title).toBe(titulo);
  });

  it('rota inexistente não muda o título', async () => {
    irPara('/nao-existe');
    render(<App />);

    await waitFor(() => expect(document.title).toBe('Raiz do Bem'));
  });
});

describe('App — autenticação e permissões', () => {
  it('a tela de login é pública', async () => {
    irPara('/auth/login');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Login Administrativo' })).toBeInTheDocument();
  });

  it('sem sessão, uma rota protegida redireciona para o login', async () => {
    irPara('/admin/dashboard');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Login Administrativo' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/auth/login');
  });

  it('ADMIN com sessão (F5) vê o painel administrativo com a sidebar', async () => {
    tokenStore.set(tokenAdmin(), 'refresh');
    irPara('/admin/dashboard');
    render(<App />);

    expect(await screen.findByText('Resumo de Impacto')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Menu lateral' })).toBeInTheDocument();
    expect(screen.getByText('Admin Teste')).toBeInTheDocument();
    expect(within(menuLateral()).getByRole('link', { name: /Colaboradores/ })).toBeInTheDocument();
  });

  it('COLABORADOR é barrado das rotas /admin (vai para o 403)', async () => {
    tokenStore.set(tokenColaborador(), 'refresh');
    irPara('/admin/dashboard');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Acesso Negado' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/403');
  });

  it('COLABORADOR acessa /coord, sem o item de Colaboradores no menu', async () => {
    tokenStore.set(tokenColaborador(), 'refresh');
    irPara('/coord/dashboard');
    render(<App />);

    expect(await screen.findByText('Resumo de Impacto')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Colaboradores/ })).not.toBeInTheDocument();
  });

  it('ADMIN também acessa /coord', async () => {
    tokenStore.set(tokenAdmin(), 'refresh');
    irPara('/coord/dashboard');
    render(<App />);

    expect(await screen.findByText('Resumo de Impacto')).toBeInTheDocument();
  });

  it('F5 com access token vencido: renova em segundo plano e entra sem pedir login', async () => {
    tokenStore.set(makeJwt({ exp: nowInSeconds() - 3600, nome: 'Vencido' }), 'refresh-valido');
    backFalso((url) =>
      url === '/auth/refreshToken'
        ? ok({ token: tokenAdmin(), refreshToken: 'refresh-novo', tipo: 'BearerToken' })
        : undefined,
    );
    irPara('/admin/dashboard');
    render(<App />);

    expect(await screen.findByText('Resumo de Impacto')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([u]) => u === '/auth/refreshToken')).toBe(true);
    expect(tokenStore.getRefresh()).toBe('refresh-novo');
  });

  it('F5 com refresh token recusado: volta para o login', async () => {
    tokenStore.set(makeJwt({ exp: nowInSeconds() - 3600 }), 'refresh-vencido');
    backFalso((url) => (url === '/auth/refreshToken' ? fakeResponse({ status: 401, body: { mensagem: 'expirado' } }) : undefined));
    irPara('/admin/dashboard');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Login Administrativo' })).toBeInTheDocument();
    expect(tokenStore.get()).toBeNull();
  });

  it('login completo: credenciais → /auth/tokenAcesso → painel; depois "Sair da conta" volta ao login', async () => {
    backFalso((url, init) =>
      url === '/auth/tokenAcesso' && init?.method === 'POST'
        ? ok({ token: tokenAdmin(), refreshToken: 'refresh-1', tipo: 'BearerToken' })
        : undefined,
    );
    irPara('/auth/login');
    render(<App />);

    await userEvent.type(await screen.findByLabelText('E-mail'), 'admin@x.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));

    expect(await screen.findByText('Resumo de Impacto')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/admin/dashboard');
    expect(tokenStore.getRefresh()).toBe('refresh-1');

    await userEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(await screen.findByRole('heading', { name: 'Login Administrativo' })).toBeInTheDocument();
    expect(tokenStore.get()).toBeNull();
    expect(tokenStore.getRefresh()).toBeNull();
  });

  it('login com credenciais erradas mostra o aviso e continua na tela de login', async () => {
    backFalso((url) =>
      url === '/auth/tokenAcesso' ? fakeResponse({ status: 422, body: { mensagem: 'Email ou senha inválido(s).' } }) : undefined,
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    irPara('/auth/login');
    render(<App />);

    await userEvent.type(await screen.findByLabelText('E-mail'), 'admin@x.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas');
    expect(window.location.pathname).toBe('/auth/login');
  });

  it('login de COLABORADOR cai no painel de coordenação', async () => {
    backFalso((url) =>
      url === '/auth/tokenAcesso' ? ok({ token: tokenColaborador(), refreshToken: 'r', tipo: 'BearerToken' }) : undefined,
    );
    irPara('/auth/login');
    render(<App />);

    await userEvent.type(await screen.findByLabelText('E-mail'), 'colab@x.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));

    await screen.findByText('Resumo de Impacto');
    expect(window.location.pathname).toBe('/coord/dashboard');
  });

  it('voltar a uma tela já visitada usa o cache: o dashboard não refaz as requisições', async () => {
    tokenStore.set(tokenAdmin(), 'refresh');
    irPara('/admin/dashboard');
    render(<App />);
    await screen.findByText('Resumo de Impacto');
    await waitFor(() => expect(fetchMock.mock.calls.some(([u]) => u === '/beneficiario')).toBe(true));
    const antes = fetchMock.mock.calls.filter(([u]) => u === '/beneficiario' || u === '/pedido-ajuda' || u === '/dentista').length;

    await userEvent.click(within(menuLateral()).getByRole('link', { name: /Dentistas/ }));
    await screen.findByText('Dr. João');
    await userEvent.click(within(menuLateral()).getByRole('link', { name: /Painel Geral/ }));
    await screen.findByText('Resumo de Impacto');

    const depois = fetchMock.mock.calls.filter(([u]) => u === '/beneficiario' || u === '/pedido-ajuda' || u === '/dentista').length;
    expect(depois).toBe(antes); // /dentista já estava em cache do dashboard; nada foi buscado de novo
  });

  it('outro usuário que entra depois do logout não vê dados do anterior (cache limpo)', async () => {
    backFalso((url, init) =>
      url === '/auth/tokenAcesso' && init?.method === 'POST'
        ? ok({ token: tokenAdmin(), refreshToken: 'r', tipo: 'BearerToken' })
        : undefined,
    );
    irPara('/auth/login');
    render(<App />);
    await userEvent.type(await screen.findByLabelText('E-mail'), 'admin@x.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));
    await screen.findByText('Resumo de Impacto');
    await waitFor(() => expect(queryClient.getQueryCache().getAll().length).toBeGreaterThan(0));

    await userEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));

    await screen.findByRole('heading', { name: 'Login Administrativo' });
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it('navegar pelo menu lateral muda de página (Dentistas)', async () => {
    tokenStore.set(tokenAdmin(), 'refresh');
    irPara('/admin/dashboard');
    render(<App />);
    await screen.findByText('Resumo de Impacto');

    await userEvent.click(within(menuLateral()).getByRole('link', { name: /Dentistas/ }));

    expect(await screen.findByText('Dr. João')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/admin/dentistas');
  });
});
