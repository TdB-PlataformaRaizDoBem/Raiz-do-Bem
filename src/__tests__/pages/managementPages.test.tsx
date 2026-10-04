import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import Admin from '../../pages/admin/Admin';
import Colaborador from '../../pages/admin/Colaborador';
import Coord from '../../pages/coord/Coord';
import Dashboard from '../../pages/dashboard/Dashboard';
import Forbidden from '../../pages/forbidden/Forbidden';
import { Beneficiarios } from '../../pages/gerenciaBeneficiarios/Beneficiarios';
import { Dentistas } from '../../pages/gerenciaDentistas/Dentistas';
import Reports from '../../pages/reports/Reports';
import { beneficiarioApi, colaboradorApi, dentistaApi, pedidoApi } from '../../test/factories';
import { fakeResponse, installFetch, routeFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;

const auth = (role: 'ADMIN' | 'COLABORADOR'): AuthContextValue => ({
  user: { email: 'u@x.com', nome: 'Usuária', role, exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
});

function renderPagina(ui: ReactNode, role: 'ADMIN' | 'COLABORADOR' = 'ADMIN', rota = '/pagina') {
  window.history.pushState({}, '', rota);
  return render(
    <AuthContext.Provider value={auth(role)}>
      <MemoryRouter initialEntries={[rota]}>
        <NotificationProvider>{ui}</NotificationProvider>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  fetchMock = installFetch();
  localStorage.clear();
});

/* ───────────── Beneficiários ───────────── */

describe('página Beneficiários', () => {
  const lista = [
    beneficiarioApi({ id: 1, cpf: '11111111111', nomeCompleto: 'Maria Silva' }),
    beneficiarioApi({ id: 2, cpf: '22222222222', nomeCompleto: 'José Souza', endereco: null, programaSocial: 'APOLONIA_DO_BEM' }),
  ];

  beforeEach(() => {
    routeFetch(fetchMock, {
      '/beneficiario': lista,
      '/beneficiario/11111111111': lista[0],
      '/pedido-ajuda': [],
      '/programas-sociais': [],
    });
  });

  it('mostra o carregamento e depois os cards com programa e cidade', async () => {
    renderPagina(<Beneficiarios />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('José Souza')).toBeInTheDocument();
    expect(screen.getByText('São Paulo • SP')).toBeInTheDocument();
    expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0); // sem endereço
    expect(screen.getByText('ID: #2')).toBeInTheDocument();
  });

  it('erro de carregamento mostra a mensagem', async () => {
    routeFetch(fetchMock, { '/beneficiario': fakeResponse({ status: 500, body: { mensagem: 'Banco fora do ar' } }) });

    renderPagina(<Beneficiarios />);

    expect(await screen.findByText('Banco fora do ar')).toBeInTheDocument();
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
  });

  it('somente ADMIN vê o botão de exportar CSV', async () => {
    const { unmount } = renderPagina(<Beneficiarios />, 'ADMIN');
    await screen.findByText('Maria Silva');
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeInTheDocument();
    unmount();

    renderPagina(<Beneficiarios />, 'COLABORADOR');
    await screen.findByText('Maria Silva');
    expect(screen.queryByRole('button', { name: 'Exportar CSV' })).not.toBeInTheDocument();
  });

  it('"Visualizar Detalhes" busca o beneficiário por CPF e abre o painel', async () => {
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');

    await userEvent.click(screen.getAllByRole('button', { name: 'Visualizar Detalhes' })[0]);

    const dialogo = await screen.findByRole('dialog');
    expect(await within(dialogo).findByRole('heading', { name: 'Maria Silva' })).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([u]) => u === '/beneficiario/11111111111')).toBe(true);
    expect(within(dialogo).getByRole('button', { name: 'Deletar' })).toBeInTheDocument(); // admin
  });

  it('o painel de detalhes mostra erro quando a busca falha', async () => {
    routeFetch(fetchMock, {
      '/beneficiario': lista,
      '/beneficiario/11111111111': fakeResponse({ status: 500, body: { mensagem: 'Falha ao abrir' } }),
    });
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');

    await userEvent.click(screen.getAllByRole('button', { name: 'Visualizar Detalhes' })[0]);

    expect(await within(await screen.findByRole('dialog')).findByText('Falha ao abrir')).toBeInTheDocument();
  });

  it('na visão de tabela, o botão "Detalhes" abre o painel sem duplicar o clique da linha', async () => {
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');

    await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('São Paulo · SP')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: 'Detalhes' })[0]);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('"Criar Conta" abre o formulário de novo beneficiário', async () => {
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');

    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

    expect(await screen.findByText('Novo Beneficiário')).toBeInTheDocument();
  });

  it('a busca filtra por nome ou cidade', async () => {
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');

    await userEvent.type(screen.getByLabelText(/Pesquisar/), 'jose');

    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument();
    expect(screen.getByText('José Souza')).toBeInTheDocument();
  });
});

