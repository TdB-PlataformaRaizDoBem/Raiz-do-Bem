import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { Designacao } from '../../pages/designacao/Designacao';
import { PedidosAjuda } from '../../pages/pedidosAjuda/pedidosAjuda';
import {
  atendimentoApi,
  beneficiarioApi,
  colaboradorApi,
  dentistaApi,
  pedidoApi,
} from '../../test/factories';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;

const auth = (role: 'ADMIN' | 'COLABORADOR'): AuthContextValue => ({
  user: { email: 'u@x.com', nome: 'Usuária', role, exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
});

function renderPagina(ui: ReactNode, role: 'ADMIN' | 'COLABORADOR' = 'ADMIN') {
  window.history.pushState({}, '', '/admin/pagina');
  return render(
    <AuthContext.Provider value={auth(role)}>
      <MemoryRouter initialEntries={['/admin/pagina']}>
        <NotificationProvider>{ui}</NotificationProvider>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const ok = (body?: unknown, status = 200) => fakeResponse({ status, body });
const chamadas = (metodo: string) => fetchMock.mock.calls.filter(([, init]) => init?.method === metodo);
/** Corpo da primeira chamada com o método (a última chamada costuma ser o refetch da lista). */
const corpoDe = (metodo: string) => JSON.parse(String(chamadas(metodo)[0][1]?.body));

beforeEach(() => {
  fetchMock = installFetch();
  localStorage.clear();
});

/* ───────────── Pedidos de Ajuda ───────────── */

describe('página Pedidos de Ajuda', () => {
  const pedidos = [
    pedidoApi({ id: 1, nomeCompleto: 'Maria Pendente', status: 'PENDENTE', descricaoProblema: 'Dor forte' }),
    pedidoApi({ id: 2, nomeCompleto: 'João Aprovado', status: 'APROVADO' }),
    pedidoApi({ id: 3, nomeCompleto: 'Ana Negada', status: 'REJEITADO' }),
  ];

  const rotas = (extras: (url: string, init?: RequestInit) => Response | undefined = () => undefined) =>
    fetchMock.mockImplementation(async (url, init) => {
      const custom = extras(url, init);
      if (custom) return custom;
      if (url === '/pedido-ajuda' && !init?.method) return ok(pedidos);
      if (url === '/dentista') {
        return ok([
          dentistaApi({ id: 10, nomeCompleto: 'Dra. Coordenadora', categoria: 'COORDENADOR' }),
          dentistaApi({ id: 11, nomeCompleto: 'Dr. Clínico', categoria: 'CLINICO' }),
        ]);
      }
      if (init?.method === 'PUT') return fakeResponse({ status: 204 });
      return fakeResponse({ status: 404 });
    });

  const abrirPedido = async (nome: string) => {
    await screen.findByText(nome);
    const card = screen.getByText(nome).closest('div.bg-white')!;
    await userEvent.click(within(card as HTMLElement).getByRole('button', { name: 'Analisar Pedido' }));
    return screen.findByRole('dialog');
  };

  it('lista os pedidos com status e descrição', async () => {
    rotas();
    renderPagina(<PedidosAjuda />);

    expect(await screen.findByText('Maria Pendente')).toBeInTheDocument();
    expect(screen.getByText('João Aprovado')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Aprovado')).toBeInTheDocument();
    expect(screen.getByText('Negado')).toBeInTheDocument();
    expect(screen.getByText('Protocolo: #1')).toBeInTheDocument();
  });

  it('erro ao carregar', async () => {
    rotas((url) => (url === '/pedido-ajuda' ? fakeResponse({ status: 500, body: { mensagem: 'Falha geral' } }) : undefined));
    renderPagina(<PedidosAjuda />);

    expect(await screen.findByText('Falha geral')).toBeInTheDocument();
  });

  it('"Analisar Pedido" abre os detalhes; só pedidos pendentes têm Aprovar/Suspender', async () => {
    rotas();
    renderPagina(<PedidosAjuda />);

    const dialogo = await abrirPedido('Maria Pendente');

    expect(within(dialogo).getByRole('button', { name: 'Aprovar' })).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Suspender' })).toBeInTheDocument();
  });

  it('aprovar: exige escolher um dentista responsável', async () => {
    rotas();
    renderPagina(<PedidosAjuda />);
    const dialogo = await abrirPedido('Maria Pendente');

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Aprovar' }));
    expect(await screen.findByText('Confirmar Aprovação')).toBeInTheDocument();
    expect(screen.getByText('Aprovar o protocolo #1?')).toBeInTheDocument();
    await screen.findByRole('option', { name: /Dra. Coordenadora/ });

    const botoes = screen.getAllByRole('button', { name: 'Aprovar' });
    await userEvent.click(botoes[botoes.length - 1]);

    expect(await screen.findByText('Erro ao executar ação.')).toBeInTheDocument();
    expect(chamadas('PUT')).toHaveLength(0);
  });

  it('aprovar com dentista: faz PUT com APROVADO e o id do dentista', async () => {
    rotas();
    renderPagina(<PedidosAjuda />);
    const dialogo = await abrirPedido('Maria Pendente');

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Aprovar' }));
    await screen.findByRole('option', { name: /Dra. Coordenadora/ });
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[selects.length - 1], '10');
    const botoes = screen.getAllByRole('button', { name: 'Aprovar' });
    await userEvent.click(botoes[botoes.length - 1]);

    expect(await screen.findByText('Pedido aprovado com sucesso.')).toBeInTheDocument();
    const put = chamadas('PUT')[0];
    expect(put[0]).toBe('/pedido-ajuda/1');
    expect(corpoDe('PUT')).toEqual({ statusPedido: 'APROVADO', idDentista: 10 });
  });

  it('suspender com dentista: faz PUT com REJEITADO', async () => {
    rotas();
    renderPagina(<PedidosAjuda />);
    const dialogo = await abrirPedido('Maria Pendente');

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Suspender' }));
    expect(await screen.findByText('Confirmar Suspensão')).toBeInTheDocument();
    await screen.findByRole('option', { name: /Dra. Coordenadora/ });
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[selects.length - 1], '10');
    const botoes = screen.getAllByRole('button', { name: 'Suspender' });
    await userEvent.click(botoes[botoes.length - 1]);

    expect(await screen.findByText('Pedido suspenso.')).toBeInTheDocument();
    expect(corpoDe('PUT')).toEqual({ statusPedido: 'REJEITADO', idDentista: 10 });
  });

  it('suspender sem dentista também é bloqueado', async () => {
    rotas();
    renderPagina(<PedidosAjuda />);
    const dialogo = await abrirPedido('Maria Pendente');

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Suspender' }));
    await screen.findByText('Confirmar Suspensão');
    const botoes = screen.getAllByRole('button', { name: 'Suspender' });
    await userEvent.click(botoes[botoes.length - 1]);

    expect(await screen.findByText('Erro ao executar ação.')).toBeInTheDocument();
    expect(chamadas('PUT')).toHaveLength(0);
  });

  it('erro do back ao aprovar mostra erro genérico', async () => {
    rotas((_url, init) => (init?.method === 'PUT' ? fakeResponse({ status: 409, body: { mensagem: 'x' } }) : undefined));
    renderPagina(<PedidosAjuda />);
    const dialogo = await abrirPedido('Maria Pendente');

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Aprovar' }));
    await screen.findByRole('option', { name: /Dra. Coordenadora/ });
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[selects.length - 1], '10');
    const botoes = screen.getAllByRole('button', { name: 'Aprovar' });
    await userEvent.click(botoes[botoes.length - 1]);

    expect(await screen.findByText('Erro ao executar ação.')).toBeInTheDocument();
  });

  it('Cancelar fecha a confirmação sem chamar o back', async () => {
    rotas();
    renderPagina(<PedidosAjuda />);
    const dialogo = await abrirPedido('Maria Pendente');

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Aprovar' }));
    await screen.findByText('Confirmar Aprovação');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Confirmar Aprovação')).not.toBeInTheDocument();
    expect(chamadas('PUT')).toHaveLength(0);
  });

  it('visão de tabela com o botão "Analisar"', async () => {
    rotas();
    renderPagina(<PedidosAjuda />);
    await screen.findByText('Maria Pendente');

    await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));

    expect(screen.getByRole('table')).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'Analisar' })[0]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});

