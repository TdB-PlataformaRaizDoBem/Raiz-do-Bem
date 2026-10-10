import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import Colaborador from '../../pages/admin/Colaborador';
import { Beneficiarios } from '../../pages/gerenciaBeneficiarios/Beneficiarios';
import { Dentistas } from '../../pages/gerenciaDentistas/Dentistas';
import { beneficiarioApi, colaboradorApi, dentistaApi } from '../../test/factories';
import { installFetch, routeFetch, type FetchMock } from '../../test/http';

// Os formulários e os painéis de detalhe têm testes próprios. Aqui interessa o que as PÁGINAS
// fazem quando eles terminam: recarregar a lista e fechar o modal.
vi.mock('../../components/forms/create/CreateBeneficiario', () => ({
  CreateBeneficiario: ({ onSuccess }: { onSuccess: () => void }) => <button onClick={onSuccess}>concluir-cadastro</button>,
}));
vi.mock('../../components/forms/create/CreateDentista', () => ({
  CreateDentista: ({ onSuccess }: { onSuccess: () => void }) => <button onClick={onSuccess}>concluir-cadastro</button>,
}));
vi.mock('../../components/forms/create/CreateCoord', () => ({
  CreateCoord: ({ onSuccess }: { onSuccess: () => void }) => <button onClick={onSuccess}>concluir-cadastro</button>,
}));
vi.mock('../../components/details/BeneficiarioDetails', () => ({
  BeneficiarioDetails: ({ onUpdated }: { onUpdated: () => void }) => <button onClick={onUpdated}>concluir-edicao</button>,
}));
vi.mock('../../components/details/ColaboradorDetails', () => ({
  ColaboradorDetails: ({ onUpdated }: { onUpdated: () => void }) => <button onClick={onUpdated}>concluir-edicao</button>,
}));

let fetchMock: FetchMock;

const admin: AuthContextValue = {
  user: { email: 'u@x.com', nome: 'Usuária', role: 'ADMIN', exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

const renderPagina = (ui: ReactNode) =>
  render(
    <AuthContext.Provider value={admin}>
      <MemoryRouter>
        <NotificationProvider>{ui}</NotificationProvider>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

const chamadasA = (url: string) => fetchMock.mock.calls.filter(([u]) => u === url).length;

beforeEach(() => {
  fetchMock = installFetch();
  localStorage.clear();
});

describe('Beneficiários — cadastro e edição', () => {
  beforeEach(() => {
    const maria = beneficiarioApi({ id: 1, cpf: '11111111111', nomeCompleto: 'Maria Silva' });
    routeFetch(fetchMock, {
      '/beneficiario': [maria],
      '/beneficiario/11111111111': maria,
      '/pedido-ajuda': [],
      '/programas-sociais': [],
    });
  });

  it('cadastro concluído recarrega a lista e fecha o formulário', async () => {
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');
    const antes = chamadasA('/beneficiario');

    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    await userEvent.click(await screen.findByRole('button', { name: 'concluir-cadastro' }));

    await waitFor(() => expect(chamadasA('/beneficiario')).toBeGreaterThan(antes));
    expect(screen.queryByRole('button', { name: 'concluir-cadastro' })).not.toBeInTheDocument();
  });

  it('edição concluída recarrega a lista e o próprio beneficiário', async () => {
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');
    await userEvent.click(screen.getAllByRole('button', { name: 'Visualizar Detalhes' })[0]);
    const dialogo = await screen.findByRole('dialog');
    const lista = chamadasA('/beneficiario');
    const individual = chamadasA('/beneficiario/11111111111');

    await userEvent.click(await within(dialogo).findByRole('button', { name: 'concluir-edicao' }));

    await waitFor(() => expect(chamadasA('/beneficiario')).toBeGreaterThan(lista));
    await waitFor(() => expect(chamadasA('/beneficiario/11111111111')).toBeGreaterThan(individual));
  });
});

describe('Dentistas — cadastro', () => {
  it('cadastro concluído recarrega a lista e fecha o formulário', async () => {
    routeFetch(fetchMock, { '/dentista': [dentistaApi({ id: 1, nomeCompleto: 'Dr. Ana' })], '/programas-sociais': [] });
    renderPagina(<Dentistas />);
    await screen.findByText('Dr. Ana');
    const antes = chamadasA('/dentista');

    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    await userEvent.click(await screen.findByRole('button', { name: 'concluir-cadastro' }));

    await waitFor(() => expect(chamadasA('/dentista')).toBeGreaterThan(antes));
    expect(screen.queryByRole('button', { name: 'concluir-cadastro' })).not.toBeInTheDocument();
  });
});

describe('Colaboradores — cadastro e edição', () => {
  beforeEach(() => {
    routeFetch(fetchMock, { '/colaborador': [colaboradorApi({ id: 1, nomeCompleto: 'Ana Admin', email: 'ana@x.com' })] });
  });

  it('cadastro concluído recarrega a lista e fecha o formulário', async () => {
    renderPagina(<Colaborador />);
    await screen.findByText('Ana Admin');
    const antes = chamadasA('/colaborador');

    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    await userEvent.click(await screen.findByRole('button', { name: 'concluir-cadastro' }));

    await waitFor(() => expect(chamadasA('/colaborador')).toBeGreaterThan(antes));
    expect(screen.queryByRole('button', { name: 'concluir-cadastro' })).not.toBeInTheDocument();
  });

  it('edição concluída recarrega a lista', async () => {
    renderPagina(<Colaborador />);
    await screen.findByText('Ana Admin');
    await userEvent.click(screen.getByRole('button', { name: 'Visualizar Perfil' }));
    const dialogo = await screen.findByRole('dialog');
    const antes = chamadasA('/colaborador');

    await userEvent.click(await within(dialogo).findByRole('button', { name: 'concluir-edicao' }));

    await waitFor(() => expect(chamadasA('/colaborador')).toBeGreaterThan(antes));
  });
});

describe('Beneficiários — modal e filtros', () => {
  beforeEach(() => {
    routeFetch(fetchMock, {
      '/beneficiario': [beneficiarioApi({ id: 1, cpf: '11111111111', nomeCompleto: 'Maria Silva', programaSocial: 'TURMA_DO_BEM' as never })],
      '/pedido-ajuda': [],
      '/programas-sociais': [],
    });
  });

  it('clicar no fundo escuro fecha o formulário de cadastro', async () => {
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    const conteudo = (await screen.findByRole('button', { name: 'concluir-cadastro' })).parentElement!;

    await userEvent.click(conteudo.parentElement!);

    expect(screen.queryByRole('button', { name: 'concluir-cadastro' })).not.toBeInTheDocument();
  });

  it('um filtro de programa sem correspondência mostra "nenhum resultado" e dá como limpar', async () => {
    renderPagina(<Beneficiarios />);
    await screen.findByText('Maria Silva');

    await userEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    await userEvent.selectOptions(await screen.findByRole('combobox'), 'Apolonia do Bem');

    expect(await screen.findByText('Nenhum resultado encontrado')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros e busca' }));

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
  });
});