/* ───────────── Dentistas ───────────── */

describe('página Dentistas', () => {
  const lista = [
    dentistaApi({ id: 1, cpf: '11111111111', nomeCompleto: 'Dr. Ana', especialidades: ['Ortodontia', 'Implante'] }),
    dentistaApi({ id: 2, cpf: '22222222222', nomeCompleto: 'Dr. Beto', especialidades: [], programasSociais: [], categoria: null }),
  ];

  beforeEach(() => {
    routeFetch(fetchMock, { '/dentista': lista, '/especialidades': [{ id: 1, descricao: 'Ortodontia' }] });
  });

  it('lista os dentistas com CRO, especialidades e programa', async () => {
    renderPagina(<Dentistas />);

    expect(await screen.findByText('Dr. Ana')).toBeInTheDocument();
    expect(screen.getByText('Ortodontia, Implante')).toBeInTheDocument();
    expect(screen.getByText('Dentista Do Bem')).toBeInTheDocument();
    expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0); // Dr. Beto sem especialidade
  });

  it('erro de carregamento', async () => {
    routeFetch(fetchMock, { '/dentista': fakeResponse({ status: 500, body: { mensagem: 'Sem banco' } }) });

    renderPagina(<Dentistas />);

    expect(await screen.findByText('Sem banco')).toBeInTheDocument();
  });

  it('exportar CSV só para ADMIN', async () => {
    const { unmount } = renderPagina(<Dentistas />, 'ADMIN');
    await screen.findByText('Dr. Ana');
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeInTheDocument();
    unmount();

    renderPagina(<Dentistas />, 'COLABORADOR');
    await screen.findByText('Dr. Ana');
    expect(screen.queryByRole('button', { name: 'Exportar CSV' })).not.toBeInTheDocument();
  });

  it('"Visualizar Perfil" abre os detalhes do dentista', async () => {
    renderPagina(<Dentistas />);
    await screen.findByText('Dr. Ana');

    await userEvent.click(screen.getAllByRole('button', { name: 'Visualizar Perfil' })[0]);

    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByRole('heading', { name: 'Dr. Ana' })).toBeInTheDocument();
  });

  it('visão de tabela: especialidades, programa e botão "Ver Perfil"', async () => {
    renderPagina(<Dentistas />);
    await screen.findByText('Dr. Ana');

    await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByText('CRO-SP 12345', { selector: 'td' })).toHaveLength(2);
    await userEvent.click(screen.getAllByRole('button', { name: 'Ver Perfil' })[1]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('"Criar Conta" abre o cadastro de dentista', async () => {
    renderPagina(<Dentistas />);
    await screen.findByText('Dr. Ana');

    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

    expect(await screen.findByText('Cadastrar Dentista')).toBeInTheDocument();
  });
});

/* ───────────── Colaboradores ───────────── */

