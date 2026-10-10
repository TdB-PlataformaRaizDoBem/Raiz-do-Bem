import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { BeneficiarioDetails } from '../../components/details/BeneficiarioDetails';
import { ColaboradorDetails } from '../../components/details/ColaboradorDetails';
import { AtendimentoDetails, BeneficiarioDesignacaoDetails } from '../../components/details/DesignacaoDetails';
import { DentistaDetails } from '../../components/details/DentistaDetails';
import { PedidoDetails } from '../../components/details/PedidosDetails';
import { ColLabel, Section } from '../../components/details/Section';
import { StaticCard } from '../../components/staticCard/staticCard';
import UserActions from '../../components/userActions/UserActions';
import UserCard from '../../components/userCard/UserCard';
import UserHeader from '../../components/userHeader/UserHeader';
import UserInformation from '../../components/userInformation/UserInformation';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import { mapAtendimento } from '../../domain/mappers/AtendimentoMapper';
import { mapBeneficiario } from '../../domain/mappers/Beneficiariomapper';
import { mapColaborador } from '../../domain/mappers/ColaboradorMapper';
import { mapDentista } from '../../domain/mappers/DentistaMapper';
import { mapPedido } from '../../domain/mappers/PedidoMapper';
import { atendimentoApi, beneficiarioApi, colaboradorApi, dentistaApi, pedidoApi } from '../../test/factories';
import { fakeResponse, installFetch, routeFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;

const authValue: AuthContextValue = {
  user: { email: 'ana@x.com', nome: 'Ana', role: 'ADMIN', exp: 9999999999 },
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

function LocalAtual() {
  const { pathname, search } = useLocation();
  return <p data-testid="local">{pathname + search}</p>;
}

function renderCompleto(ui: ReactNode, rota = '/admin/x') {
  window.history.pushState({}, '', rota);
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[rota]}>
        <NotificationProvider>
          {ui}
          <LocalAtual />
        </NotificationProvider>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  fetchMock = installFetch();
  routeFetch(fetchMock, { '/colaborador': [colaboradorApi({ id: 5, email: 'ana@x.com' })] });
});

afterEach(() => {
  window.history.pushState({}, '', '/');
  document.body.style.overflow = '';
});

/* ───────────── Section / ColLabel ───────────── */

