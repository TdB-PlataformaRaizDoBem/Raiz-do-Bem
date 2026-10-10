import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import ContactForm from '../../pages/contact/Form/ContactForm';
import VoluntaryForm from '../../pages/voluntary/form/VoluntaryForm';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;

const comRouter = (ui: ReactNode) => (
  <MemoryRouter>
    <NotificationProvider>{ui}</NotificationProvider>
  </MemoryRouter>
);

const digitar = async (label: string | RegExp, valor: string) => {
  const campo = screen.getByLabelText(label);
  await userEvent.clear(campo);
  await userEvent.type(campo, valor);
};

const anosAtras = (anos: number) => `${new Date().getFullYear() - anos}-06-15`;
const caixa = (nome: RegExp) => screen.getByRole('checkbox', { name: nome });
const corpoEnviado = () => JSON.parse(String(fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')![1]?.body));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  fetchMock = installFetch();
  fetchMock.mockImplementation(async (url, init) => {
    if (url === '/especialidades') return fakeResponse({ status: 200, body: [{ id: 1, descricao: 'Ortodontia' }] });
    if (init?.method === 'POST') return fakeResponse({ status: 201, body: { id: 1, status: 'PENDENTE' } });
    return fakeResponse({ status: 204 });
  });
});

afterEach(() => vi.unstubAllEnvs());