describe('página Colaboradores', () => {
  const lista = [
    colaboradorApi({ id: 1, nomeCompleto: 'Ana Admin', email: 'ana@x.com' }),
    colaboradorApi({ id: 2, nomeCompleto: 'Bia Coord', email: 'bia@x.com', cpf: '22222222222' }),
  ];

  beforeEach(() => {
    routeFetch(fetchMock, { '/colaborador': lista });
  });

  it('lista os colaboradores com e-mail e id', async () => {
    renderPagina(<Colaborador />);

    expect(await screen.findByText('Ana Admin')).toBeInTheDocument();
    expect(screen.getByText('bia@x.com')).toBeInTheDocument();
    expect(screen.getByText('ID: #2')).toBeInTheDocument();
  });

  it('erro de carregamento', async () => {
    routeFetch(fetchMock, { '/colaborador': fakeResponse({ status: 403, body: { mensagem: 'Sem permissão' } }) });

    renderPagina(<Colaborador />);

    expect(await screen.findByText('Sem permissão')).toBeInTheDocument();
  });

  it('"Visualizar Perfil" abre os detalhes do colaborador', async () => {
    renderPagina(<Colaborador />);
    await screen.findByText('Ana Admin');

    await userEvent.click(screen.getAllByRole('button', { name: 'Visualizar Perfil' })[1]);

    const dialogo = await screen.findByRole('dialog');
    expect(await within(dialogo).findByRole('heading', { name: 'Bia Coord' })).toBeInTheDocument();
  });

  it('visão de tabela com data de contratação', async () => {
    renderPagina(<Colaborador />);
    await screen.findByText('Ana Admin');

    await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));

    expect(screen.getAllByText('01/02/2020').length).toBe(2);
    await userEvent.click(screen.getAllByRole('button', { name: 'Ver Perfil' })[0]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('"Criar Conta" abre o formulário de novo colaborador', async () => {
    renderPagina(<Colaborador />);
    await screen.findByText('Ana Admin');

    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

    expect(await screen.findByText('Novo Colaborador')).toBeInTheDocument();
  });
});

/* ───────────── Dashboard / Reports ───────────── */

describe('Dashboard e Reports', () => {
  beforeEach(() => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [pedidoApi({ id: 1, status: 'PENDENTE' }), pedidoApi({ id: 2, status: 'APROVADO' })],
      '/beneficiario': [beneficiarioApi({ id: 1 }), beneficiarioApi({ id: 2, programaSocial: 'APOLONIAS_DO_BEM' })],
      '/dentista': [dentistaApi({ id: 1, disponivel: 'S' }), dentistaApi({ id: 2, disponivel: 'N' })],
    });
  });

  it('Dashboard: cartões de resumo, gráficos e pedidos críticos', async () => {
    renderPagina(<Dashboard />);

    expect(screen.getByText('Resumo de Impacto')).toBeInTheDocument();
    expect(screen.getByText('Gráficos de Desempenho')).toBeInTheDocument();
    expect(screen.getByText('Pedidos Críticos')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('26h')).toBeInTheDocument()); // 1×6 + 1×20
    expect(screen.getByText('Total Beneficiários')).toBeInTheDocument();
    expect(screen.getByText('Ranking por Estado')).toBeInTheDocument();
    expect(screen.getByText('Pedidos de Ajuda sem resposta há mais tempo')).toBeInTheDocument();
  });

  it('Reports: mesmos indicadores num layout de relatório', async () => {
    renderPagina(<Reports />);

    await waitFor(() => expect(screen.getByText('26h')).toBeInTheDocument());
    expect(screen.getByText('Proporção de Beneficiários')).toBeInTheDocument();
    expect(screen.getByText('Status dos Pedidos')).toBeInTheDocument();
    expect(screen.getByText('Dentistas Disponíveis')).toBeInTheDocument();
  });
});

/* ───────────── Forbidden ───────────── */

describe('Forbidden (403)', () => {
  const renderForbidden = (role: 'ADMIN' | 'COLABORADOR') =>
    render(
      <AuthContext.Provider value={auth(role)}>
        <MemoryRouter initialEntries={['/403']}>
          <Routes>
            <Route path="/403" element={<Forbidden />} />
            <Route path="/admin/dashboard" element={<p>painel admin</p>} />
            <Route path="/coord/dashboard" element={<p>painel coord</p>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

  it('explica o acesso negado', () => {
    renderForbidden('ADMIN');

    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Acesso Negado' })).toBeInTheDocument();
  });

  it.each([
    ['ADMIN', 'painel admin'],
    ['COLABORADOR', 'painel coord'],
  ] as const)('%s volta ao seu próprio dashboard', async (role, destino) => {
    renderForbidden(role);

    await userEvent.click(screen.getByRole('button', { name: 'Voltar ao Dashboard' }));

    expect(screen.getByText(destino)).toBeInTheDocument();
  });
});

/* ───────────── rotas de Admin e Coord ───────────── */

describe('rotas internas', () => {
  const renderRotas = (prefixo: 'admin' | 'coord', caminho: string, role: 'ADMIN' | 'COLABORADOR') => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [],
      '/beneficiario': [],
      '/dentista': [],
      '/colaborador': [colaboradorApi()],
      '/atendimento': [],
    });
    const Pagina = prefixo === 'admin' ? Admin : Coord;
    return renderPagina(
      <Suspense fallback={<p>carregando rota</p>}>
        <Routes>
          <Route path={`/${prefixo}/*`} element={<Pagina />} />
        </Routes>
      </Suspense>,
      role,
      `/${prefixo}/${caminho}`,
    );
  };

  it.each([
    ['dashboard', 'Resumo de Impacto'],
    ['colaboradores', 'Ana Admin'],
    ['beneficiarios', 'Nenhum registro encontrado.'],
    ['dentistas', 'Nenhum registro encontrado.'],
  ])('admin/%s renderiza a página certa', async (caminho, texto) => {
    renderRotas('admin', caminho, 'ADMIN');

    expect(await screen.findByText(texto)).toBeInTheDocument();
  });

  it.each([
    ['dashboard', 'Resumo de Impacto'],
    ['beneficiarios', 'Nenhum registro encontrado.'],
    ['dentistas', 'Nenhum registro encontrado.'],
  ])('coord/%s renderiza a página certa', async (caminho, texto) => {
    renderRotas('coord', caminho, 'COLABORADOR');

    expect(await screen.findByText(texto)).toBeInTheDocument();
  });

  it('coordenador não tem a rota de colaboradores', () => {
    renderRotas('coord', 'colaboradores', 'COLABORADOR');

    expect(screen.queryByText('Ana Admin')).not.toBeInTheDocument();
  });
});
