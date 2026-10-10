import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { gsap, motionQuery } from '../../lib/gsap';
import About from '../../pages/about/About';
import Contact from '../../pages/contact/Contact';
import ContactForm from '../../pages/contact/Form/ContactForm';
import Faq from '../../pages/faq/Faq';
import Home from '../../pages/home/Home';
import Login from '../../pages/login/Login';
import Team from '../../pages/Team/Team';
import Voluntary from '../../pages/voluntary/Voluntary';
import VoluntaryForm from '../../pages/voluntary/form/VoluntaryForm';
import { routes } from '../../Routes/Routes';
import { resetGsapMock, runMatchMedia } from '../../test/gsapMock';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

vi.mock('../../lib/gsap', () => import('../../test/gsapMock'));
vi.mock('@gsap/react', async () => ({ useGSAP: (await import('../../test/gsapMock')).useGSAP }));
vi.mock('lenis', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({ on: vi.fn(), raf: vi.fn(), destroy: vi.fn() })),
}));

let fetchMock: FetchMock;

const noAuth: AuthContextValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
};

const comRouter = (ui: ReactNode, rota = '/') => (
  <MemoryRouter initialEntries={[rota]}>
    <NotificationProvider>{ui}</NotificationProvider>
  </MemoryRouter>
);

const digitar = async (label: string | RegExp, valor: string) => {
  const campo = screen.getByLabelText(label);
  await userEvent.clear(campo);
  await userEvent.type(campo, valor);
};

const anosAtras = (anos: number) => `${new Date().getFullYear() - anos}-06-15`;

const marcar = (nome: RegExp) => userEvent.click(screen.getByRole('checkbox', { name: nome }));

/** Marca as autorizações do pedido de ajuda; menores precisam também da declaração do responsável. */
const autorizarPedido = async (idade: number) => {
  await marcar(/Li e concordo/);
  await marcar(/dados sensíveis/);
  if (idade < 18) await marcar(/responsável legal/);
};

beforeEach(() => {
  resetGsapMock();
  Object.assign(document, { fonts: { ready: Promise.resolve() } });
  fetchMock = installFetch();
  localStorage.clear();
  sessionStorage.clear();
});

/* ───────────── páginas institucionais ───────────── */