describe('Section', () => {
  it('renderiza título e itens empilhados, com divisor a partir do segundo', () => {
    const { container } = render(
      <Section
        title="Contato"
        items={[
          { label: 'Email', value: 'a@b.com' },
          { label: 'Telefone', value: 11 },
        ]}
      />,
    );

    expect(screen.getByText('Contato')).toBeInTheDocument();
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(container.querySelectorAll('.border-t')).toHaveLength(1);
  });

  it('layout grid em duas colunas, sem divisores', () => {
    const { container } = render(
      <Section layout="grid" items={[{ label: 'A', value: '1' }, { label: 'B', value: '2' }]} />,
    );

    expect(container.querySelector('.grid-cols-2')).toBeInTheDocument();
    expect(container.querySelectorAll('.border-t')).toHaveLength(0);
  });

  it('aceita valor como ReactNode e classe extra no valor', () => {
    render(
      <Section
        items={[
          { label: 'Link', value: <a href="#x">abrir</a> },
          { label: 'Texto', value: 'grande', valueClass: 'text-lg' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'abrir' })).toBeInTheDocument();
    expect(screen.getByText('grande')).toHaveClass('text-lg');
  });

  it('sem items renderiza os filhos', () => {
    render(
      <Section title="Livre" className="extra">
        <p>conteúdo livre</p>
      </Section>,
    );

    expect(screen.getByText('conteúdo livre')).toBeInTheDocument();
  });

  it.each(['default', 'muted', 'accent', 'dashed'] as const)('variante %s renderiza com título', (variant) => {
    render(<Section variant={variant} title={`T-${variant}`} />);
    expect(screen.getByText(`T-${variant}`)).toBeInTheDocument();
  });

  it('ColLabel renderiza o rótulo', () => {
    render(<ColLabel>Dados Pessoais</ColLabel>);
    expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
  });
});

/* ───────────── BeneficiarioDetails ───────────── */

describe('BeneficiarioDetails', () => {
  const props = (o = {}) => ({
    data: mapBeneficiario(beneficiarioApi()),
    isAdmin: true,
    onClose: vi.fn(),
    onDeleted: vi.fn(),
    onUpdated: vi.fn(),
    ...o,
  });

  it('mostra os dados formatados, o programa e o pedido de origem', () => {
    renderCompleto(<BeneficiarioDetails {...props()} />);

    expect(screen.getByRole('heading', { name: 'Maria Silva' })).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Dentista Do Bem')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-01')).toBeInTheDocument();
    expect(screen.getByText('05/05/2010')).toBeInTheDocument();
    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument();
    expect(screen.getByText('CEP: 01001-000')).toBeInTheDocument();
    expect(screen.getByText('Dr. João')).toBeInTheDocument();
    expect(screen.getByText('Pedido ID: (#9)')).toBeInTheDocument();
  });

  it('o link "Iniciar conversa" leva ao chat e fecha o modal', async () => {
    const p = props();
    renderCompleto(<BeneficiarioDetails {...p} />);

    await userEvent.click(screen.getByRole('link', { name: /Iniciar conversa/ }));

    expect(p.onClose).toHaveBeenCalled();
    expect(screen.getByTestId('local')).toHaveTextContent('/admin/chat?phone=%2B5511987654321');
  });

  it('cobre os estados vazios: sem endereço, sem pedido, sem dentista', () => {
    const { rerender } = renderCompleto(
      <BeneficiarioDetails {...props({ data: mapBeneficiario(beneficiarioApi({ endereco: null, pedido: null })) })} />,
    );
    expect(screen.getByText('Endereço não informado.')).toBeInTheDocument();
    expect(screen.getByText('Dados do pedido original não encontrados.')).toBeInTheDocument();

    rerender(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <NotificationProvider>
            <BeneficiarioDetails
              {...props({
                data: mapBeneficiario(beneficiarioApi({ pedido: { id: 2, dentistaResponsavel: null as unknown as string } })),
              })}
            />
          </NotificationProvider>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText('Nenhum dentista atribuído a este pedido.')).toBeInTheDocument();
  });

  it('omite o bairro quando é "—" e mostra quando existe', () => {
    renderCompleto(<BeneficiarioDetails {...props()} />);
    expect(screen.getByText(/Centro —/)).toBeInTheDocument();
  });

  it('somente admin vê o botão Deletar', () => {
    renderCompleto(<BeneficiarioDetails {...props({ isAdmin: false })} />);
    expect(screen.queryByRole('button', { name: 'Deletar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar Dados' })).toBeInTheDocument();
  });

  it('excluir: chama DELETE por CPF, fecha e avisa o pai', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    const p = props();
    renderCompleto(<BeneficiarioDetails {...p} />);

    await userEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    await waitFor(() => expect(p.onDeleted).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe('/beneficiario/12345678901');
    expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
    expect(p.onClose).toHaveBeenCalled();
  });

  it('Fechar chama onClose', async () => {
    const p = props();
    renderCompleto(<BeneficiarioDetails {...p} />);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(p.onClose).toHaveBeenCalled();
  });
});

/* ───────────── ColaboradorDetails ───────────── */

describe('ColaboradorDetails', () => {
  it('mostra dados, mailto e exclui por CPF', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    const onClose = vi.fn();
    const onDeleted = vi.fn();
    renderCompleto(
      <ColaboradorDetails
        data={mapColaborador(colaboradorApi())}
        onClose={onClose}
        onDeleted={onDeleted}
        onUpdated={() => {}}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Ana Admin' })).toBeInTheDocument();
    expect(screen.getByText('01/02/2020')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-01')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enviar E-mail agora' })).toHaveAttribute('href', 'mailto:ana@x.com');

    await userEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe('/colaborador/12345678901');
    expect(onClose).toHaveBeenCalled();
  });

  it('Fechar chama onClose', async () => {
    const onClose = vi.fn();
    renderCompleto(
      <ColaboradorDetails data={mapColaborador(colaboradorApi())} onClose={onClose} onDeleted={() => {}} onUpdated={() => {}} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });
});

