import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import Sidebar from '../../components/asidebar/Sidebar';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { UnreadContext } from '../../context/unread';
import { Beneficiarios } from '../../pages/gerenciaBeneficiarios/Beneficiarios';
import { PedidosAjuda } from '../../pages/pedidosAjuda/pedidosAjuda';
import { beneficiarioApi, dentistaApi, pedidoApi } from '../../test/factories';
import { fakeResponse, installFetch, routeFetch, type FetchMock } from '../../test/http';

const auth: AuthContextValue = {
  user: { email: 'u@x.com', nome: 'Usuária', role: 'ADMIN', exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

const noAdmin = (ui: ReactNode) =>
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/admin/pagina']}>
        <NotificationProvider>{ui}</NotificationProvider>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

let fetchMock: FetchMock;

beforeEach(() => {
  localStorage.clear();
  fetchMock = installFetch();
});

describe('Pedidos de Ajuda — cancelar durante a ação', () => {
  it('clicar fora da confirmação enquanto o back processa não a fecha', async () => {
    fetchMock.mockImplementation(async (url, init) => {
      if (url === '/pedido-ajuda' && !init?.method) {
        return fakeResponse({ status: 200, body: [pedidoApi({ id: 1, nomeCompleto: 'Maria Pendente', status: 'PENDENTE' })] });
      }
      if (url === '/dentista') {
        return fakeResponse({ status: 200, body: [dentistaApi({ id: 10, nomeCompleto: 'Dra. Coordenadora', categoria: 'COORDENADOR' })] });
      }
      if (init?.method === 'PUT') return new Promise<Response>(() => {}); // o back nunca responde
      return fakeResponse({ status: 404 });
    });
    noAdmin(<PedidosAjuda />);
    await screen.findByText('Maria Pendente');
    const card = screen.getByText('Maria Pendente').closest('div.bg-white') as HTMLElement;
    await userEvent.click(within(card).getByRole('button', { name: 'Analisar Pedido' }));
    const dialogo = await screen.findByRole('dialog');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Aprovar' }));
    await screen.findByRole('option', { name: /Dra. Coordenadora/ });
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[selects.length - 1], '10');
    const aprovar = screen.getAllByRole('button', { name: 'Aprovar' });
    await userEvent.click(aprovar[aprovar.length - 1]);

    const fundos = document.querySelectorAll<HTMLElement>('div.fixed.inset-0');
    await userEvent.click(fundos[fundos.length - 1]);

    expect(screen.getAllByRole('button', { name: 'Aprovar' }).length).toBeGreaterThan(0);
  });
});

describe('Beneficiários — cartão sem programa', () => {
  it('mostra "Não informado" quando o beneficiário não tem programa social', async () => {
    routeFetch(fetchMock, {
      '/beneficiario': [beneficiarioApi({ id: 1, nomeCompleto: 'Maria Silva', programaSocial: null as never })],
      '/pedido-ajuda': [],
      '/programas-sociais': [],
    });

    noAdmin(<Beneficiarios />);

    await screen.findByText('Maria Silva');
    expect(screen.getByText('Não informado')).toBeInTheDocument();
  });
});

describe('Sidebar recolhida — badge de conversas não lidas', () => {
  const recolhida = (unread: number) =>
    render(
      <AuthContext.Provider value={auth}>
        <UnreadContext.Provider value={{ totalUnread: unread, conversations: [], refresh: async () => {} }}>
          <MemoryRouter initialEntries={['/admin/dashboard']}>
            <Sidebar isCollapsed setCollapsed={() => {}} />
          </MemoryRouter>
        </UnreadContext.Provider>
      </AuthContext.Provider>,
    );

  it('mostra a contagem no ícone', () => {
    recolhida(5);

    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });

  it('acima de 99 mostra "99+"', () => {
    recolhida(250);

    expect(screen.getAllByText('99+').length).toBeGreaterThan(0);
  });

  it('sem não lidas não mostra badge', () => {
    recolhida(0);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
