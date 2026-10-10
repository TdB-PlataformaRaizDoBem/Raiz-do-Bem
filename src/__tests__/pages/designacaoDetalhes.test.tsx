import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { Designacao } from '../../pages/designacao/Designacao';
import { criarAtendimento, encerrarAtendimento } from '../../services/AtendimentoService';
import { atendimentoApi, beneficiarioApi, colaboradorApi } from '../../test/factories';
import { fakeResponse, installFetch } from '../../test/http';

// A criação e o encerramento são controlados aqui: rejeições que não vêm como `Error` e
// operações "penduradas" (para testar o botão Cancelar durante o salvamento) não saem do fetch.
vi.mock('../../services/AtendimentoService', async () => ({
  ...(await vi.importActual<object>('../../services/AtendimentoService')),
  criarAtendimento: vi.fn(),
  encerrarAtendimento: vi.fn(),
}));

const auth: AuthContextValue = {
  user: { email: 'u@x.com', nome: 'Usuária', role: 'ADMIN', exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

const ok = (body?: unknown) => fakeResponse({ status: 200, body });

function adiado<T = void>() {
  let resolver!: (v: T) => void;
  const promessa = new Promise<T>((r) => {
    resolver = r;
  });
  return { promessa, resolver };
}

/** O fundo escuro do modal que contém o texto: clicar nele aciona o onClose do modal. */
const fundoDe = (texto: string) => screen.getByText(texto).closest('div.fixed') as HTMLElement;

function renderPagina() {
  window.history.pushState({}, '', '/admin/pagina');
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/admin/pagina']}>
        <NotificationProvider>
          <Designacao />
        </NotificationProvider>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(criarAtendimento).mockReset();
  vi.mocked(encerrarAtendimento).mockReset();
  const fetchMock = installFetch();
  fetchMock.mockImplementation(async (url, init) => {
    if (url === '/beneficiario') {
      return ok([
        beneficiarioApi({ id: 1, cpf: '11111111111', nomeCompleto: 'Maria Pendente', endereco: null }),
        beneficiarioApi({ id: 2, cpf: '22222222222', nomeCompleto: 'José Atendido' }),
      ]);
    }
    if (url === '/atendimento' && !init?.method) {
      return ok([atendimentoApi({ id: 10, beneficiario: 'José Atendido', dentista: 'Dr. João', prontuario: 'Em tratamento' })]);
    }
    if (url === '/colaborador') return ok([colaboradorApi({ id: 5, email: 'u@x.com' })]);
    return fakeResponse({ status: 404 });
  });
});

describe('Designação — designar dentista', () => {
  const abrirDialogo = async () => {
    await screen.findByText('Maria Pendente');
    await userEvent.click(screen.getByRole('button', { name: 'Designar Dentista' }));
    return screen.findByRole('dialog');
  };

  const pedirConfirmacao = async () => {
    const dialogo = await abrirDialogo();
    await userEvent.type(within(dialogo).getByLabelText('Prontuário inicial'), 'Dor no molar');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Designar dentista' }));
    return screen.findByRole('button', { name: 'Confirmar designação' });
  };

  it('na confirmação, beneficiário sem endereço mostra "Localização não informada"', async () => {
    renderPagina();

    await pedirConfirmacao();

    // Aparece nos detalhes e, de novo, na confirmação.
    expect(screen.getAllByText('Localização não informada').length).toBeGreaterThanOrEqual(2);
  });

  it('falha que não é um Error vira a mensagem padrão', async () => {
    vi.mocked(criarAtendimento).mockRejectedValue('quebrou');
    renderPagina();

    await userEvent.click(await pedirConfirmacao());

    expect(await screen.findByText('Erro ao criar atendimento.')).toBeInTheDocument();
  });

  it('fechar a confirmação durante o salvamento é ignorado; ao terminar, ela fecha sozinha', async () => {
    const salvando = adiado<never>();
    vi.mocked(criarAtendimento).mockReturnValue(salvando.promessa);
    renderPagina();
    await userEvent.click(await pedirConfirmacao());

    // O botão "Cancelar" fica desabilitado; o clique no fundo escuro é o caminho que chega à regra.
    await userEvent.click(fundoDe('Confirmar Designação'));

    expect(screen.getByText('Confirmar Designação')).toBeInTheDocument();

    salvando.resolver(undefined as never);
    await waitFor(() => expect(screen.queryByText('Confirmar Designação')).not.toBeInTheDocument());
  });
});

describe('Designação — encerrar atendimento', () => {
  const pedirConfirmacao = async () => {
    await userEvent.click(await screen.findByRole('button', { name: 'Em atendimento' }));
    await screen.findByText('José Atendido');
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    const dialogo = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialogo).getByLabelText('Colaborador responsável')).toHaveValue(5));
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Encerrar atendimento' }));
    return screen.findByRole('button', { name: 'Confirmar' });
  };

  it('falha que não é um Error vira a mensagem padrão', async () => {
    vi.mocked(encerrarAtendimento).mockRejectedValue('quebrou');
    renderPagina();

    await userEvent.click(await pedirConfirmacao());

    expect(await screen.findByText('Erro ao encerrar atendimento.')).toBeInTheDocument();
  });

  it('fechar a confirmação durante o salvamento é ignorado', async () => {
    const salvando = adiado<void>();
    vi.mocked(encerrarAtendimento).mockReturnValue(salvando.promessa);
    renderPagina();
    await userEvent.click(await pedirConfirmacao());

    await userEvent.click(fundoDe('Confirmar Encerramento'));

    expect(screen.getByText('Confirmar Encerramento')).toBeInTheDocument();

    salvando.resolver();
    await waitFor(() => expect(screen.queryByText('Confirmar Encerramento')).not.toBeInTheDocument());
  });
});
