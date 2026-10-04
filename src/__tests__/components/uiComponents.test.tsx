import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { NotificationProvider } from '../../components/context/NotificationProvider';
import { SelectDentista } from '../../components/formElements/SelectDentista';
import TextArea from '../../components/formElements/TextArea';
import { AsyncEstado } from '../../components/ui/AsyncEstado';
import { Button } from '../../components/ui/Button';
import { FilterBar } from '../../components/ui/FilterBar';
import FullScreenLoader from '../../components/ui/FullScreenLoader';
import { Modal } from '../../components/ui/Modal';
import Search from '../../components/ui/Search';
import Spinner from '../../components/ui/Spinner';
import DeleteUserButton from '../../components/ui/buttonFilters/DeleteUserButton';
import EditBeneficiarioButton from '../../components/ui/buttonFilters/EditBeneficiarioButton';
import EditCoordButton from '../../components/ui/buttonFilters/EditCoordButton';
import EditDentistaButton from '../../components/ui/buttonFilters/EditDentistaButton';
import ExportCsvButton from '../../components/ui/buttonFilters/ExportCsvButton';
import { mapBeneficiario } from '../../domain/mappers/Beneficiariomapper';
import { mapColaborador } from '../../domain/mappers/ColaboradorMapper';
import { mapDentista } from '../../domain/mappers/DentistaMapper';
import { beneficiarioApi, colaboradorApi, dentistaApi } from '../../test/factories';
import { installFetch, routeFetch } from '../../test/http';

// Os formulários de edição têm testes próprios: aqui basta saber que o botão os abre e reage ao sucesso.
jest.mock('../../components/forms/update/UpdateBeneficiario', () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: () => void }) =>
    jest.requireActual<typeof import('react')>('react').createElement('button', { onClick: onSuccess }, 'salvar-beneficiario'),
}));
jest.mock('../../components/forms/update/UpdateCoord', () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: () => void }) =>
    jest.requireActual<typeof import('react')>('react').createElement('button', { onClick: onSuccess }, 'salvar-coord'),
}));
jest.mock('../../components/forms/update/UpdateDentista', () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: () => void }) =>
    jest.requireActual<typeof import('react')>('react').createElement('button', { onClick: onSuccess }, 'salvar-dentista'),
}));

const comNotificacoes = (ui: ReactNode) => render(<NotificationProvider>{ui}</NotificationProvider>);

afterEach(() => {
  document.body.style.overflow = '';
});

/* ───────────── componentes simples ───────────── */

describe('Button', () => {
  it('renderiza o texto e repassa props', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Salvar</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['primary', 'bg-orange'],
    ['danger', 'bg-red-500'],
    ['secondary', 'bg-darkgreen'],
    ['outline', 'border-gray-300'],
  ] as const)('variante %s', (variant, classe) => {
    render(<Button variant={variant}>x</Button>);
    expect(screen.getByRole('button')).toHaveClass(classe);
  });

  it('tamanhos sm e md', () => {
    const { rerender } = render(<Button size="sm">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-1.5');

    rerender(<Button size="md">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');
  });

  it('respeita disabled e className extra', () => {
    render(
      <Button disabled className="minha-classe">
        x
      </Button>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('minha-classe');
  });
});

describe('Spinner e FullScreenLoader', () => {
  it('Spinner renderiza o indicador', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('FullScreenLoader é um status acessível', () => {
    render(<FullScreenLoader />);
    expect(screen.getByRole('status', { name: 'Verificando autenticação...' })).toBeInTheDocument();
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });
});

describe('AsyncEstado', () => {
  it('loading mostra "Carregando..." e esconde o conteúdo', () => {
    render(
      <AsyncEstado loading error={null}>
        <p>conteúdo</p>
      </AsyncEstado>,
    );
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument();
  });

  it('erro mostra a mensagem', () => {
    render(
      <AsyncEstado loading={false} error="Falhou">
        <p>conteúdo</p>
      </AsyncEstado>,
    );
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    expect(screen.getByText('Falhou')).toBeInTheDocument();
  });

  it('sucesso mostra o conteúdo', () => {
    render(
      <AsyncEstado loading={false} error={null}>
        <p>conteúdo</p>
      </AsyncEstado>,
    );
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
  });
});

describe('FilterBar', () => {
  it('sem filhos não renderiza nada', () => {
    const { container } = render(<FilterBar>{null}</FilterBar>);
    expect(container).toBeEmptyDOMElement();
  });

  it('abre e fecha o dropdown de filtros', async () => {
    render(
      <FilterBar>
        <p>opção de filtro</p>
      </FilterBar>,
    );
    expect(screen.queryByText('opção de filtro')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }));
    expect(screen.getByText('opção de filtro')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }));
    expect(screen.queryByText('opção de filtro')).not.toBeInTheDocument();
  });
});

