import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { SelectEspecialidade } from '../../components/formElements/SelectEspecialidade';
import { CreateBeneficiario } from '../../components/forms/create/CreateBeneficiario';
import { CreateCoord } from '../../components/forms/create/CreateCoord';
import { CreateDentista } from '../../components/forms/create/CreateDentista';
import UpdateBeneficiario from '../../components/forms/update/UpdateBeneficiario';
import UpdateCoord from '../../components/forms/update/UpdateCoord';
import UpdateDentista from '../../components/forms/update/UpdateDentista';
import { mapBeneficiario } from '../../domain/mappers/Beneficiariomapper';
import { mapColaborador } from '../../domain/mappers/ColaboradorMapper';
import { mapDentista } from '../../domain/mappers/DentistaMapper';
import { beneficiarioApi, colaboradorApi, dentistaApi, pedidoApi } from '../../test/factories';
import { bodyOf, fakeResponse, installFetch, routeFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;

const comNotificacoes = (ui: ReactNode) => render(<NotificationProvider>{ui}</NotificationProvider>);

const digitar = async (label: string | RegExp, valor: string) => {
  const campo = screen.getByLabelText(label);
  await userEvent.clear(campo);
  await userEvent.type(campo, valor);
};

const chamadasCom = (metodo: string) =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === metodo);

const especialidades = [
  { id: 1, descricao: 'Ortodontia' },
  { id: 2, descricao: 'Endodontia' },
];

beforeEach(() => {
  fetchMock = installFetch();
});

/* ───────────── SelectEspecialidade ───────────── */