/* ───────────── DentistaDetails ───────────── */

describe('DentistaDetails', () => {
  const props = (o = {}) => ({
    data: mapDentista(dentistaApi()),
    isAdmin: true,
    onClose: vi.fn(),
    onDeleted: vi.fn(),
    onUpdated: vi.fn(),
    ...o,
  });

  it('mostra os dados profissionais e de contato', () => {
    renderCompleto(<DentistaDetails {...props()} />);

    expect(screen.getByRole('heading', { name: 'Dr. João' })).toBeInTheDocument();
    expect(screen.getByText('CLINICO')).toBeInTheDocument();
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText('CRO-SP 12345')).toBeInTheDocument();
    expect(screen.getByText('Masculino')).toBeInTheDocument();
    expect(screen.getByText('Ortodontia')).toBeInTheDocument();
    expect(screen.getByText(/Rua A, 10/)).toBeInTheDocument();
    expect(screen.getByText(/São Paulo - SP/)).toBeInTheDocument();
  });

  it('várias especialidades aparecem separadas por vírgula', () => {
    renderCompleto(
      <DentistaDetails {...props({ data: mapDentista(dentistaApi({ especialidades: ['Ortodontia', 'Endodontia'] })) })} />,
    );

    expect(screen.getByText('Ortodontia, Endodontia')).toBeInTheDocument();
  });

  it('sem especialidades mostra "Não informado"', () => {
    renderCompleto(<DentistaDetails {...props({ data: mapDentista(dentistaApi({ especialidades: [] })) })} />);

    expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0);
  });

  it('endereço ausente mostra "Não informado"', () => {
    renderCompleto(
      <DentistaDetails
        {...props({
          data: mapDentista(dentistaApi({ logradouro: null, numero: null, cidade: null, estado: null })),
        })}
      />,
    );

    expect(screen.getAllByText(/Não informado/).length).toBeGreaterThan(0);
  });

  it('link de conversa usa o prefixo da área atual', async () => {
    renderCompleto(<DentistaDetails {...props()} />, '/coord/dentistas');

    await userEvent.click(screen.getByRole('link', { name: /Iniciar conversa/ }));

    expect(screen.getByTestId('local')).toHaveTextContent('/coord/chat?phone=%2B5511987654321');
  });

  it('somente admin vê Deletar; exclusão chama DELETE por CPF', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    const p = props();
    const { unmount } = renderCompleto(<DentistaDetails {...props({ isAdmin: false })} />);
    expect(screen.queryByRole('button', { name: 'Deletar' })).not.toBeInTheDocument();
    unmount();

    renderCompleto(<DentistaDetails {...p} />);
    await userEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    await waitFor(() => expect(p.onDeleted).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe('/dentista/12345678901');
    expect(p.onClose).toHaveBeenCalled();
  });

  it('Fechar chama onClose', async () => {
    const p = props();
    renderCompleto(<DentistaDetails {...p} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(p.onClose).toHaveBeenCalled();
  });
});

/* ───────────── PedidoDetails ───────────── */