describe('Home', () => {
  it('mostra o hero, as seções principais e os links de ação', () => {
    render(comRouter(<Home />));

    expect(screen.getByRole('img', { name: /Dentista voluntário da Turma do Bem/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /sobre|conheça/i }).length).toBeGreaterThan(0);
    expect(document.querySelector('a[href="/voluntario"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="/contato"]')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Histórias em destaque' })).toBeInTheDocument(); // carrossel
  });

  it('registra a animação de parallax do mascote e a executa só com movimento permitido', () => {
    render(comRouter(<Home />));

    runMatchMedia((q) => q === motionQuery);

    const chamadas = (gsap.to as Mock).mock.calls as [unknown, Record<string, unknown>][];
    const parallax = chamadas.find(([, opts]) => opts.yPercent === -12);
    expect(parallax).toBeDefined();
    expect(parallax?.[1]).toMatchObject({ rotate: -6, scrollTrigger: { scrub: true, start: 'top bottom' } });
  });

  it('contadores de impacto animam (Counter) ao entrar na tela', () => {
    render(comRouter(<Home />));

    runMatchMedia((q) => q === motionQuery);

    const contadores = (gsap.to as Mock).mock.calls.filter(([alvo]) => (alvo as { n?: number })?.n === 0);
    expect(contadores.length).toBeGreaterThan(0);
  });
});

describe('About, Team, Faq e Contact', () => {
  it('About: hero e seções de conteúdo', () => {
    render(comRouter(<About />));

    expect(screen.getByRole('heading', { level: 1, name: /Raiz do Bem/ })).toBeInTheDocument();
    expect(screen.getByAltText('Mascote da Raiz do Bem regando uma planta')).toBeInTheDocument();
  });

  it('About: os números de impacto são animados (Counter)', () => {
    render(comRouter(<About />));

    runMatchMedia((q) => q === motionQuery);

    expect((gsap.to as Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('Team: um cartão por integrante, com LinkedIn e GitHub', () => {
    render(comRouter(<Team />));

    expect(screen.getByRole('heading', { level: 1, name: 'Quem Faz Acontecer' })).toBeInTheDocument();
    const cartoes = screen.getAllByRole('article');
    expect(cartoes.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /LinkedIn de/ })).toHaveLength(cartoes.length);
    expect(screen.getAllByRole('link', { name: /GitHub de/ })).toHaveLength(cartoes.length);
  });

  it('Faq: categorias com perguntas expansíveis e link para contato', () => {
    const { container } = render(comRouter(<Faq />));

    expect(screen.getByRole('heading', { level: 1, name: 'Perguntas Frequentes' })).toBeInTheDocument();
    expect(container.querySelectorAll('details').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('summary').length).toBe(container.querySelectorAll('details').length);
    expect(screen.getByRole('link', { name: 'Contate-Nos' })).toHaveAttribute('href', '/contato');
  });

  it('Contact: mostra o formulário de pedido de ajuda e os dados de contato', () => {
    render(comRouter(<Contact />));

    expect(screen.getByRole('heading', { name: 'Solicitar Ajuda' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'turmadobem@tdb.org.br' })).toHaveAttribute('href', 'mailto:turmadobem@tdb.org.br');
    // O iframe do Google só carrega com permissão: sem ela, aparece o espaço reservado.
    expect(screen.queryByTitle(/Mapa com a localização/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Carregar o mapa agora' })).toBeInTheDocument();
  });
});

/* ───────────── Contact: formulário de pedido de ajuda ───────────── */

describe('ContactForm (pedido de ajuda)', () => {
  const renderForm = () => render(comRouter(<ContactForm />));

  const preencherBase = async (opts: { sexo: string; idade: number; autorizar?: boolean }) => {
    await digitar(/Nome Completo/, 'Maria da Silva');
    await digitar(/CPF/, '123.456.789-01');
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/), { target: { value: anosAtras(opts.idade) } });
    await userEvent.selectOptions(screen.getByLabelText(/Sexo/), opts.sexo);
    await digitar(/Email/, 'maria@x.com');
    await digitar(/Telefone/, '(11) 98765-4321');
    await digitar(/CEP/, '01001-000');
    await digitar(/Número/, '100');
    await digitar(/Descrição do Problema/, 'Preciso de atendimento para dor de dente forte.');
    if (opts.autorizar !== false) await autorizarPedido(opts.idade);
  };

  it('menor de idade envia o pedido com os dados normalizados', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 201, body: { id: 1, status: 'PENDENTE' } }));
    renderForm();

    await preencherBase({ sexo: 'masculino', idade: 10 });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar para Triagem' }));

    expect(await screen.findByText('Pedido enviado com sucesso!')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe('/pedido-ajuda');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      nome: 'Maria da Silva',
      cpf: '12345678901',
      dataNascimento: anosAtras(10),
      sexo: 'M',
      telefone: '11987654321',
      email: 'maria@x.com',
      descricaoProblema: 'Preciso de atendimento para dor de dente forte.',
      endereco: { cep: '01000000'.replace('01000000', '01001000'), numero: '100' },
    });
  });

  it('depois de enviar, limpa o formulário e o rascunho', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 201, body: { id: 1, status: 'PENDENTE' } }));
    renderForm();

    await preencherBase({ sexo: 'masculino', idade: 10 });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar para Triagem' }));
    await screen.findByText('Pedido enviado com sucesso!');

    expect(screen.getByLabelText(/Nome Completo/)).toHaveValue('');
    expect(sessionStorage.getItem('raiz-do-bem:contact-form')).toBeNull();
    expect(screen.getByRole('checkbox', { name: /Li e concordo/ })).not.toBeChecked();
  });

  it.each([
    ['feminino', 'F'],
    ['outros', 'O'],
  ])('sexo %s é enviado como %s', async (sexoForm, sexoApi) => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 201, body: { id: 1, status: 'PENDENTE' } }));
    renderForm();

    await preencherBase({ sexo: sexoForm, idade: 10 });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar para Triagem' }));

    await screen.findByText('Pedido enviado com sucesso!');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).sexo).toBe(sexoApi);
  });

  it('homem adulto: mostra a restrição e bloqueia o envio', async () => {
    renderForm();

    await preencherBase({ sexo: 'masculino', idade: 30 });

    expect(screen.getByText('O atendimento para homens é restrito a menores de 18 anos.')).toBeInTheDocument();
    expect(screen.getByText('Canais de Apoio Recomendados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar para Triagem' })).toBeDisabled();
  });

  it('mulher adulta pergunta sobre violência; respondendo "Não" fica bloqueada, "Sim" libera', async () => {
    renderForm();
    await preencherBase({ sexo: 'feminino', idade: 30 });

    const pergunta = screen.getByLabelText(/Você se enquadra neste perfil/);
    await userEvent.selectOptions(pergunta, 'nao');
    expect(screen.getByRole('button', { name: 'Enviar para Triagem' })).toBeDisabled();
    expect(screen.getByText('Canais de Apoio Recomendados')).toBeInTheDocument();
    expect(
      screen.getByText('Para mulheres cis/trans acima de 18 anos, o projeto é exclusivo para vítimas de violência.'),
    ).toBeInTheDocument();

    await userEvent.selectOptions(pergunta, 'sim');
    expect(screen.getByRole('button', { name: 'Enviar para Triagem' })).toBeEnabled();
    expect(screen.queryByText('Canais de Apoio Recomendados')).not.toBeInTheDocument();
    expect(screen.queryByText(/o projeto é exclusivo para vítimas/)).not.toBeInTheDocument();
  });

  it('menina (menor) não vê a pergunta de violência', async () => {
    renderForm();

    await preencherBase({ sexo: 'feminino', idade: 12 });

    expect(screen.queryByLabelText(/Você se enquadra neste perfil/)).not.toBeInTheDocument();
  });

  it('"Buscar Faculdades Próximas de Mim" abre uma nova aba', async () => {
    const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderForm();
    await preencherBase({ sexo: 'masculino', idade: 30 });

    await userEvent.click(screen.getByRole('button', { name: 'Buscar Faculdades Próximas de Mim' }));

    expect(abrir).toHaveBeenCalledWith(expect.stringContaining('google.com/search'), '_blank');
    abrir.mockRestore();
  });

  it('campos obrigatórios e inválidos mostram os erros e não enviam', async () => {
    renderForm();

    await digitar(/Nome Completo/, 'Ana1');
    await digitar(/CPF/, '123');
    await digitar(/Email/, 'invalido');
    await digitar(/Telefone/, '1');
    await digitar(/CEP/, '12');
    await digitar(/Descrição do Problema/, 'curta');
    fireEvent.submit(document.querySelector('form')!);

    expect(await screen.findByText('Nome deve conter apenas letras')).toBeInTheDocument();
    expect(screen.getByText('CPF inválido (use 000.000.000-00)')).toBeInTheDocument();
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
    expect(screen.getByText('Telefone inválido')).toBeInTheDocument();
    expect(screen.getByText('CEP inválido')).toBeInTheDocument();
    expect(await screen.findByText('Mínimo de 20 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Data de nascimento é obrigatória')).toBeInTheDocument();
    expect(screen.getByText('Selecione o sexo')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('erro do back mostra a mensagem e mantém os dados', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 400, body: { mensagem: 'CPF deve conter 11 números.' } }));
    renderForm();

    await preencherBase({ sexo: 'masculino', idade: 10 });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar para Triagem' }));

    expect(await screen.findByText('CPF deve conter 11 números.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome Completo/)).toHaveValue('Maria da Silva');
  });

  it('restaura o rascunho salvo ao abrir a página', () => {
    sessionStorage.setItem('raiz-do-bem:contact-form', JSON.stringify({ nome: 'Rascunho Salvo', email: 'r@x.com' }));

    renderForm();

    expect(screen.getByLabelText(/Nome Completo/)).toHaveValue('Rascunho Salvo');
    expect(screen.getByLabelText(/Email/)).toHaveValue('r@x.com');
  });
});

