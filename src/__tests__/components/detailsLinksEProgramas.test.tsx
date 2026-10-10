import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { AtendimentoDetails } from '../../components/details/DesignacaoDetails';
import { BeneficiarioDetails } from '../../components/details/BeneficiarioDetails';
import { PedidoDetails } from '../../components/details/PedidosDetails';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { mapAtendimento } from '../../domain/mappers/AtendimentoMapper';
import { mapPedido } from '../../domain/mappers/PedidoMapper';
import { atendimentoApi, beneficiarioApi, pedidoApi } from '../../test/factories';
import { fakeResponse, installFetch } from '../../test/http';

const auth: AuthContextValue = {
  user: { email: 'u@x.com', nome: 'Usuária', role: 'ADMIN', exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

function Local() {
  return <p data-testid="local">{decodeURIComponent(useLocation().pathname)}</p>;
}

/** O link do chat usa o caminho REAL do navegador (/admin ou /coord) para escolher o painel. */
function renderEm(caminhoDoNavegador: string, ui: ReactNode) {
  window.history.pushState({}, '', caminhoDoNavegador);
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[caminhoDoNavegador]}>
        <NotificationProvider>
          {ui}
          <Local />
        </NotificationProvider>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  installFetch().mockImplementation(async () => fakeResponse({ status: 200, body: [] }));
});

const SEM_DDI = '11987654321';
const COM_DDI = '5511987654321';

describe('link do chat — contato do dentista (atendimento)', () => {
  const detalhe = (contatoDentista: string) => (
    <AtendimentoDetails
      data={mapAtendimento(atendimentoApi({ contatoDentista }))}
      modoLeitura
      onClose={vi.fn()}
    />
  );

  it.each([
    ['sem DDI no painel do admin', SEM_DDI, '/admin/pagina', '/admin/chat/+5511987654321'],
    ['com DDI 55 no painel do admin', COM_DDI, '/admin/pagina', '/admin/chat/+5511987654321'],
    ['sem DDI no painel do coordenador', SEM_DDI, '/coord/pagina', '/coord/chat/+5511987654321'],
    ['com DDI 55 no painel do coordenador', COM_DDI, '/coord/pagina', '/coord/chat/+5511987654321'],
  ])('%s', async (_nome, contato, caminho, esperado) => {
    renderEm(caminho, detalhe(contato));

    await userEvent.click(screen.getByRole('button', { name: /Chat de atendimento/ }));

    expect(screen.getByTestId('local')).toHaveTextContent(esperado);
  });
});

describe('link do chat — telefone do beneficiário (pedido de ajuda)', () => {
  const detalhe = (telefone: string) => (
    <PedidoDetails data={mapPedido(pedidoApi({ telefone }))} isCoord={false} onAprovar={vi.fn()} onSuspender={vi.fn()} onClose={vi.fn()} />
  );

  it.each([
    ['sem DDI no painel do admin', SEM_DDI, '/admin/pagina', '/admin/chat/+5511987654321'],
    ['com DDI 55 no painel do admin', COM_DDI, '/admin/pagina', '/admin/chat/+5511987654321'],
    ['sem DDI no painel do coordenador', SEM_DDI, '/coord/pagina', '/coord/chat/+5511987654321'],
    ['com DDI 55 no painel do coordenador', COM_DDI, '/coord/pagina', '/coord/chat/+5511987654321'],
  ])('%s', async (_nome, telefone, caminho, esperado) => {
    renderEm(caminho, detalhe(telefone));

    await userEvent.click(screen.getByRole('button', { name: /Abrir chat/ }));

    expect(screen.getByTestId('local')).toHaveTextContent(esperado);
  });
});

describe('BeneficiarioDetails — programa social', () => {
  const dados = (programaSocial: string | null) =>
    ({ ...beneficiarioApi({ programaSocial: programaSocial as never }), programaSocial }) as never;

  const renderDetalhe = (programaSocial: string | null) =>
    renderEm(
      '/admin/pagina',
      <BeneficiarioDetails data={dados(programaSocial)} isAdmin onClose={vi.fn()} onDeleted={vi.fn()} onUpdated={vi.fn()} />,
    );

  it('mostra o programa vinculado', () => {
    renderDetalhe('Turma do Bem');

    expect(screen.getByText('Turma do Bem')).toBeInTheDocument();
  });

  it('sem programa vinculado mostra "Não informado"', () => {
    renderDetalhe(null);

    expect(screen.getByText('Não informado')).toBeInTheDocument();
  });
});