describe('PedidoDetails', () => {
  const props = (api = {}, o = {}) => ({
    data: mapPedido(pedidoApi(api)),
    isCoord: false,
    onAprovar: vi.fn(),
    onSuspender: vi.fn(),
    onClose: vi.fn(),
    ...o,
  });

  it('mostra situação, dados e descrição do pedido', () => {
    renderCompleto(<PedidoDetails {...props()} />);

    expect(screen.getByRole('heading', { name: 'Maria Silva' })).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-01')).toBeInTheDocument();
    expect(screen.getByText('"Dor"')).toBeInTheDocument();
    expect(screen.getByText('Rua A, 10')).toBeInTheDocument();
    expect(screen.getByText('Nenhum dentista atribuído.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email de Contato' })).toHaveAttribute('href', 'mailto:maria@x.com');
  });

  it('pedido PENDENTE oferece Aprovar e Suspender', async () => {
    const p = props();
    renderCompleto(<PedidoDetails {...p} />);

    await userEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));

    expect(p.onAprovar).toHaveBeenCalledTimes(1);
    expect(p.onSuspender).toHaveBeenCalledTimes(1);
  });

  it.each(['APROVADO', 'REJEITADO'] as const)('pedido %s não oferece Aprovar/Suspender', (status) => {
    renderCompleto(<PedidoDetails {...props({ status })} />);

    expect(screen.queryByRole('button', { name: 'Aprovar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Suspender' })).not.toBeInTheDocument();
  });

  it('mostra o dentista responsável quando há', () => {
    renderCompleto(<PedidoDetails {...props({ status: 'APROVADO', dentistaResponsavel: 'Dr. Marcos' })} />);
    expect(screen.getByText('Dr. Marcos')).toBeInTheDocument();
  });

  it('sem endereço mostra o aviso', () => {
    renderCompleto(<PedidoDetails {...props({ endereco: null as unknown as string })} />);
    expect(screen.getByText('Endereço não informado.')).toBeInTheDocument();
  });

  it('"Abrir chat" navega para o chat com prefixo admin ou coord conforme a área', async () => {
    const { unmount } = renderCompleto(<PedidoDetails {...props({ telefone: '11987654321' })} />, '/admin/solicitacoes');
    await userEvent.click(screen.getByRole('button', { name: /Abrir chat de atendimento/ }));
    expect(screen.getByTestId('local')).toHaveTextContent('/admin/chat/%2B55');
    unmount();

    renderCompleto(<PedidoDetails {...props({ telefone: '11987654321' })} />, '/coord/solicitacoes');
    await userEvent.click(screen.getByRole('button', { name: /Abrir chat de atendimento/ }));
    expect(screen.getByTestId('local')).toHaveTextContent('/coord/chat/%2B55');
  });

  it('Imprimir chama window.print e Fechar chama onClose', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const p = props();
    renderCompleto(<PedidoDetails {...p} />);

    await userEvent.click(screen.getByRole('button', { name: 'Imprimir Relatório' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(print).toHaveBeenCalled();
    expect(p.onClose).toHaveBeenCalled();
    print.mockRestore();
  });
});

/* ───────────── BeneficiarioDesignacaoDetails ───────────── */

