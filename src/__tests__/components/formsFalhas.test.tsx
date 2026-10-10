import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { CreateBeneficiario } from '../../components/forms/create/CreateBeneficiario';
import { CreateCoord } from '../../components/forms/create/CreateCoord';
import { CreateDentista } from '../../components/forms/create/CreateDentista';
import UpdateBeneficiario from '../../components/forms/update/UpdateBeneficiario';
import UpdateCoord from '../../components/forms/update/UpdateCoord';
import UpdateDentista from '../../components/forms/update/UpdateDentista';
import { mapBeneficiario } from '../../domain/mappers/Beneficiariomapper';
import { mapColaborador } from '../../domain/mappers/ColaboradorMapper';
import { mapDentista } from '../../domain/mappers/DentistaMapper';
import { atualizarBeneficiario, criarBeneficiario } from '../../services/Beneficiarioservice';
import { atualizarColaborador, criarColaborador } from '../../services/ColaboradorService';
import { atualizarDentista, criarDentista } from '../../services/DentistaService';
import { beneficiarioApi, colaboradorApi, dentistaApi, pedidoApi } from '../../test/factories';
import { fakeResponse, installFetch } from '../../test/http';

// As funções de escrita são simuladas para rejeitar com algo que NÃO é um `Error`: o fetch de verdade
// sempre devolve `Error`, então o texto de reserva de cada formulário só aparece assim.
vi.mock('../../services/Beneficiarioservice', async () => ({
  ...(await vi.importActual<object>('../../services/Beneficiarioservice')),
  criarBeneficiario: vi.fn(),
  atualizarBeneficiario: vi.fn(),
}));
vi.mock('../../services/ColaboradorService', async () => ({
  ...(await vi.importActual<object>('../../services/ColaboradorService')),
  criarColaborador: vi.fn(),
  atualizarColaborador: vi.fn(),
}));
vi.mock('../../services/DentistaService', async () => ({
  ...(await vi.importActual<object>('../../services/DentistaService')),
  criarDentista: vi.fn(),
  atualizarDentista: vi.fn(),
}));

const comNotificacoes = (ui: ReactNode) => render(<NotificationProvider>{ui}</NotificationProvider>);

const digitar = async (label: string | RegExp, valor: string) => {
  const campo = screen.getByLabelText(label);
  await userEvent.clear(campo);
  await userEvent.type(campo, valor);
};

const especialidades = [
  { id: 1, descricao: 'Ortodontia' },
  { id: 2, descricao: 'Endodontia' },
];

const ok = (body: unknown) => fakeResponse({ status: 200, body });

beforeEach(() => {
  for (const escrita of [
    criarBeneficiario,
    atualizarBeneficiario,
    criarColaborador,
    atualizarColaborador,
    criarDentista,
    atualizarDentista,
  ]) {
    vi.mocked(escrita).mockReset().mockRejectedValue('quebrou');
  }
  installFetch().mockImplementation(async (url) => {
    if (url === '/especialidades') return ok(especialidades);
    if (url.startsWith('https://viacep.com.br')) return fakeResponse({ status: 204 });
    if (url === '/pedido-ajuda') return ok([pedidoApi({ id: 7, status: 'APROVADO' })]);
    if (url === '/programas-sociais') return ok([{ id: 1, programa: 'DB' }]);
    return ok([]);
  });
});

describe('falha de escrita que não é um Error: cada formulário usa o seu texto de reserva', () => {
  it('CreateCoord', async () => {
    comNotificacoes(<CreateCoord onSuccess={() => {}} />);
    await digitar('Nome Completo', 'Ana Maria Souza');
    await digitar('CPF', '123.456.789-01');
    fireEvent.change(screen.getByLabelText('Data de Nascimento'), { target: { value: '1990-01-31' } });
    await digitar('Email', 'ana@raizdobem.org');
    await digitar('Senha Inicial', 'Senha@1234');

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(await screen.findByText('Erro ao criar colaborador')).toBeInTheDocument();
  });

  it('CreateBeneficiario', async () => {
    comNotificacoes(<CreateBeneficiario onSuccess={() => {}} />);
    await screen.findByRole('option', { name: /#7/ });
    await screen.findByRole('option', { name: 'DB' });
    const [selectPedido, selectPrograma] = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selectPedido, '7');
    await userEvent.selectOptions(selectPrograma, '1');

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Beneficiário' }));

    expect(await screen.findByText('Erro ao criar beneficiário')).toBeInTheDocument();
  });

  it('CreateDentista', async () => {
    comNotificacoes(<CreateDentista onSuccess={() => {}} />);
    await digitar('Nome Completo', 'Dra Carla Dias');
    await digitar('CRO', 'CRO-SP 12345');
    await digitar('CPF', '123.456.789-01');
    await digitar('Email', 'carla@x.com');
    await digitar('Telefone', '(11) 98765-4321');
    await screen.findByRole('option', { name: 'Ortodontia' });
    await userEvent.selectOptions(screen.getByLabelText(/Especialidade/), '1');
    await digitar('CEP', '01001000');
    await digitar('Número', '100');

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(await screen.findByText('Erro ao cadastrar dentista')).toBeInTheDocument();
  });

  it('UpdateCoord', async () => {
    comNotificacoes(
      <UpdateCoord initialData={mapColaborador(colaboradorApi({ id: 3, email: 'ana@x.com' }))} onSuccess={() => {}} />,
    );
    await digitar('E-mail Corporativo', 'novo@x.com');

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Atualização' }));

    expect(await screen.findByText('Erro ao atualizar')).toBeInTheDocument();
  });

  it('UpdateBeneficiario', async () => {
    comNotificacoes(<UpdateBeneficiario initialData={mapBeneficiario(beneficiarioApi())} onSuccess={() => {}} />);
    await digitar('E-mail', 'novo@x.com');

    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect(await screen.findByText('Erro ao atualizar')).toBeInTheDocument();
  });

  it('UpdateDentista', async () => {
    comNotificacoes(
      <UpdateDentista
        initialData={mapDentista(dentistaApi({ cep: '01001000', especialidades: ['Endodontia'] }))}
        onSuccess={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('2'));
    await digitar('Telefone', '(21) 99999-0000');

    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect(await screen.findByText('Erro ao atualizar')).toBeInTheDocument();
  });
});

describe('formulário de edição sem mudanças não envia nada, nem por Enter', () => {
  const enviarIntocado = (botao: string) => fireEvent.submit(screen.getByRole('button', { name: botao }).closest('form')!);

  it('UpdateCoord', async () => {
    comNotificacoes(<UpdateCoord initialData={mapColaborador(colaboradorApi())} onSuccess={() => {}} />);

    enviarIntocado('Confirmar Atualização');

    await waitFor(() => expect(atualizarColaborador).not.toHaveBeenCalled());
  });

  it('UpdateBeneficiario', async () => {
    comNotificacoes(<UpdateBeneficiario initialData={mapBeneficiario(beneficiarioApi())} onSuccess={() => {}} />);

    enviarIntocado('Sem mudanças');

    await waitFor(() => expect(atualizarBeneficiario).not.toHaveBeenCalled());
  });

  it('UpdateDentista', async () => {
    comNotificacoes(
      <UpdateDentista initialData={mapDentista(dentistaApi({ cep: '01001000', especialidades: ['Endodontia'] }))} onSuccess={() => {}} />,
    );
    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('2'));

    enviarIntocado('Sem mudanças');

    await waitFor(() => expect(atualizarDentista).not.toHaveBeenCalled());
  });
});
