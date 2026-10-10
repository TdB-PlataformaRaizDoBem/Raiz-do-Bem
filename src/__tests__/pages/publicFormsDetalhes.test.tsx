import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import ContactForm from '../../pages/contact/Form/ContactForm';
import VoluntaryForm from '../../pages/voluntary/form/VoluntaryForm';
import { registrarDentistaVoluntario } from '../../services/DentistaService';
import { criarPedidoAjuda } from '../../services/PedidoService';
import { fakeResponse, installFetch } from '../../test/http';

// A falha que NÃO é um `Error` só se provoca simulando a escrita: o fetch sempre devolve `Error`.
vi.mock('../../services/PedidoService', async () => ({
  ...(await vi.importActual<object>('../../services/PedidoService')),
  criarPedidoAjuda: vi.fn(),
}));
vi.mock('../../services/DentistaService', async () => ({
  ...(await vi.importActual<object>('../../services/DentistaService')),
  registrarDentistaVoluntario: vi.fn(),
}));

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

beforeEach(() => {
  localStorage.clear();
  vi.mocked(criarPedidoAjuda).mockReset().mockRejectedValue('quebrou');
  vi.mocked(registrarDentistaVoluntario).mockReset().mockRejectedValue('quebrou');
  installFetch().mockImplementation(async (url) => {
    if (url === '/especialidades') return fakeResponse({ status: 200, body: [{ id: 1, descricao: 'Ortodontia' }] });
    return fakeResponse({ status: 204 });
  });
});

describe('ContactForm', () => {
  const preencherBase = async (sexo: string, idade: number) => {
    await digitar(/Nome Completo/, 'Maria da Silva');
    await digitar(/CPF/, '123.456.789-01');
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/), { target: { value: anosAtras(idade) } });
    await userEvent.selectOptions(screen.getByLabelText(/Sexo/), sexo);
    await digitar(/Email/, 'maria@x.com');
    await digitar(/Telefone/, '(11) 98765-4321');
    await digitar(/CEP/, '01001-000');
    await digitar(/Número/, '100');
    await digitar(/Descrição do Problema/, 'Preciso de atendimento para dor de dente forte.');
  };

  it('falha que não é um Error mostra a mensagem padrão', async () => {
    render(comRouter(<ContactForm />));
    await preencherBase('masculino', 10);

    await userEvent.click(screen.getByRole('button', { name: 'Enviar para Triagem' }));

    expect(await screen.findByText('Erro ao enviar pedido')).toBeInTheDocument();
  });

  it('mulher adulta que não responde à pergunta sobre violência vê o erro ligado ao campo', async () => {
    render(comRouter(<ContactForm />));
    await preencherBase('feminino', 30);

    await userEvent.click(screen.getByRole('button', { name: 'Enviar para Triagem' }));

    expect(await screen.findByText('Selecione uma opção')).toBeInTheDocument();
    expect(screen.getByLabelText(/Você se enquadra neste perfil/)).toHaveAttribute(
      'aria-describedby',
      'violenciaDomestica-error',
    );
  });
});

describe('VoluntaryForm', () => {
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

  it('falha que não é um Error mostra a mensagem padrão', async () => {
    render(comRouter(<VoluntaryForm />));
    await preencher();

    await userEvent.click(screen.getByRole('button', { name: 'Enviar Dados' }));

    expect(await screen.findByText('Erro ao cadastrar voluntário')).toBeInTheDocument();
  });

  it('desmarcar o sexo mostra o erro ligado ao campo', async () => {
    render(comRouter(<VoluntaryForm />));
    await preencher();
    await userEvent.selectOptions(screen.getByLabelText('Sexo:'), '');

    await userEvent.click(screen.getByRole('button', { name: 'Enviar Dados' }));

    expect(await screen.findAllByText('Campo obrigatório')).not.toHaveLength(0);
    expect(screen.getByLabelText('Sexo:')).toHaveAttribute('aria-describedby', 'sexo-error');
    expect(screen.getByLabelText('Sexo:').className).toContain('border-red-600');
  });
});