describe('Pedido de ajuda: consentimento (LGPD)', () => {
  const preencher = async (idade: number) => {
    await digitar(/Nome Completo/, 'Maria da Silva');
    await digitar(/CPF/, '123.456.789-01');
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/), { target: { value: anosAtras(idade) } });
    await userEvent.selectOptions(screen.getByLabelText(/Sexo/), 'outros');
    await digitar(/Email/, 'maria@x.com');
    await digitar(/Telefone/, '(11) 98765-4321');
    await digitar(/CEP/, '01001-000');
    await digitar(/Número/, '100');
    await digitar(/Descrição do Problema/, 'Preciso de atendimento para dor de dente forte.');
  };
  const enviar = () => userEvent.click(screen.getByRole('button', { name: 'Enviar para Triagem' }));

  it('as autorizações nascem desmarcadas e a do responsável só aparece para menores', async () => {
    render(comRouter(<ContactForm />));

    expect(caixa(/Li e concordo/)).not.toBeChecked();
    expect(caixa(/dados sensíveis/)).not.toBeChecked();
    expect(screen.queryByRole('checkbox', { name: /responsável legal/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Data de Nascimento/), { target: { value: anosAtras(30) } });
    expect(screen.queryByRole('checkbox', { name: /responsável legal/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Data de Nascimento/), { target: { value: anosAtras(12) } });
    expect(caixa(/responsável legal/)).not.toBeChecked();
  });

  it('sem marcar as autorizações, não envia e avisa o que falta', async () => {
    render(comRouter(<ContactForm />));
    await preencher(30);

    await enviar();

    expect(await screen.findByText('Para enviar, marque a autorização de uso dos dados.')).toBeInTheDocument();
    expect(screen.getByText('Para enviar, marque a autorização para os dados sensíveis.')).toBeInTheDocument();
    expect(caixa(/Li e concordo/)).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0);
  });

  it('sem a autorização dos dados sensíveis, não envia mesmo com a primeira marcada', async () => {
    render(comRouter(<ContactForm />));
    await preencher(30);
    await userEvent.click(caixa(/Li e concordo/));

    await enviar();

    expect(await screen.findByText('Para enviar, marque a autorização para os dados sensíveis.')).toBeInTheDocument();
    expect(screen.queryByText('Para enviar, marque a autorização de uso dos dados.')).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0);
  });

  it('menor de 18 anos: exige a declaração do responsável legal', async () => {
    render(comRouter(<ContactForm />));
    await preencher(10);
    await userEvent.click(caixa(/Li e concordo/));
    await userEvent.click(caixa(/dados sensíveis/));

    await enviar();
    expect(await screen.findByText('Para enviar, confirme que você é o responsável legal.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0);

    await userEvent.click(caixa(/responsável legal/));
    await enviar();
    expect(await screen.findByText('Pedido enviado com sucesso!')).toBeInTheDocument();
  });

  it('adulto com as duas autorizações envia o pedido, e as caixas voltam desmarcadas', async () => {
    render(comRouter(<ContactForm />));
    await preencher(30);
    await userEvent.click(caixa(/Li e concordo/));
    await userEvent.click(caixa(/dados sensíveis/));

    await enviar();

    expect(await screen.findByText('Pedido enviado com sucesso!')).toBeInTheDocument();
    expect(caixa(/Li e concordo/)).not.toBeChecked();
    expect(caixa(/dados sensíveis/)).not.toBeChecked();
  });

  it('o registro de consentimento não vai no corpo enquanto a API não o aceitar', async () => {
    render(comRouter(<ContactForm />));
    await preencher(30);
    await userEvent.click(caixa(/Li e concordo/));
    await userEvent.click(caixa(/dados sensíveis/));

    await enviar();
    await screen.findByText('Pedido enviado com sucesso!');

    expect(corpoEnviado()).not.toHaveProperty('consentimento');
  });

  it('com VITE_ENVIAR_CONSENTIMENTO=true, envia o registro com versão, data e itens (menor inclui o responsável)', async () => {
    vi.stubEnv('VITE_ENVIAR_CONSENTIMENTO', 'true');
    render(comRouter(<ContactForm />));
    await preencher(10);
    await userEvent.click(caixa(/Li e concordo/));
    await userEvent.click(caixa(/dados sensíveis/));
    await userEvent.click(caixa(/responsável legal/));

    await enviar();
    await screen.findByText('Pedido enviado com sucesso!');

    const { consentimento } = corpoEnviado();
    expect(consentimento).toMatchObject({
      documento: 'pedido-de-ajuda',
      versao: '1.0',
      itens: ['dados-pessoais', 'dados-sensiveis', 'responsavel-legal'],
    });
    expect(Number.isNaN(Date.parse(consentimento.aceitoEm))).toBe(false);
  });

  it('os links dos documentos abrem em nova aba, sem perder o que foi digitado', () => {
    render(comRouter(<ContactForm />));

    const termo = screen.getByRole('link', { name: /Termo de Consentimento/ });
    const politica = screen.getByRole('link', { name: /Política de Privacidade/ });

    expect(termo).toHaveAttribute('href', '/consentimento/pedido-de-ajuda');
    expect(politica).toHaveAttribute('href', '/privacidade');
    for (const link of [termo, politica]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });

  it('o resumo do aviso diz quem é o controlador e como revogar', () => {
    render(comRouter(<ContactForm />));

    expect(screen.getByText(/05\.413\.029\/0001-19/)).toBeInTheDocument();
    expect(screen.getByText(/faleconosco@tdb\.org\.br/)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Autorização para uso dos seus dados' })).toBeInTheDocument();
  });

  it('o rascunho não guarda CPF, data de nascimento, relato de saúde nem autorizações', async () => {
    render(comRouter(<ContactForm />));
    await preencher(30);
    await userEvent.click(caixa(/Li e concordo/));

    await waitFor(() => expect(sessionStorage.getItem('raiz-do-bem:contact-form')).not.toBeNull(), { timeout: 4000 });
    const rascunho = JSON.parse(sessionStorage.getItem('raiz-do-bem:contact-form')!);

    expect(rascunho).toHaveProperty('nome', 'Maria da Silva');
    for (const campo of ['cpf', 'dataNascimento', 'descricaoProblema', 'violenciaDomestica', 'aceiteTermo', 'aceiteDadosSensiveis', 'declaracaoResponsavel']) {
      expect(rascunho).not.toHaveProperty(campo);
    }
    expect(localStorage.getItem('raiz-do-bem:contact-form')).toBeNull();
  });

  it('apaga o rascunho antigo que estava em localStorage', () => {
    localStorage.setItem('raiz-do-bem:contact-form', JSON.stringify({ nome: 'Antigo', cpf: '12345678901' }));

    render(comRouter(<ContactForm />));

    expect(localStorage.getItem('raiz-do-bem:contact-form')).toBeNull();
    expect(screen.getByLabelText(/Nome Completo/)).toHaveValue('');
  });
});

describe('Voluntário: consentimento (LGPD)', () => {
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
  };
  const enviar = () => userEvent.click(screen.getByRole('button', { name: 'Enviar Dados' }));

  it('a autorização nasce desmarcada e o aviso traz o controlador', () => {
    render(comRouter(<VoluntaryForm />));

    expect(caixa(/Li e concordo/)).not.toBeChecked();
    expect(screen.getByText(/05\.413\.029\/0001-19/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Termo de Consentimento/ })).toHaveAttribute('href', '/consentimento/voluntario');
  });

  it('sem marcar a autorização, não cadastra', async () => {
    render(comRouter(<VoluntaryForm />));
    await preencher();

    await enviar();

    expect(await screen.findByText('Para enviar, marque a autorização de uso dos dados.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0);
  });

  it('com a autorização, cadastra sem mandar o campo de aceite à API e desmarca a caixa', async () => {
    render(comRouter(<VoluntaryForm />));
    await preencher();
    await userEvent.click(caixa(/Li e concordo/));

    await enviar();

    expect(await screen.findByText('Cadastro de voluntário realizado com sucesso!')).toBeInTheDocument();
    const corpo = corpoEnviado();
    expect(corpo).not.toHaveProperty('aceiteTermo');
    expect(corpo).not.toHaveProperty('consentimento');
    expect(caixa(/Li e concordo/)).not.toBeChecked();
  });

  it('com VITE_ENVIAR_CONSENTIMENTO=true, envia o registro do termo de voluntário', async () => {
    vi.stubEnv('VITE_ENVIAR_CONSENTIMENTO', 'true');
    render(comRouter(<VoluntaryForm />));
    await preencher();
    await userEvent.click(caixa(/Li e concordo/));

    await enviar();
    await screen.findByText('Cadastro de voluntário realizado com sucesso!');

    expect(corpoEnviado().consentimento).toMatchObject({
      documento: 'voluntario',
      versao: '1.0',
      itens: ['dados-cadastrais'],
    });
  });

  it('o rascunho não guarda CPF nem a autorização', async () => {
    render(comRouter(<VoluntaryForm />));
    await digitar('Nome Completo:', 'Dra Carla Dias');
    await digitar('CPF:', '123.456.789-01');
    await userEvent.click(caixa(/Li e concordo/));

    await waitFor(() => expect(sessionStorage.getItem('raiz-do-bem:voluntary-form')).not.toBeNull(), { timeout: 4000 });
    const rascunho = JSON.parse(sessionStorage.getItem('raiz-do-bem:voluntary-form')!);

    expect(rascunho).toHaveProperty('nomeCompleto', 'Dra Carla Dias');
    expect(rascunho).not.toHaveProperty('cpf');
    expect(rascunho).not.toHaveProperty('aceiteTermo');
  });
});