describe('SelectEspecialidade', () => {
  const base = { especialidades, loading: false, onChange: () => {} };

  it('lista as especialidades e avisa a escolha como número', async () => {
    const onChange = jest.fn();
    render(<SelectEspecialidade {...base} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByRole('combobox'), '2');

    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('option', { name: 'Ortodontia' })).toBeInTheDocument();
  });

  it('loading desabilita o campo e mostra a mensagem de carregamento', () => {
    render(<SelectEspecialidade {...base} loading />);

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Carregando especialidades...' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Ortodontia' })).not.toBeInTheDocument();
  });

  it('erro de carregamento substitui o select pela mensagem', () => {
    render(<SelectEspecialidade {...base} fetchError="Servidor fora do ar" />);

    expect(screen.getByText(/Erro ao carregar especialidades: Servidor fora do ar/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('mostra erro de validação e o asterisco de obrigatório', () => {
    render(<SelectEspecialidade {...base} error="Selecione uma especialidade" label="Especialidade" />);

    // aparece como opção placeholder e como mensagem de erro
    expect(screen.getAllByText('Selecione uma especialidade')).toHaveLength(2);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('required=false esconde o asterisco', () => {
    render(<SelectEspecialidade {...base} required={false} />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('mantém o valor selecionado', () => {
    render(<SelectEspecialidade {...base} value={2} />);
    expect(screen.getByRole('combobox')).toHaveValue('2');
  });
});

/* ───────────── CreateCoord ───────────── */

describe('CreateCoord (novo colaborador)', () => {
  const preencherValido = async () => {
    await digitar('Nome Completo', 'Ana Maria Souza');
    await digitar('CPF', '123.456.789-01');
    fireEvent.change(screen.getByLabelText('Data de Nascimento'), { target: { value: '1990-01-31' } });
    await digitar('Email', 'ana@raizdobem.org');
    await digitar('Senha Inicial', 'Senha@1234');
  };

  it('o botão Cadastrar começa desabilitado (formulário intocado)', () => {
    comNotificacoes(<CreateCoord onSuccess={() => {}} />);
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeDisabled();
  });

  it('envia os dados limpos (CPF só com dígitos) e fecha o formulário', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 201, body: colaboradorApi() }));
    const onSuccess = jest.fn();
    comNotificacoes(<CreateCoord onSuccess={onSuccess} />);

    await preencherValido();
    await userEvent.selectOptions(screen.getByDisplayValue('Colaborador'), 'ADMIN');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe('/colaborador');
    expect(bodyOf(fetchMock)).toMatchObject({
      nomeCompleto: 'Ana Maria Souza',
      cpf: '12345678901',
      dataNascimento: '1990-01-31',
      email: 'ana@raizdobem.org',
      role: 'ADMIN',
      senha: 'Senha@1234',
    });
    expect(await screen.findByText('Colaborador criado com sucesso!')).toBeInTheDocument();
  });

  it('a data de contratação já vem preenchida com hoje e a role com COLABORADOR', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 201, body: colaboradorApi() }));
    comNotificacoes(<CreateCoord onSuccess={() => {}} />);

    await preencherValido();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(bodyOf(fetchMock)).toMatchObject({
      role: 'COLABORADOR',
      dataContratacao: new Date().toISOString().split('T')[0],
    });
  });

  it('mostra os erros de validação e não envia', async () => {
    comNotificacoes(<CreateCoord onSuccess={() => {}} />);

    await digitar('Nome Completo', 'A1'); // sujo + inválido
    await digitar('CPF', '123');
    await digitar('Email', 'invalido');
    await digitar('Senha Inicial', 'curta');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(await screen.findByText('Nome deve conter apenas letras e no mínimo 3 caracteres')).toBeInTheDocument();
    expect(screen.getByText('CPF inválido (use 000.000.000-00)')).toBeInTheDocument();
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
    expect(screen.getByText('A senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getAllByText('Obrigatório').length).toBeGreaterThan(0); // data de nascimento
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('erro do back aparece como notificação e não fecha o formulário', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 409, body: { mensagem: 'CPF já cadastrado.' } }));
    const onSuccess = jest.fn();
    comNotificacoes(<CreateCoord onSuccess={onSuccess} />);

    await preencherValido();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(await screen.findByText('CPF já cadastrado.')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

/* ───────────── CreateBeneficiario ───────────── */

describe('CreateBeneficiario (novo beneficiário)', () => {
  const rotas = (extras: Record<string, unknown> = {}) =>
    routeFetch(fetchMock, {
      '/pedido-ajuda': [
        pedidoApi({ id: 7, status: 'APROVADO', nomeCompleto: 'Maria Pedido', descricaoProblema: 'Dente quebrado' }),
        pedidoApi({ id: 8, status: 'PENDENTE' }),
      ],
      '/beneficiario': [],
      '/programas-sociais': [
        { id: 1, programa: 'Dentista do Bem' },
        { id: 2, programa: 'Apolônias do Bem' },
      ],
      ...extras,
    });

  it('só oferece pedidos aprovados e mostra o resumo do pedido escolhido', async () => {
    rotas();
    comNotificacoes(<CreateBeneficiario onSuccess={() => {}} />);

    const select = await screen.findByRole('option', { name: /#7 — Maria Pedido/ });
    expect(select).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /#8/ })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], '7');

    expect(await screen.findByText('Pedido selecionado')).toBeInTheDocument();
    expect(screen.getByText('"Dente quebrado"')).toBeInTheDocument();
  });

  it('cadastra com pedido e programa escolhidos', async () => {
    rotas({ '/beneficiario': [] });
    fetchMock.mockImplementation(async (url, init) => {
      if (init?.method === 'POST') return fakeResponse({ status: 201, body: beneficiarioApi() });
      if (url === '/pedido-ajuda') return fakeResponse({ status: 200, body: [pedidoApi({ id: 7, status: 'APROVADO' })] });
      if (url === '/programas-sociais') return fakeResponse({ status: 200, body: [{ id: 2, programa: 'Apolônias do Bem' }] });
      return fakeResponse({ status: 200, body: [] });
    });
    const onSuccess = jest.fn();
    comNotificacoes(<CreateBeneficiario onSuccess={onSuccess} />);

    await screen.findByRole('option', { name: /#7/ });
    await screen.findByRole('option', { name: 'Apolônias do Bem' });
    const [selectPedido, selectPrograma] = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selectPedido, '7');
    await userEvent.selectOptions(selectPrograma, '2');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Beneficiário' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    // a última chamada agora é o refetch automático das listas; o corpo está no POST
    expect(JSON.parse(String(chamadasCom('POST')[0][1]?.body))).toEqual({ idPedidoAjuda: 7, idProgramaSocial: 2 });
    expect(await screen.findByText('Beneficiário criado com sucesso!')).toBeInTheDocument();
  });

  it('sem seleção mostra os erros de validação e não envia', async () => {
    rotas();
    comNotificacoes(<CreateBeneficiario onSuccess={() => {}} />);
    await screen.findByRole('option', { name: /#7/ });

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Beneficiário' }));

    expect(await screen.findByText('Selecione um pedido aprovado')).toBeInTheDocument();
    expect(screen.getByText('Selecione um programa social')).toBeInTheDocument();
    expect(chamadasCom('POST')).toHaveLength(0);
  });

  it('erro do back vira notificação', async () => {
    fetchMock.mockImplementation(async (url, init) => {
      if (init?.method === 'POST') return fakeResponse({ status: 409, body: { mensagem: 'Pedido já vinculado.' } });
      if (url === '/pedido-ajuda') return fakeResponse({ status: 200, body: [pedidoApi({ id: 7, status: 'APROVADO' })] });
      if (url === '/programas-sociais') return fakeResponse({ status: 200, body: [{ id: 1, programa: 'DB' }] });
      return fakeResponse({ status: 200, body: [] });
    });
    comNotificacoes(<CreateBeneficiario onSuccess={() => {}} />);

    await screen.findByRole('option', { name: /#7/ });
    await screen.findByRole('option', { name: 'DB' });
    const [selectPedido, selectPrograma] = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selectPedido, '7');
    await userEvent.selectOptions(selectPrograma, '1');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Beneficiário' }));

    expect(await screen.findByText('Pedido já vinculado.')).toBeInTheDocument();
  });

  it('sem pedidos aprovados livres e sem programas, mostra os avisos', async () => {
    routeFetch(fetchMock, { '/pedido-ajuda': [], '/beneficiario': [], '/programas-sociais': [] });
    comNotificacoes(<CreateBeneficiario onSuccess={() => {}} />);

    expect(screen.getByText('Carregando pedidos...')).toBeInTheDocument();
    expect(screen.getByText('Carregando programas...')).toBeInTheDocument();
    expect(await screen.findByText('Nenhum pedido aprovado disponível para vínculo no momento.')).toBeInTheDocument();
    expect(await screen.findByText('Nenhum programa disponível.')).toBeInTheDocument();
  });

  it('Cancelar chama onSuccess (fecha o modal)', async () => {
    rotas();
    const onSuccess = jest.fn();
    comNotificacoes(<CreateBeneficiario onSuccess={onSuccess} />);
    await screen.findByRole('option', { name: /#7/ });

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});

/* ───────────── CreateDentista ───────────── */

describe('CreateDentista (novo dentista)', () => {
  const rotasDentista = () =>
    fetchMock.mockImplementation(async (url, init) => {
      if (url === '/especialidades') return fakeResponse({ status: 200, body: especialidades });
      if (url.startsWith('https://viacep.com.br')) {
        return fakeResponse({
          status: 200,
          body: { cep: '01001-000', logradouro: 'Praça da Sé', localidade: 'São Paulo', uf: 'SP' },
          headers: { 'content-type': 'application/json' },
        });
      }
      if (init?.method === 'POST') return fakeResponse({ status: 201, body: dentistaApi() });
      return fakeResponse({ status: 404 });
    });

  const preencherValido = async () => {
    await digitar('Nome Completo', 'Dra Carla Dias');
    await digitar('CRO', 'CRO-SP 12345');
    await digitar('CPF', '123.456.789-01');
    await digitar('Email', 'carla@x.com');
    await digitar('Telefone', '(11) 98765-4321');
    await screen.findByRole('option', { name: 'Ortodontia' });
    await userEvent.selectOptions(screen.getByLabelText(/Especialidade/), '1');
    await digitar('CEP', '01001000');
    await digitar('Número', '100');
  };

  it('cadastra com os dados normalizados (CRO sem prefixo, CPF/telefone/CEP só dígitos)', async () => {
    rotasDentista();
    const onSuccess = jest.fn();
    comNotificacoes(<CreateDentista onSuccess={onSuccess} />);

    await preencherValido();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    const post = chamadasCom('POST')[0];
    expect(post[0]).toBe('/dentista');
    expect(JSON.parse(String(post[1]?.body))).toEqual({
      croDentista: 'SP 12345',
      cpf: '12345678901',
      nomeCompleto: 'Dra Carla Dias',
      sexo: 'F',
      email: 'carla@x.com',
      telefone: '11987654321',
      disponivel: 'S',
      categoria: 'CLINICO',
      idEspecialidade: 1,
      endereco: { cep: '01001000', numero: '100' },
    });
    expect(await screen.findByText('Dentista Dra Carla Dias cadastrado com sucesso!')).toBeInTheDocument();
  });

  it('o CEP completo dispara a consulta ao ViaCEP', async () => {
    rotasDentista();
    comNotificacoes(<CreateDentista onSuccess={() => {}} />);

    await digitar('CEP', '01001000');

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([u]) => u === 'https://viacep.com.br/ws/01001000/json/')).toBe(true),
    );
  });

  it('especialidade não escolhida: mostra erro e não envia', async () => {
    rotasDentista();
    comNotificacoes(<CreateDentista onSuccess={() => {}} />);
    await screen.findByRole('option', { name: 'Ortodontia' });

    await digitar('Nome Completo', 'Dra Carla Dias');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect((await screen.findAllByText('Campo obrigatório')).length).toBeGreaterThan(1);
    expect(chamadasCom('POST')).toHaveLength(0);
  });

  it('erro do back aparece como notificação', async () => {
    fetchMock.mockImplementation(async (url, init) => {
      if (url === '/especialidades') return fakeResponse({ status: 200, body: especialidades });
      if (url.startsWith('https://viacep.com.br')) return fakeResponse({ status: 204 });
      if (init?.method === 'POST') return fakeResponse({ status: 409, body: { mensagem: 'CRO já cadastrado.' } });
      return fakeResponse({ status: 404 });
    });
    comNotificacoes(<CreateDentista onSuccess={() => {}} />);

    await preencherValido();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(await screen.findByText('CRO já cadastrado.')).toBeInTheDocument();
  });

  it('Cancelar chama onSuccess', async () => {
    rotasDentista();
    const onSuccess = jest.fn();
    comNotificacoes(<CreateDentista onSuccess={onSuccess} />);
    await screen.findByRole('option', { name: 'Ortodontia' });

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onSuccess).toHaveBeenCalled();
  });
});

/* ───────────── UpdateCoord ───────────── */

describe('UpdateCoord (editar colaborador)', () => {
  const colaborador = () => mapColaborador(colaboradorApi({ id: 3, email: 'ana@x.com' }));

  it('mostra os dados fixos e só permite editar o e-mail', () => {
    comNotificacoes(<UpdateCoord initialData={colaborador()} onSuccess={() => {}} />);

    expect(screen.getByText('ID: #3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ana Admin')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('123.456.789-01')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Confirmar Atualização' })).toBeDisabled();
  });

  it('atualiza o e-mail por CPF e fecha', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    const onSuccess = jest.fn();
    comNotificacoes(<UpdateCoord initialData={colaborador()} onSuccess={onSuccess} />);

    await digitar('E-mail Corporativo', 'novo@x.com');
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Atualização' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe('/colaborador/12345678901');
    expect(fetchMock.mock.calls[0][1]?.method).toBe('PUT');
    expect(bodyOf(fetchMock)).toEqual({ email: 'novo@x.com' });
    expect(await screen.findByText('Conta atualizada com sucesso!')).toBeInTheDocument();
  });

  it('e-mail inválido mostra erro e não envia', async () => {
    comNotificacoes(<UpdateCoord initialData={colaborador()} onSuccess={() => {}} />);

    await digitar('E-mail Corporativo', 'invalido');
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Atualização' }));

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('erro do back vira notificação', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 409, body: { mensagem: 'E-mail em uso.' } }));
    const onSuccess = jest.fn();
    comNotificacoes(<UpdateCoord initialData={colaborador()} onSuccess={onSuccess} />);

    await digitar('E-mail Corporativo', 'outro@x.com');
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Atualização' }));

    expect(await screen.findByText('E-mail em uso.')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

/* ───────────── UpdateBeneficiario ───────────── */

describe('UpdateBeneficiario (editar beneficiário)', () => {
  const beneficiario = () => mapBeneficiario(beneficiarioApi());

  it('dados fixos ficam somente leitura e o botão começa como "Sem mudanças"', () => {
    comNotificacoes(<UpdateBeneficiario initialData={beneficiario()} onSuccess={() => {}} />);

    expect(screen.getByDisplayValue('Maria Silva')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('Dentista Do Bem')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Sem mudanças' })).toBeDisabled();
  });

  it('envia só e-mail, telefone (dígitos) e endereço (CEP em dígitos + número)', async () => {
    fetchMock.mockImplementation(async (url) =>
      url.startsWith('https://viacep.com.br') ? fakeResponse({ status: 204 }) : fakeResponse({ status: 200, body: beneficiarioApi() }),
    );
    const onSuccess = jest.fn();
    comNotificacoes(<UpdateBeneficiario initialData={beneficiario()} onSuccess={onSuccess} />);

    await digitar('E-mail', 'novo@x.com');
    await digitar('Telefone', '(11) 91111-2222');
    await digitar('Número', '99');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const put = chamadasCom('PUT')[0];
    expect(put[0]).toBe('/beneficiario/12345678901');
    expect(JSON.parse(String(put[1]?.body))).toEqual({
      email: 'novo@x.com',
      telefone: '11911112222',
      endereco: { cep: '01001000', numero: '99' },
    });
    expect(await screen.findByText('Maria Silva atualizado com sucesso!')).toBeInTheDocument();
  });

  it('trocar o CEP consulta o ViaCEP e preenche logradouro, cidade e estado', async () => {
    fetchMock.mockImplementation(async (url) =>
      url.startsWith('https://viacep.com.br')
        ? fakeResponse({
            status: 200,
            body: { cep: '13010-000', logradouro: 'Rua Barão de Jaguara', localidade: 'Campinas', uf: 'SP' },
            headers: { 'content-type': 'application/json' },
          })
        : fakeResponse({ status: 404 }),
    );
    comNotificacoes(<UpdateBeneficiario initialData={beneficiario()} onSuccess={() => {}} />);

    await digitar('CEP', '13010000');

    expect(await screen.findByDisplayValue('Campinas')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rua Barão de Jaguara')).toBeInTheDocument();
  });

  it('validações: e-mail inválido, telefone obrigatório e CEP inválido', async () => {
    comNotificacoes(<UpdateBeneficiario initialData={beneficiario()} onSuccess={() => {}} />);

    await digitar('E-mail', 'invalido');
    await userEvent.clear(screen.getByLabelText('Telefone'));
    await digitar('CEP', '123');
    // submit direto no formulário: o type="email" faria o próprio navegador bloquear o envio
    fireEvent.submit(document.querySelector('form')!);

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument();
    expect(screen.getByText('CEP inválido')).toBeInTheDocument();
    expect(screen.getAllByText('Obrigatório').length).toBeGreaterThan(0);
    expect(chamadasCom('PUT')).toHaveLength(0);
  });

  it('erro do back vira notificação', async () => {
    fetchMock.mockImplementation(async (url, init) => {
      if (url.startsWith('https://viacep.com.br')) return fakeResponse({ status: 204 });
      if (init?.method === 'PUT') return fakeResponse({ status: 422, body: { mensagem: 'CEP não encontrado.' } });
      return fakeResponse({ status: 404 });
    });
    comNotificacoes(<UpdateBeneficiario initialData={beneficiario()} onSuccess={() => {}} />);

    await digitar('E-mail', 'novo@x.com');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect(await screen.findByText('CEP não encontrado.')).toBeInTheDocument();
  });

  it('Cancelar chama onSuccess; beneficiário sem endereço abre com campos vazios', async () => {
    const onSuccess = jest.fn();
    comNotificacoes(
      <UpdateBeneficiario
        initialData={mapBeneficiario(beneficiarioApi({ endereco: null, programaSocial: 'APOLONIA' }))}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByLabelText('CEP')).toHaveValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onSuccess).toHaveBeenCalled();
  });
});

/* ───────────── UpdateDentista ───────────── */

describe('UpdateDentista (editar dentista)', () => {
  const dentista = (o = {}) => mapDentista(dentistaApi({ cep: '01001000', especialidades: ['Endodontia'], ...o }));

  const rotas = () =>
    fetchMock.mockImplementation(async (url, init) => {
      if (url === '/especialidades') return fakeResponse({ status: 200, body: especialidades });
      if (url.startsWith('https://viacep.com.br')) return fakeResponse({ status: 204 });
      if (init?.method === 'PUT') return fakeResponse({ status: 200, body: dentistaApi() });
      return fakeResponse({ status: 404 });
    });

  it('seleciona a especialidade atual do dentista a partir do nome', async () => {
    rotas();
    comNotificacoes(<UpdateDentista initialData={dentista()} onSuccess={() => {}} />);

    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('2'));
  });

  it('resolver a especialidade atual não altera o formulário: segue "Sem mudanças" e sem aviso do React', async () => {
    const erro = jest.spyOn(console, 'error').mockImplementation(() => {});
    rotas();
    comNotificacoes(<UpdateDentista initialData={dentista()} onSuccess={() => {}} />);

    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('2'));

    expect(screen.getByRole('button', { name: 'Sem mudanças' })).toBeDisabled();
    expect(erro.mock.calls.some(([msg]) => String(msg).includes('while rendering'))).toBe(false);
    erro.mockRestore();
  });

  it('o nome da especialidade é comparado sem diferenciar maiúsculas', async () => {
    rotas();
    comNotificacoes(<UpdateDentista initialData={dentista({ especialidades: ['ENDODONTIA'] })} onSuccess={() => {}} />);

    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('2'));
  });

  it('especialidade que não existe na lista fica sem seleção e o formulário continua sem mudanças', async () => {
    rotas();
    comNotificacoes(<UpdateDentista initialData={dentista({ especialidades: ['Inexistente'] })} onSuccess={() => {}} />);
    await screen.findByRole('option', { name: 'Ortodontia' });

    expect(screen.getByLabelText(/Especialidade/)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Sem mudanças' })).toBeDisabled();
  });

  it('o usuário pode trocar a especialidade resolvida e enviar a nova', async () => {
    rotas();
    comNotificacoes(<UpdateDentista initialData={dentista()} onSuccess={() => {}} />);
    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('2'));

    await userEvent.selectOptions(screen.getByLabelText(/Especialidade/), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => expect(chamadasCom('PUT')).toHaveLength(1));
    expect(JSON.parse(String(chamadasCom('PUT')[0][1]?.body)).idEspecialidade).toBe(1);
  });

  it('dados fixos somente leitura; botão começa sem mudanças', async () => {
    rotas();
    comNotificacoes(<UpdateDentista initialData={dentista()} onSuccess={() => {}} />);

    expect(screen.getByDisplayValue('Dr. João')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('CRO-SP 12345')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Sem mudanças' })).toBeDisabled();
    await screen.findByRole('option', { name: 'Ortodontia' });
  });

  it('envia os campos editáveis normalizados (incluindo a especialidade resolvida)', async () => {
    rotas();
    const onSuccess = jest.fn();
    comNotificacoes(<UpdateDentista initialData={dentista()} onSuccess={onSuccess} />);
    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('2'));

    await digitar('Telefone', '(21) 99999-0000');
    await userEvent.selectOptions(screen.getByDisplayValue('Sim'), 'N');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const put = chamadasCom('PUT')[0];
    expect(put[0]).toBe('/dentista/12345678901');
    expect(JSON.parse(String(put[1]?.body))).toMatchObject({
      email: 'joao@x.com',
      telefone: '21999990000',
      categoriaDentista: 'CLINICO',
      disponivel: 'N',
      idEspecialidade: 2,
      endereco: { cep: '01001000', numero: '10' },
    });
    expect(await screen.findByText('Dentista Dr. João atualizado!')).toBeInTheDocument();
  });

  it('campos "—" da API abrem vazios e a validação cobra o preenchimento', async () => {
    rotas();
    comNotificacoes(
      <UpdateDentista
        initialData={dentista({ email: null as unknown as string, telefone: null as unknown as string, categoria: null, especialidades: [] })}
        onSuccess={() => {}}
      />,
    );
    await screen.findByRole('option', { name: 'Ortodontia' });

    expect(screen.getByLabelText('Email')).toHaveValue('');
    await digitar('Número', '11'); // sujo
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect((await screen.findAllByText('Obrigatório')).length).toBeGreaterThan(1);
    expect(chamadasCom('PUT')).toHaveLength(0);
  });

  it('erro do back vira notificação', async () => {
    fetchMock.mockImplementation(async (url, init) => {
      if (url === '/especialidades') return fakeResponse({ status: 200, body: especialidades });
      if (url.startsWith('https://viacep.com.br')) return fakeResponse({ status: 204 });
      if (init?.method === 'PUT') return fakeResponse({ status: 422, body: { mensagem: 'Especialidade inválida.' } });
      return fakeResponse({ status: 404 });
    });
    comNotificacoes(<UpdateDentista initialData={dentista()} onSuccess={() => {}} />);
    await waitFor(() => expect(screen.getByLabelText(/Especialidade/)).toHaveValue('2'));

    await digitar('Telefone', '(21) 99999-0000');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect(await screen.findByText('Especialidade inválida.')).toBeInTheDocument();
  });

  it('Cancelar chama onSuccess', async () => {
    rotas();
    const onSuccess = jest.fn();
    comNotificacoes(<UpdateDentista initialData={dentista()} onSuccess={onSuccess} />);
    await screen.findByRole('option', { name: 'Ortodontia' });

    await userEvent.click(within(screen.getByRole('button', { name: 'Cancelar' }).parentElement!).getByRole('button', { name: 'Cancelar' }));

    expect(onSuccess).toHaveBeenCalled();
  });
});