/* ───────────── Voluntário ───────────── */

describe('Voluntary (cadastro público de dentista)', () => {
  const rotas = (post?: Response) =>
    fetchMock.mockImplementation(async (url, init) => {
      if (url === '/especialidades') return fakeResponse({ status: 200, body: [{ id: 1, descricao: 'Ortodontia' }] });
      if (url.startsWith('https://viacep.com.br')) return fakeResponse({ status: 204 });
      if (init?.method === 'POST') return post ?? fakeResponse({ status: 201, body: {} });
      return fakeResponse({ status: 404 });
    });

  const preencher = async () => {
    await digitar('Nome Completo:', 'Dra Carla Dias');
    await digitar('CPF:', '123.456.789-01');
    await digitar('Email:', 'carla@x.com');
    await digitar('Telefone:', '(11) 98765-4321');
    await userEvent.selectOptions(screen.getByLabelText('Sexo:'), 'F');
    await digitar('CRO:', 'SP-12345');
    await screen.findByRole('option', { name: 'Ortodontia' });
    await userEvent.selectOptions(screen.getByLabelText(/Especialidade/), '1');
    await digitar('CEP:', '01001-000');
    await digitar('Número:', '100');
    await marcar(/Li e concordo/);
  };

  it('a página mostra a chamada e o formulário', () => {
    rotas();
    render(comRouter(<Voluntary />));

    expect(screen.getByRole('heading', { level: 1, name: 'Seja um Dentista Voluntário' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastre-se' })).toHaveAttribute('href', '#form-voluntario');
    expect(screen.getByRole('heading', { name: 'Preencha seus dados profissionais' })).toBeInTheDocument();
  });

  it('cadastra o voluntário SEM autenticação, com categoria CLINICO e disponível', async () => {
    rotas();
    render(comRouter(<VoluntaryForm />));
    await preencher();

    await userEvent.click(screen.getByRole('button', { name: 'Enviar Dados' }));

    expect(await screen.findByText('Cadastro de voluntário realizado com sucesso!')).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!;
    expect(post[0]).toBe('/dentista');
    expect(post[1]?.headers).not.toHaveProperty('Authorization');
    expect(JSON.parse(String(post[1]?.body))).toEqual({
      croDentista: 'SP-12345',
      cpf: '12345678901',
      nomeCompleto: 'Dra Carla Dias',
      sexo: 'F',
      email: 'carla@x.com',
      telefone: '11987654321',
      categoria: 'CLINICO',
      disponivel: 'S',
      idEspecialidade: 1,
      endereco: { cep: '01001000', numero: '100' },
    });
  });

  it('depois de cadastrar, limpa o formulário', async () => {
    rotas();
    render(comRouter(<VoluntaryForm />));
    await preencher();

    await userEvent.click(screen.getByRole('button', { name: 'Enviar Dados' }));
    await screen.findByText('Cadastro de voluntário realizado com sucesso!');

    expect(screen.getByLabelText('Nome Completo:')).toHaveValue('');
  });

  it('erro do back (ex.: especialidade obrigatória) é mostrado', async () => {
    rotas(fakeResponse({ status: 400, body: { mensagem: 'Especialidade é obrigatória.' } }));
    render(comRouter(<VoluntaryForm />));
    await preencher();

    await userEvent.click(screen.getByRole('button', { name: 'Enviar Dados' }));

    expect(await screen.findByText('Especialidade é obrigatória.')).toBeInTheDocument();
  });

  it('sem preencher mostra os erros de validação, inclusive da especialidade', async () => {
    rotas();
    render(comRouter(<VoluntaryForm />));
    await screen.findByRole('option', { name: 'Ortodontia' });

    await userEvent.click(screen.getByRole('button', { name: 'Enviar Dados' }));

    expect((await screen.findAllByText('Campo obrigatório')).length).toBeGreaterThan(3);
    expect(screen.getByText('Selecione uma especialidade', { selector: 'p' })).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0);
  });

  it('valida o formato de e-mail, telefone, CPF, CRO e CEP', async () => {
    rotas();
    render(comRouter(<VoluntaryForm />));

    await digitar('Nome Completo:', 'A1');
    await digitar('CPF:', '1');
    await digitar('Email:', 'x');
    await digitar('Telefone:', '1');
    await digitar('CRO:', '1');
    await digitar('CEP:', '1');
    fireEvent.submit(document.querySelector('form')!);

    expect(await screen.findByText('Nome inválido')).toBeInTheDocument();
    expect(screen.getByText('CPF inválido')).toBeInTheDocument();
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
    expect(screen.getByText('Telefone inválido')).toBeInTheDocument();
    expect(screen.getByText('Formato inválido (ex: SP-12345)')).toBeInTheDocument();
    expect(await screen.findByText('CEP inválido')).toBeInTheDocument();
  });

  it('restaura o rascunho', () => {
    rotas();
    sessionStorage.setItem('raiz-do-bem:voluntary-form', JSON.stringify({ nomeCompleto: 'Rascunho' }));

    render(comRouter(<VoluntaryForm />));

    expect(screen.getByLabelText('Nome Completo:')).toHaveValue('Rascunho');
  });

  it('o link "Voltar Para A Página Inicial" aponta para /', () => {
    rotas();
    render(comRouter(<VoluntaryForm />));
    expect(screen.getByRole('link', { name: 'Voltar Para A Página Inicial' })).toHaveAttribute('href', '/');
  });
});

/* ───────────── Login ───────────── */

describe('Login', () => {
  const renderLogin = (login: AuthContextValue['login'] = async () => {}) =>
    render(
      <AuthContext.Provider value={{ ...noAuth, login }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>,
    );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mostra o formulário administrativo e o link para voltar ao início', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: 'Login Administrativo' })).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('link', { name: 'Voltar ao Início' })).toHaveAttribute('href', '/');
  });

  it('o botão de entrar tem altura automática e conteúdo centralizado', () => {
    renderLogin();

    const botao = screen.getByRole('button', { name: 'Entrar no Sistema' });
    expect(botao).toHaveClass('!h-auto', 'flex', 'items-center', 'justify-center');
  });

  it('o olhinho mostra e oculta a senha', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });

  it('envia e-mail e senha para o login', async () => {
    const login = vi.fn<AuthContextValue['login']>(async () => {});
    renderLogin(login);

    await digitar('E-mail', 'ana@raizdobem.org');
    await digitar('Senha', 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('ana@raizdobem.org', 'Senha@123'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mostra "Validando..." e desabilita o botão durante o login', async () => {
    let concluir: () => void = () => {};
    const login = vi.fn(() => new Promise<void>((res) => (concluir = res)));
    renderLogin(login);
    await digitar('E-mail', 'ana@raizdobem.org');
    await digitar('Senha', 'Senha@123');

    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));
    expect(screen.getByRole('button', { name: 'Validando...' })).toBeDisabled();

    await act(async () => concluir());
    expect(screen.getByRole('button', { name: 'Entrar no Sistema' })).toBeEnabled();
  });

  it('qualquer falha mostra a mensagem genérica de credenciais (sem vazar detalhes)', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const login = vi.fn(async () => {
      throw new Error('Usuário não existe no banco X');
    });
    renderLogin(login);

    await digitar('E-mail', 'ana@raizdobem.org');
    await digitar('Senha', 'errada1');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas. Verifique seu e-mail e senha.');
    expect(screen.queryByText(/banco X/)).not.toBeInTheDocument();
    expect(erro).toHaveBeenCalled(); // em DEV registra no console
  });

  it('o aviso some ao tentar de novo', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const login = vi.fn<AuthContextValue['login']>().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce();
    renderLogin(login);
    await digitar('E-mail', 'ana@raizdobem.org');
    await digitar('Senha', 'errada1');

    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));
    await screen.findByRole('alert');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('validações: e-mail e senha obrigatórios, formato e tamanho mínimo', async () => {
    const login = vi.fn(async () => {});
    renderLogin(login);

    fireEvent.submit(document.querySelector('form')!);
    expect(await screen.findByText('E-mail obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Senha obrigatória')).toBeInTheDocument();

    await digitar('E-mail', 'invalido');
    await digitar('Senha', 'ab');
    fireEvent.submit(document.querySelector('form')!);
    expect(await screen.findByText('Formato de e-mail inválido')).toBeInTheDocument();
    expect(screen.getByText('Senha muito curta')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });
});

/* ───────────── tabela de rotas públicas ───────────── */

describe('routes', () => {
  it('define as 9 rotas públicas com título', () => {
    expect(routes.map((r) => r.path)).toEqual([
      '/', '/sobre', '/integrantes', '/faq', '/contato', '/voluntario',
      '/privacidade', '/consentimento/pedido-de-ajuda', '/consentimento/voluntario',
    ]);
    expect(routes.every((r) => r.title.endsWith('| Raiz do Bem'))).toBe(true);
    expect(routes.every((r) => r.element)).toBe(true);
  });
});
