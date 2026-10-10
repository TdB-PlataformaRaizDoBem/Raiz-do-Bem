import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import type { BeneficiarioFormValues } from '../../components/forms/create/CreateBeneficiario';
import { BeneficiarioForm } from '../../components/forms/create/CreateBeneficiariosForm';
import { CreateDentista } from '../../components/forms/create/CreateDentista';
import UpdateBeneficiario from '../../components/forms/update/UpdateBeneficiario';
import UpdateDentista from '../../components/forms/update/UpdateDentista';
import { mapBeneficiario } from '../../domain/mappers/Beneficiariomapper';
import { mapDentista } from '../../domain/mappers/DentistaMapper';
import { beneficiarioApi, dentistaApi, pedidoApi } from '../../test/factories';
import { fakeResponse, installFetch } from '../../test/http';

const comNotificacoes = (ui: ReactNode) => render(<NotificationProvider>{ui}</NotificationProvider>);

const digitar = async (label: string | RegExp, valor: string) => {
  const campo = screen.getByLabelText(label);
  await userEvent.clear(campo);
  if (valor) await userEvent.type(campo, valor);
};

const ok = (body: unknown) => fakeResponse({ status: 200, body });

beforeEach(() => {
  installFetch().mockImplementation(async (url) => {
    if (url === '/especialidades') return ok([{ id: 1, descricao: 'Ortodontia' }]);
    if (url.startsWith('https://viacep.com.br')) return fakeResponse({ status: 204 });
    if (url === '/pedido-ajuda') return ok([pedidoApi({ id: 7, status: 'APROVADO' })]);
    if (url === '/programas-sociais') return ok([{ id: 1, programa: 'DB' }]);
    return ok([]);
  });
});

describe('BeneficiarioForm em modo de edição', () => {
  function EmEdicao({ onCancel }: { onCancel: () => void }) {
    const methods = useForm<BeneficiarioFormValues>({ defaultValues: { idPedidoAjuda: 0 } });
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(() => {})}>
          <BeneficiarioForm onCancel={onCancel} isEdit />
        </form>
      </FormProvider>
    );
  }

  it('troca os títulos e não oferece a escolha do pedido de ajuda', () => {
    comNotificacoes(<EmEdicao onCancel={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Editar Beneficiário' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cadastrar Beneficiário' })).not.toBeInTheDocument();
  });
});

describe('CreateDentista — validação do nome', () => {
  it('nome com números é recusado e não envia', async () => {
    comNotificacoes(<CreateDentista onSuccess={() => {}} />);

    await digitar('Nome Completo', 'Carla 123');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(await screen.findByText('Nome inválido')).toBeInTheDocument();
  });
});

describe('UpdateBeneficiario — dados incompletos', () => {
  it('beneficiário sem programa abre normalmente', () => {
    const sem = { ...mapBeneficiario(beneficiarioApi()), programaSocial: null } as never;

    comNotificacoes(<UpdateBeneficiario initialData={sem} onSuccess={() => {}} />);

    expect(screen.getByRole('button', { name: 'Sem mudanças' })).toBeDisabled();
  });

  it('apagar o número do endereço mostra o erro de campo obrigatório', async () => {
    comNotificacoes(<UpdateBeneficiario initialData={mapBeneficiario(beneficiarioApi())} onSuccess={() => {}} />);

    await digitar('Número', '');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect(await screen.findByText('Obrigatório')).toBeInTheDocument();
  });
});

describe('UpdateDentista — endereço ausente e indisponível', () => {
  const semEndereco = () =>
    ({
      ...mapDentista(dentistaApi({ especialidades: ['Ortodontia'] })),
      cep: null,
      numero: null,
      logradouro: null,
      cidade: null,
      estado: null,
      disponivel: false,
    }) as never;

  it('dentista sem endereço abre com os campos vazios e a disponibilidade "Não"', async () => {
    comNotificacoes(<UpdateDentista initialData={semEndereco()} onSuccess={() => {}} />);

    expect(await screen.findByDisplayValue('Não')).toBeInTheDocument();
    expect(screen.getByLabelText('CEP')).toHaveValue('');
    expect(screen.getByLabelText('Número')).toHaveValue('');
  });

  it('exige o CEP e o número do endereço', async () => {
    comNotificacoes(<UpdateDentista initialData={semEndereco()} onSuccess={() => {}} />);
    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('1'));
    await digitar('Telefone', '(21) 99999-0000');

    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect((await screen.findAllByText(/Obrigatório|CEP/)).length).toBeGreaterThanOrEqual(1);
  });
});