/* ───────────── Designação / Atendimento ───────────── */

describe('página Designação (Atendimento)', () => {
  const beneficiarios = [
    beneficiarioApi({ id: 1, cpf: '11111111111', nomeCompleto: 'Maria Pendente' }),
    beneficiarioApi({ id: 2, cpf: '22222222222', nomeCompleto: 'José Atendido', endereco: null }),
    beneficiarioApi({ id: 3, cpf: '33333333333', nomeCompleto: 'Ana Concluída' }),
  ];
  const atendimentos = [
    atendimentoApi({ id: 10, beneficiario: 'José Atendido', dentista: 'Dr. João', prontuario: 'Em tratamento', dataFim: 'NÃO FINALIZADO' }),
    atendimentoApi({ id: 11, beneficiario: 'Ana Concluída', dentista: 'Dra. Bia', prontuario: 'Tratada', dataFim: '2026-04-01' }),
  ];

  const rotas = (extras: (url: string, init?: RequestInit) => Response | undefined = () => undefined) =>
    fetchMock.mockImplementation(async (url, init) => {
      const custom = extras(url, init);
      if (custom) return custom;
      if (url === '/beneficiario') return ok(beneficiarios);
      if (url === '/atendimento' && !init?.method) return ok(atendimentos);
      if (url === '/colaborador') return ok([colaboradorApi({ id: 5, email: 'u@x.com' })]);
      if (url === '/atendimento' && init?.method === 'POST') return ok(atendimentoApi(), 201);
      if (init?.method === 'PUT') return fakeResponse({ status: 204 });
      return fakeResponse({ status: 404 });
    });

  const abaPendentes = () => screen.getByRole('button', { name: 'Pendentes' });

  it('abre na aba "Pendentes" com os beneficiários sem atendimento', async () => {
    rotas();
    renderPagina(<Designacao />);

    expect(await screen.findByText('Maria Pendente')).toBeInTheDocument();
    expect(screen.queryByText('José Atendido')).not.toBeInTheDocument();
    expect(screen.queryByText('Ana Concluída')).not.toBeInTheDocument();
    expect(abaPendentes()).toHaveClass('bg-darkgreen');
    ['Em atendimento', 'Concluídos', 'Todos'].forEach((aba) => expect(screen.getByRole('button', { name: aba })).toBeInTheDocument());
  });

  describe('designar dentista (aba Pendentes)', () => {
    const abrir = async () => {
      await screen.findByText('Maria Pendente');
      await userEvent.click(screen.getByRole('button', { name: 'Designar Dentista' }));
      return screen.findByRole('dialog');
    };

    it('abre os detalhes, pede o prontuário e confirma a designação', async () => {
      rotas();
      renderPagina(<Designacao />);
      const dialogo = await abrir();

      await userEvent.type(within(dialogo).getByLabelText('Prontuário inicial'), 'Dor no molar');
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Designar dentista' }));

      expect(await screen.findByText('Confirmar Designação')).toBeInTheDocument();
      expect(screen.getByText('"Dor no molar"')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Confirmar designação' }));

      expect(await screen.findByText(/Designação criada com sucesso para Maria Pendente/)).toBeInTheDocument();
      const post = chamadas('POST')[0];
      expect(post[0]).toBe('/atendimento');
      expect(corpoDe('POST')).toEqual({ prontuario: 'Dor no molar', cpfBeneficiario: '11111111111' });
    });

    it('erro do back ao designar vira notificação', async () => {
      rotas((url, init) =>
        url === '/atendimento' && init?.method === 'POST' ? fakeResponse({ status: 422, body: { mensagem: 'Sem dentista disponível.' } }) : undefined,
      );
      renderPagina(<Designacao />);
      const dialogo = await abrir();

      await userEvent.type(within(dialogo).getByLabelText('Prontuário inicial'), 'Dor');
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Designar dentista' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Confirmar designação' }));

      expect(await screen.findByText('Sem dentista disponível.')).toBeInTheDocument();
    });

    it('Cancelar fecha a confirmação sem criar nada', async () => {
      rotas();
      renderPagina(<Designacao />);
      const dialogo = await abrir();

      await userEvent.type(within(dialogo).getByLabelText('Prontuário inicial'), 'Dor');
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Designar dentista' }));
      await screen.findByText('Confirmar Designação');
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByText('Confirmar Designação')).not.toBeInTheDocument();
      expect(chamadas('POST')).toHaveLength(0);
    });

    it('visão de tabela com o botão "Designar"', async () => {
      rotas();
      renderPagina(<Designacao />);
      await screen.findByText('Maria Pendente');

      await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));
      await userEvent.click(screen.getByRole('button', { name: 'Designar' }));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('erro ao carregar os beneficiários', async () => {
      rotas((url) => (url === '/beneficiario' ? fakeResponse({ status: 500, body: { mensagem: 'Falha nos beneficiários' } }) : undefined));
      renderPagina(<Designacao />);

      expect(await screen.findByText('Falha nos beneficiários')).toBeInTheDocument();
    });
  });

  describe('abas de atendimentos', () => {
    it.each([
      ['Em atendimento', ['José Atendido'], ['Ana Concluída']],
      ['Concluídos', ['Ana Concluída'], ['José Atendido']],
      ['Todos', ['José Atendido', 'Ana Concluída'], []],
    ])('aba "%s"', async (aba, presentes, ausentes) => {
      rotas();
      renderPagina(<Designacao />);
      await screen.findByText('Maria Pendente');

      await userEvent.click(screen.getByRole('button', { name: aba }));

      for (const nome of presentes) expect(await screen.findByText(nome)).toBeInTheDocument();
      for (const nome of ausentes) expect(screen.queryByText(nome)).not.toBeInTheDocument();
    });

    it('mostra o status do atendimento no cartão', async () => {
      rotas();
      renderPagina(<Designacao />);
      await userEvent.click(await screen.findByRole('button', { name: 'Todos' }));

      expect(await screen.findByText('Iniciado em 09/03/2026')).toBeInTheDocument();
      expect(screen.getByText('Concluído em 01/04/2026')).toBeInTheDocument();
    });

    it('exportar CSV só para ADMIN', async () => {
      rotas();
      const { unmount } = renderPagina(<Designacao />, 'ADMIN');
      await userEvent.click(await screen.findByRole('button', { name: 'Todos' }));
      expect(await screen.findByRole('button', { name: 'Exportar CSV' })).toBeInTheDocument();
      unmount();

      renderPagina(<Designacao />, 'COLABORADOR');
      await userEvent.click(await screen.findByRole('button', { name: 'Todos' }));
      await screen.findByText('José Atendido');
      expect(screen.queryByRole('button', { name: 'Exportar CSV' })).not.toBeInTheDocument();
    });

    it('visão de tabela mostra o status', async () => {
      rotas();
      renderPagina(<Designacao />);
      await userEvent.click(await screen.findByRole('button', { name: 'Todos' }));
      await screen.findByText('José Atendido');

      await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));

      expect(screen.getByText('Em andamento')).toBeInTheDocument();
      expect(screen.getByText('Concluído 01/04/2026')).toBeInTheDocument();
      await userEvent.click(screen.getAllByRole('button', { name: 'Ver detalhes' })[0]);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('erro ao carregar os atendimentos', async () => {
      rotas((url, init) =>
        url === '/atendimento' && !init?.method ? fakeResponse({ status: 500, body: { mensagem: 'Atendimentos fora do ar' } }) : undefined,
      );
      renderPagina(<Designacao />);
      await userEvent.click(await screen.findByRole('button', { name: 'Em atendimento' }));

      expect(await screen.findByText('Atendimentos fora do ar')).toBeInTheDocument();
    });
  });

  describe('encerrar atendimento', () => {
    const abrirEmAndamento = async () => {
      await userEvent.click(await screen.findByRole('button', { name: 'Em atendimento' }));
      await screen.findByText('José Atendido');
      await userEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }));
      const dialogo = await screen.findByRole('dialog');
      await waitFor(() => expect(within(dialogo).getByLabelText('Colaborador responsável')).toHaveValue(5));
      return dialogo;
    };

    it('encerra: confirma, localiza o CPF pelo nome e faz PUT com prontuário e colaborador', async () => {
      rotas();
      renderPagina(<Designacao />);
      const dialogo = await abrirEmAndamento();

      await userEvent.clear(within(dialogo).getByLabelText('Prontuário de encerramento'));
      await userEvent.type(within(dialogo).getByLabelText('Prontuário de encerramento'), 'Alta');
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Encerrar atendimento' }));

      expect(await screen.findByText('Confirmar Encerramento')).toBeInTheDocument();
      expect(screen.getByText('"Alta"')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

      expect(await screen.findByText('Atendimento de José Atendido encerrado com sucesso.')).toBeInTheDocument();
      const put = chamadas('PUT')[0];
      expect(put[0]).toBe('/atendimento/22222222222');
      expect(corpoDe('PUT')).toEqual({ prontuario: 'Alta', idColaborador: 5 });
    });

    it('beneficiário não encontrado: avisa e não chama o back', async () => {
      rotas((url) => (url === '/beneficiario' ? ok([beneficiarioApi({ id: 1, nomeCompleto: 'Outra Pessoa' })]) : undefined));
      renderPagina(<Designacao />);
      const dialogo = await abrirEmAndamento();

      await userEvent.click(within(dialogo).getByRole('button', { name: 'Encerrar atendimento' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));

      expect(await screen.findByText(/Não foi possível localizar o beneficiário "José Atendido"/)).toBeInTheDocument();
      expect(chamadas('PUT')).toHaveLength(0);
    });

    it('erro do back ao encerrar vira notificação', async () => {
      rotas((_url, init) => (init?.method === 'PUT' ? fakeResponse({ status: 422, body: { mensagem: 'Prontuário inválido.' } }) : undefined));
      renderPagina(<Designacao />);
      const dialogo = await abrirEmAndamento();

      await userEvent.click(within(dialogo).getByRole('button', { name: 'Encerrar atendimento' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));

      expect(await screen.findByText('Prontuário inválido.')).toBeInTheDocument();
    });

    it('Cancelar fecha a confirmação', async () => {
      rotas();
      renderPagina(<Designacao />);
      const dialogo = await abrirEmAndamento();

      await userEvent.click(within(dialogo).getByRole('button', { name: 'Encerrar atendimento' }));
      await screen.findByText('Confirmar Encerramento');
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByText('Confirmar Encerramento')).not.toBeInTheDocument();
    });

    it('atendimento concluído: abre em leitura e permite atualizar o prontuário', async () => {
      rotas();
      renderPagina(<Designacao />);
      await userEvent.click(await screen.findByRole('button', { name: 'Concluídos' }));
      await screen.findByText('Ana Concluída');
      await userEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }));
      const dialogo = await screen.findByRole('dialog');

      expect(within(dialogo).queryByLabelText(/Prontuário/)).not.toBeInTheDocument();
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Atualizar atendimento' }));
      await waitFor(() => expect(within(dialogo).getByLabelText('Colaborador responsável')).toHaveValue(5));
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Salvar alterações' }));

      expect(await screen.findByText('Confirmar Atualização')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

      expect(await screen.findByText('Atendimento de Ana Concluída atualizado com sucesso.')).toBeInTheDocument();
      expect(chamadas('PUT')[0][0]).toBe('/atendimento/33333333333');
    });
  });
});