describe('BeneficiarioDesignacaoDetails', () => {
  it('só permite designar depois de escrever o prontuário e envia o texto sem espaços nas pontas', async () => {
    const data = mapBeneficiario(beneficiarioApi());
    const onDesignar = vi.fn();
    renderCompleto(<BeneficiarioDesignacaoDetails data={data} onDesignar={onDesignar} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: 'Designar dentista' })).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Prontuário inicial'), '  Dor forte  ');
    await userEvent.click(screen.getByRole('button', { name: 'Designar dentista' }));

    expect(onDesignar).toHaveBeenCalledWith(data, 'Dor forte');
  });

  it('prontuário só com espaços continua bloqueado', async () => {
    renderCompleto(
      <BeneficiarioDesignacaoDetails data={mapBeneficiario(beneficiarioApi())} onDesignar={() => {}} onClose={() => {}} />,
    );

    await userEvent.type(screen.getByLabelText('Prontuário inicial'), '   ');

    expect(screen.getByRole('button', { name: 'Designar dentista' })).toBeDisabled();
  });

  it('mostra programa e localização quando existem, e some quando não', () => {
    const { unmount } = renderCompleto(
      <BeneficiarioDesignacaoDetails data={mapBeneficiario(beneficiarioApi())} onDesignar={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText('Dentista Do Bem')).toBeInTheDocument();
    expect(screen.getByText('Localização')).toBeInTheDocument();
    unmount();

    const vazio = mapBeneficiario(beneficiarioApi({ endereco: null }));
    renderCompleto(
      <BeneficiarioDesignacaoDetails data={{ ...vazio, programaSocial: null }} onDesignar={() => {}} onClose={() => {}} />,
    );
    expect(screen.queryByText('Programa Vinculado')).not.toBeInTheDocument();
    expect(screen.queryByText('Localização')).not.toBeInTheDocument();
  });

  it('Fechar chama onClose', async () => {
    const onClose = vi.fn();
    renderCompleto(
      <BeneficiarioDesignacaoDetails data={mapBeneficiario(beneficiarioApi())} onDesignar={() => {}} onClose={onClose} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('bairro "—" não é exibido', () => {
    const data = mapBeneficiario(
      beneficiarioApi({
        endereco: { id: 1, logradouro: 'Rua B', cep: '1', numero: '2', cidade: 'Rio', estado: 'RJ', bairro: null },
      }),
    );
    renderCompleto(<BeneficiarioDesignacaoDetails data={data} onDesignar={() => {}} onClose={() => {}} />);

    expect(screen.queryByText(/— —/)).not.toBeInTheDocument();
    expect(screen.getByText(/Rio - RJ/)).toBeInTheDocument();
  });
});

/* ───────────── AtendimentoDetails ───────────── */

describe('AtendimentoDetails', () => {
  const emAndamento = () => mapAtendimento(atendimentoApi({ prontuario: 'Dor' }));
  const concluido = () => mapAtendimento(atendimentoApi({ dataFim: '2026-04-01', prontuario: 'Tratado' }));

  it('em andamento: mostra o status e o formulário de encerramento', async () => {
    renderCompleto(<AtendimentoDetails data={emAndamento()} onEncerrar={() => {}} onClose={() => {}} />);

    expect(screen.getByText('Em atendimento')).toBeInTheDocument();
    expect(screen.getByLabelText('Prontuário de encerramento')).toHaveValue('Dor');
    expect(screen.getByText('"Dor"')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Colaborador responsável')).toHaveValue(5));
  });

  it('encerra com o prontuário e o id do colaborador logado', async () => {
    const onEncerrar = vi.fn();
    const data = emAndamento();
    renderCompleto(<AtendimentoDetails data={data} onEncerrar={onEncerrar} onClose={() => {}} />);
    await waitFor(() => expect(screen.getByLabelText('Colaborador responsável')).toHaveValue(5));

    await userEvent.clear(screen.getByLabelText('Prontuário de encerramento'));
    await userEvent.type(screen.getByLabelText('Prontuário de encerramento'), ' Resolvido ');
    await userEvent.click(screen.getByRole('button', { name: 'Encerrar atendimento' }));

    expect(onEncerrar).toHaveBeenCalledWith(data, { prontuario: 'Resolvido', idColaborador: 5 });
  });

  it('o botão fica desabilitado sem prontuário ou antes de descobrir o colaborador', async () => {
    fetchMock.mockImplementation(() => new Promise(() => {})); // colaborador nunca resolve
    const onEncerrar = vi.fn();
    renderCompleto(<AtendimentoDetails data={emAndamento()} onEncerrar={onEncerrar} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: 'Encerrar atendimento' })).toBeDisabled();
    expect(screen.getByText(/ID #0/)).toBeInTheDocument();
  });

  it('prontuário vazio mantém o botão desabilitado', async () => {
    renderCompleto(<AtendimentoDetails data={emAndamento()} onEncerrar={() => {}} onClose={() => {}} />);
    await waitFor(() => expect(screen.getByLabelText('Colaborador responsável')).toHaveValue(5));

    await userEvent.clear(screen.getByLabelText('Prontuário de encerramento'));

    expect(screen.getByRole('button', { name: 'Encerrar atendimento' })).toBeDisabled();
  });

  it('modo leitura: sem formulário; concluído permite "Atualizar atendimento"', async () => {
    const onEncerrar = vi.fn();
    renderCompleto(
      <AtendimentoDetails data={concluido()} modoLeitura permitirAtualizar onEncerrar={onEncerrar} onClose={() => {}} />,
    );

    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('01/04/2026')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Prontuário/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Atualizar atendimento' }));

    expect(screen.getByLabelText('Atualizar prontuário')).toHaveValue('Tratado');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument();
  });

  it('modo leitura sem permissão não oferece edição', () => {
    renderCompleto(<AtendimentoDetails data={concluido()} modoLeitura onClose={() => {}} />);

    expect(screen.queryByRole('button', { name: 'Atualizar atendimento' })).not.toBeInTheDocument();
  });

  it('sem onEncerrar não mostra o botão de salvar; submit sem pré-requisitos não dispara', async () => {
    renderCompleto(<AtendimentoDetails data={emAndamento()} onClose={() => {}} />);

    expect(screen.queryByRole('button', { name: 'Encerrar atendimento' })).not.toBeInTheDocument();
  });

  it('prontuário "—" abre vazio e mostra "Sem prontuário registrado."', () => {
    renderCompleto(
      <AtendimentoDetails data={mapAtendimento(atendimentoApi({ prontuario: null }))} onEncerrar={() => {}} onClose={() => {}} />,
    );

    expect(screen.getByText('Sem prontuário registrado.')).toBeInTheDocument();
    expect(screen.getByLabelText('Prontuário de encerramento')).toHaveValue('');
  });

  it('o botão de chat leva ao chat do dentista (prefixo conforme a área)', async () => {
    renderCompleto(<AtendimentoDetails data={emAndamento()} onClose={() => {}} />, '/coord/atendimento');

    await userEvent.click(screen.getByRole('button', { name: /Chat de atendimento/ }));

    expect(screen.getByTestId('local')).toHaveTextContent('/coord/chat/%2B5511987654321');
  });

  it('Fechar chama onClose', async () => {
    const onClose = vi.fn();
    renderCompleto(<AtendimentoDetails data={emAndamento()} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalled();
  });
});

/* ───────────── cartões e cabeçalhos ───────────── */

describe('UserCard / UserActions / UserInformation / StaticCard', () => {
  it('UserCard aplica a classe extra e renderiza os filhos', () => {
    render(<UserCard className="minha">filho</UserCard>);
    expect(screen.getByText('filho')).toHaveClass('minha');
  });

  it('UserCard sem className não quebra', () => {
    render(<UserCard>filho</UserCard>);
    expect(screen.getByText('filho')).toBeInTheDocument();
  });

  it('UserActions e UserInformation renderizam os filhos', () => {
    render(
      <UserInformation>
        <UserActions>
          <button>ação</button>
        </UserActions>
      </UserInformation>,
    );
    expect(screen.getByRole('button', { name: 'ação' })).toBeInTheDocument();
  });

  it('StaticCard mostra ícone, rótulo, valor e descrição', () => {
    render(<StaticCard icon="icone.svg" label="Pacientes" value={42} description="Total do mês" />);

    expect(screen.getByAltText('Pacientes')).toHaveAttribute('src', 'icone.svg');
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total do mês')).toBeInTheDocument();
  });
});

describe('UserHeader', () => {
  const renderEm = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <UserHeader />
      </MemoryRouter>,
    );

  it.each([
    ['/admin/dashboard', 'Dashboard', 'admin'],
    ['/coord/dentistas', 'Gerenciar Dentistas', 'coord'],
    ['/admin/colaboradores', 'Gerenciar Colaboradores', 'admin'],
    ['/admin/atendimento', 'Gerenciar Atendimentos', 'admin'],
    ['/coord/solicitacoes', 'Pedidos de Ajuda', 'coord'],
    ['/admin/beneficiarios', 'Gerenciar Beneficiários', 'admin'],
  ])('%s → "%s"', (path, titulo, contexto) => {
    renderEm(path);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(titulo);
    expect(screen.getByText(`Raiz do Bem / ${contexto}`)).toBeInTheDocument();
  });

  it('rota desconhecida mostra "Página Não Encontrada"', () => {
    renderEm('/admin/xyz');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página Não Encontrada');
  });

  it('na raiz usa o contexto "Plataforma"', () => {
    renderEm('/');
    expect(screen.getByText('Raiz do Bem / Plataforma')).toBeInTheDocument();
  });
});