describe('Modal', () => {
  it('fechado não renderiza e não trava o scroll', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>dentro</p>
      </Modal>,
    );
    expect(screen.queryByText('dentro')).not.toBeInTheDocument();
  });

  it('aberto renderiza no body e trava o scroll', () => {
    render(
      <Modal open onClose={() => {}}>
        <p>dentro</p>
      </Modal>,
    );
    expect(screen.getByText('dentro')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('clicar no fundo fecha; clicar no conteúdo não', async () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        <p>dentro</p>
      </Modal>,
    );

    await userEvent.click(screen.getByText('dentro'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText('dentro').parentElement!.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('TextArea', () => {
  it('associa o label ao campo', () => {
    render(<TextArea label="Descrição" name="descricao" />);
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
  });

  it('mostra erro acessível', () => {
    render(<TextArea label="Descrição" name="descricao" error="Campo obrigatório" />);

    const campo = screen.getByLabelText('Descrição');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Campo obrigatório');
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório');
  });

  it('aceita digitação', async () => {
    render(<TextArea label="Descrição" name="descricao" />);
    await userEvent.type(screen.getByLabelText('Descrição'), 'texto');
    expect(screen.getByLabelText('Descrição')).toHaveValue('texto');
  });
});

/* ───────────── Search (com busca por voz) ───────────── */

class FakeRecognition {
  static last: FakeRecognition | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onresult: ((e: unknown) => void) | null = null;
  start = jest.fn();
  stop = jest.fn();
  abort = jest.fn();
  constructor() {
    FakeRecognition.last = this;
  }
}

describe('Search', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'SpeechRecognition');
  });

  it('digitar dispara onChange e o placeholder vira aria-label', async () => {
    const onChange = jest.fn();
    render(<Search placeholder="Pesquisar dentistas..." onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Pesquisar dentistas...'), 'ab');

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('sem suporte a voz: não mostra o botão do microfone', () => {
    render(<Search placeholder="Pesquisar" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('com suporte: o microfone inicia a escuta e entrega a transcrição via onChange', async () => {
    Object.assign(window, { SpeechRecognition: FakeRecognition });
    const onChange = jest.fn();
    render(<Search placeholder="Pesquisar" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Pesquisar por voz' }));
    expect(FakeRecognition.last?.start).toHaveBeenCalled();

    act(() => FakeRecognition.last?.onstart?.());
    expect(screen.getByPlaceholderText('Ouvindo...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parar reconhecimento de voz' })).toHaveAttribute('aria-pressed', 'true');

    act(() => FakeRecognition.last?.onresult?.({ results: [[{ transcript: 'maria' }]] }));
    expect(onChange).toHaveBeenCalledWith({ target: { value: 'maria' } });
  });

  it('a transcrição não quebra quando não há onChange', async () => {
    Object.assign(window, { SpeechRecognition: FakeRecognition });
    render(<Search placeholder="Pesquisar" />);
    await userEvent.click(screen.getByRole('button', { name: 'Pesquisar por voz' }));

    expect(() => act(() => FakeRecognition.last?.onresult?.({ results: [[{ transcript: 'x' }]] }))).not.toThrow();
  });
});

/* ───────────── SelectDentista ───────────── */

describe('SelectDentista', () => {
  const dentistas = [
    dentistaApi({ id: 1, nomeCompleto: 'Ana Coord', categoria: 'COORDENADOR', especialidades: ['Ortodontia', 'Endodontia', 'Implante'] }),
    dentistaApi({ id: 2, nomeCompleto: 'Beto Coord', categoria: 'COORDENADOR', disponivel: 'N', especialidades: [] }),
    dentistaApi({ id: 3, nomeCompleto: 'Caio Clínico', categoria: 'CLINICO' }),
  ];

  beforeEach(() => {
    routeFetch(installFetch(), { '/dentista': dentistas });
  });

  it('lista só coordenadores, com até 2 especialidades e marca indisponíveis', async () => {
    render(<SelectDentista value="" onChange={() => {}} />);

    await screen.findByRole('option', { name: /Ana Coord/ });
    expect(screen.getByRole('option', { name: 'Ana Coord — Ortodontia, Endodontia' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beto Coord (indisponível)' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Caio/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Selecione um dentista' })).toBeInTheDocument();
  });

  it('mostra "Carregando dentistas..." enquanto busca', async () => {
    render(<SelectDentista value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Carregando dentistas...' })).toBeInTheDocument();
    await screen.findByRole('option', { name: /Ana Coord/ });
  });

  it('filtra pelo nome digitado e avisa quando nada é encontrado', async () => {
    render(<SelectDentista value="" onChange={() => {}} />);
    await screen.findByRole('option', { name: /Ana Coord/ });

    await userEvent.type(screen.getByPlaceholderText('Filtrar por nome...'), 'beto');
    expect(screen.queryByRole('option', { name: /Ana Coord/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Beto Coord/ })).toBeInTheDocument();

    await userEvent.clear(screen.getByPlaceholderText('Filtrar por nome...'));
    await userEvent.type(screen.getByPlaceholderText('Filtrar por nome...'), 'zzz');
    expect(screen.getByRole('option', { name: 'Nenhum dentista encontrado' })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('selecionar chama onChange com o id', async () => {
    const onChange = jest.fn();
    render(<SelectDentista value="" onChange={onChange} />);
    await screen.findByRole('option', { name: /Ana Coord/ });

    await userEvent.selectOptions(screen.getByRole('combobox'), '1');

    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('erro de carregamento mostra mensagem', async () => {
    const fetchMock = installFetch();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    render(<SelectDentista value="" onChange={() => {}} />);

    expect(await screen.findByText('Erro ao carregar dentistas. Recarregue a página.')).toBeInTheDocument();
  });
});

/* ───────────── botões de ação ───────────── */

describe('DeleteUserButton', () => {
  it('abre a confirmação e Cancelar fecha sem excluir', async () => {
    const onConfirm = jest.fn(async () => {});
    comNotificacoes(<DeleteUserButton userName="Maria" onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    expect(screen.getByText('Confirmar exclusão', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText('Maria', { selector: 'strong' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Confirmar exclusão', { selector: 'h2' })).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirmar exclui, fecha o modal e notifica sucesso', async () => {
    const onConfirm = jest.fn(async () => {});
    comNotificacoes(<DeleteUserButton userName="Maria" onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    await waitFor(() => expect(screen.getByText('Maria foi excluído com sucesso!')).toBeInTheDocument());
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Confirmar exclusão', { selector: 'h2' })).not.toBeInTheDocument();
  });

  it('erro na exclusão mostra a mensagem e mantém o modal aberto', async () => {
    const onConfirm = jest.fn(async () => {
      throw new Error('Beneficiário vinculado a atendimento.');
    });
    comNotificacoes(<DeleteUserButton userName="Maria" onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    expect(await screen.findByText('Beneficiário vinculado a atendimento.')).toBeInTheDocument();
    expect(screen.getByText('Confirmar exclusão', { selector: 'h2' })).toBeInTheDocument();
  });

  it('erro que não é Error usa a mensagem padrão', async () => {
    const onConfirm = jest.fn(async () => {
      throw 'falhou';
    });
    comNotificacoes(<DeleteUserButton userName="Maria" onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    expect(await screen.findByText('Erro ao excluir.')).toBeInTheDocument();
  });

  it('clicar no fundo do modal também cancela', async () => {
    comNotificacoes(<DeleteUserButton userName="Maria" onConfirm={async () => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    await userEvent.click(screen.getByText('Confirmar exclusão', { selector: 'h2' }).parentElement!.parentElement!);

    expect(screen.queryByText('Confirmar exclusão', { selector: 'h2' })).not.toBeInTheDocument();
  });
});

describe('ExportCsvButton', () => {
  let click: jest.SpiedFunction<typeof HTMLAnchorElement.prototype.click>;

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:csv');
    URL.revokeObjectURL = jest.fn();
    click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    click.mockRestore();
  });

  it('baixa o arquivo com o nome informado e libera a URL', async () => {
    const onExport = jest.fn(async () => new Blob(['a;b']));
    comNotificacoes(<ExportCsvButton onExport={onExport} fileName="dentistas.csv" />);

    await userEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    await waitFor(() => expect(screen.getByText('Arquivo "dentistas.csv" exportado com sucesso!')).toBeInTheDocument());
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:csv');
    expect(document.querySelector('a[download]')).toBeNull(); // link removido do DOM
  });

  it('usa o rótulo personalizado', () => {
    comNotificacoes(<ExportCsvButton onExport={async () => new Blob()} fileName="x.csv" label="Baixar" />);
    expect(screen.getByRole('button', { name: 'Baixar' })).toBeInTheDocument();
  });

  it('desabilita e mostra "Exportando..." durante a exportação', async () => {
    let liberar: (b: Blob) => void = () => {};
    const onExport = jest.fn(() => new Promise<Blob>((res) => (liberar = res)));
    comNotificacoes(<ExportCsvButton onExport={onExport} fileName="x.csv" />);

    await userEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    expect(screen.getByRole('button', { name: 'Exportando...' })).toBeDisabled();

    await act(async () => liberar(new Blob()));
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeEnabled();
  });

  it('mostra a mensagem do erro quando a exportação falha', async () => {
    comNotificacoes(
      <ExportCsvButton
        onExport={async () => {
          throw new Error('Sem permissão');
        }}
        fileName="x.csv"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    expect(await screen.findByText('Sem permissão')).toBeInTheDocument();
    expect(click).not.toHaveBeenCalled();
  });

  it('erro que não é Error usa a mensagem padrão', async () => {
    comNotificacoes(
      <ExportCsvButton
        onExport={async () => {
          throw 'x';
        }}
        fileName="x.csv"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    expect(await screen.findByText('Erro ao exportar CSV.')).toBeInTheDocument();
  });
});

describe('botões "Editar Dados"', () => {
  const casos = [
    {
      nome: 'beneficiário',
      render: (onUpdated: () => void) => (
        <EditBeneficiarioButton user={mapBeneficiario(beneficiarioApi())} onUpdated={onUpdated} />
      ),
      salvar: 'salvar-beneficiario',
    },
    {
      nome: 'colaborador',
      render: (onUpdated: () => void) => <EditCoordButton user={mapColaborador(colaboradorApi())} onUpdated={onUpdated} />,
      salvar: 'salvar-coord',
    },
    {
      nome: 'dentista',
      render: (onUpdated: () => void) => <EditDentistaButton user={mapDentista(dentistaApi())} onUpdated={onUpdated} />,
      salvar: 'salvar-dentista',
    },
  ];

  it.each(casos)('$nome: abre o formulário e, ao salvar, fecha e avisa o pai', async ({ render: ui, salvar }) => {
    const onUpdated = jest.fn();
    render(ui(onUpdated));
    expect(screen.queryByText(salvar)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Editar Dados' }));
    await userEvent.click(screen.getByText(salvar));

    expect(onUpdated).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(salvar)).not.toBeInTheDocument();
  });

  it.each(casos)('$nome: clicar no fundo do modal fecha sem salvar', async ({ render: ui, salvar }) => {
    const onUpdated = jest.fn();
    render(ui(onUpdated));

    await userEvent.click(screen.getByRole('button', { name: 'Editar Dados' }));
    await userEvent.click(screen.getByText(salvar).parentElement!.parentElement!);

    expect(screen.queryByText(salvar)).not.toBeInTheDocument();
    expect(onUpdated).not.toHaveBeenCalled();
  });
});
