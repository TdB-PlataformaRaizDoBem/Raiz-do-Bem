import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { UserManagementPage } from '../../components/UserManagement/UserManagementPage';
import type { PageFilterConfig } from '../../components/UserManagement/FilterConfig';

interface Item {
  id: number;
  nome: string;
  tipo: 'a' | 'b';
}

const itens = (n: number): Item[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, nome: `Pessoa ${String(i + 1).padStart(2, '0')}`, tipo: i % 2 === 0 ? 'a' : 'b' }));

const filtro: PageFilterConfig<Item> = {
  groups: [{ label: 'Tipo', key: 'tipo', options: [{ label: 'Tipo A', value: 'a' }, { label: 'Tipo B', value: 'b' }] }],
  predicate: (item, filtros, busca) =>
    (!filtros.tipo || item.tipo === filtros.tipo) && (!busca || item.nome.toLowerCase().includes(busca)),
};

function Local() {
  const { search } = useLocation();
  return <p data-testid="query">{search}</p>;
}

type Props = Partial<React.ComponentProps<typeof UserManagementPage<Item>>>;

function renderPage(props: Props = {}, rota = '/lista') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <UserManagementPage<Item>
        title="Pessoas"
        users={itens(3)}
        getId={(u) => u.id}
        renderCard={(u, selected, select) => (
          <button onClick={select} aria-pressed={selected}>
            card {u.nome}
          </button>
        )}
        renderDetails={(u, close) => (
          <div>
            <p>detalhes de {u.nome}</p>
            <button onClick={close}>fechar detalhes</button>
          </div>
        )}
        {...props}
      />
      <Local />
    </MemoryRouter>,
  );
}

const comTabela: Props = {
  tableHeaders: ['Nome', 'Tipo'],
  renderTableRow: (u, selected, select) => (
    <tr aria-selected={selected} onClick={select}>
      <td>linha {u.nome}</td>
      <td>{u.tipo}</td>
    </tr>
  ),
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  document.body.style.overflow = '';
});

describe('UserManagementPage — listagem', () => {
  it('mostra um card por item', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'card Pessoa 01' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'card Pessoa 03' })).toBeInTheDocument();
  });

  it('lista vazia mostra a mensagem padrão ou a personalizada', () => {
    const { unmount } = renderPage({ users: [] });
    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument();
    unmount();

    renderPage({ users: [], mensagemVazio: 'Ninguém por aqui.' });
    expect(screen.getByText('Ninguém por aqui.')).toBeInTheDocument();
  });

  it('lista vazia com formulário de criação oferece "Criar agora"', async () => {
    renderPage({ users: [], renderCreateForm: () => <p>formulário de criação</p> });
    expect(screen.getByText('Use o botão acima para adicionar o primeiro registro.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Criar agora' }));

    expect(screen.getByText('formulário de criação')).toBeInTheDocument();
  });

  it('sem formulário de criação não há botão de criar', () => {
    renderPage({ users: [] });

    expect(screen.queryByRole('button', { name: 'Criar agora' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Criar Conta' })).not.toBeInTheDocument();
  });

  it('mostra as ações extras na barra de ferramentas', () => {
    renderPage({ extraActions: <button>exportar</button> });
    expect(screen.getByRole('button', { name: 'exportar' })).toBeInTheDocument();
  });
});

describe('UserManagementPage — cards e tabela', () => {
  it('sem renderTableRow não existe alternância de visualização', () => {
    renderPage();
    expect(screen.queryByRole('group', { name: 'Modo de visualização' })).not.toBeInTheDocument();
  });

  it('alterna entre cards e tabela e lembra a escolha', async () => {
    renderPage(comTabela);
    expect(screen.getByRole('button', { name: 'Visualização em cards' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Nome', 'Tipo']);
    expect(screen.getByText('linha Pessoa 02')).toBeInTheDocument();
    expect(localStorage.getItem('raiz-do-bem:view-mode')).toBe('table');

    await userEvent.click(screen.getByRole('button', { name: 'Visualização em cards' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(localStorage.getItem('raiz-do-bem:view-mode')).toBe('cards');
  });

  it('abre direto na visualização salva', () => {
    localStorage.setItem('raiz-do-bem:view-mode', 'table');

    renderPage(comTabela);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('valor inválido salvo cai para cards', () => {
    localStorage.setItem('raiz-do-bem:view-mode', 'lixo');

    renderPage(comTabela);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('funciona com o localStorage bloqueado', async () => {
    const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    renderPage(comTabela);

    await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));

    expect(screen.getByRole('table')).toBeInTheDocument();
    get.mockRestore();
    set.mockRestore();
  });

  it('na tabela, clicar na linha abre os detalhes', async () => {
    renderPage(comTabela);
    await userEvent.click(screen.getByRole('button', { name: 'Visualização em tabela' }));

    await userEvent.click(screen.getByText('linha Pessoa 02'));

    expect(screen.getByText('detalhes de Pessoa 02')).toBeInTheDocument();
  });
});

describe('UserManagementPage — busca e filtros', () => {
  const comFiltro: Props = { users: itens(6), filterConfig: filtro };

  it('a busca filtra e informa a quantidade de resultados', async () => {
    renderPage(comFiltro);

    await userEvent.type(screen.getByLabelText('Pesquisar pessoas...'), 'pessoa 02');

    expect(screen.getByRole('button', { name: 'card Pessoa 02' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'card Pessoa 03' })).not.toBeInTheDocument();
    expect(screen.getByText('1 resultado encontrado.')).toBeInTheDocument();
  });

  it('plural quando há mais de um resultado', async () => {
    renderPage(comFiltro);

    await userEvent.type(screen.getByLabelText('Pesquisar pessoas...'), 'pessoa 0');

    expect(screen.getByText('6 resultados encontrados.')).toBeInTheDocument();
  });

  it('sem resultados mostra o estado vazio de filtro e "Limpar filtros e busca" restaura tudo', async () => {
    renderPage(comFiltro);
    await userEvent.type(screen.getByLabelText('Pesquisar pessoas...'), 'zzz');

    expect(screen.getAllByText('Nenhum resultado encontrado.').length).toBeGreaterThan(0);
    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros e busca' }));

    expect(screen.getByLabelText('Pesquisar pessoas...')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'card Pessoa 01' })).toBeInTheDocument();
  });

  it('filtro por grupo: abrir o painel, escolher e limpar', async () => {
    renderPage(comFiltro);

    await userEvent.click(screen.getByRole('button', { name: /Filtros/ }));
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');

    expect(screen.getAllByRole('button', { name: /^card/ })).toHaveLength(3);
    expect(screen.getByText('3 resultados encontrados.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(screen.getAllByRole('button', { name: /^card/ })).toHaveLength(6);
    expect(screen.queryByText(/resultados? encontrados?/)).not.toBeInTheDocument();
  });

  // Hoje o botão "Filtros" aparece (com painel vazio) mesmo sem grupos de filtro, porque
  // React.Children.count conta o `false` do "Limpar filtros". Ver UserManagementPage/Toolbar.
  it.todo('sem grupos de filtro não mostra o botão "Filtros"');
});

describe('UserManagementPage — criação', () => {
  it('"Criar Conta" abre o formulário num modal e o formulário pode fechá-lo', async () => {
    renderPage({ renderCreateForm: (close) => <button onClick={close}>salvar novo</button> });

    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    expect(screen.getByRole('button', { name: 'salvar novo' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'salvar novo' }));
    expect(screen.queryByRole('button', { name: 'salvar novo' })).not.toBeInTheDocument();
  });
});

describe('UserManagementPage — detalhes', () => {
  it('clicar no card abre os detalhes e grava o id na URL', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'card Pessoa 02' }));

    const dialogo = screen.getByRole('dialog');
    expect(within(dialogo).getByText('detalhes de Pessoa 02')).toBeInTheDocument();
    expect(screen.getByTestId('query')).toHaveTextContent('?id=2');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('abre direto pelo id presente na URL e marca o card como selecionado', () => {
    renderPage({}, '/lista?id=3');

    expect(screen.getByText('detalhes de Pessoa 03')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'card Pessoa 03' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('id inexistente na URL não abre nada', () => {
    renderPage({}, '/lista?id=999');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('o botão de fechar dos detalhes limpa o id da URL', async () => {
    renderPage({}, '/lista?id=1');

    await userEvent.click(screen.getByRole('button', { name: 'fechar detalhes' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('query')).toHaveTextContent('');
    expect(document.body.style.overflow).toBe('unset');
  });

  it('Escape fecha os detalhes', async () => {
    renderPage({}, '/lista?id=1');

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('outras teclas não fecham', async () => {
    renderPage({}, '/lista?id=1');

    await userEvent.keyboard('a');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('clicar no fundo escuro fecha; clicar no conteúdo não', async () => {
    renderPage({}, '/lista?id=1');

    await userEvent.click(screen.getByText('detalhes de Pessoa 01'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('move o foco para o modal ao abrir e devolve ao fechar', async () => {
    renderPage();
    const card = screen.getByRole('button', { name: 'card Pessoa 01' });
    card.focus();

    await userEvent.click(card);
    await waitFor(() => expect(screen.getByRole('dialog').firstElementChild).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(card).toHaveFocus());
  });
});

describe('UserManagementPage — paginação', () => {
  let scrollIntoView: jest.Mock;

  beforeEach(() => {
    scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
  });

  const cards = () => screen.getAllByRole('button', { name: /^card/ });

  it('mostra 12 por página e o resumo "Mostrando x–y de z"', () => {
    renderPage({ users: itens(30) });

    expect(cards()).toHaveLength(12);
    expect(screen.getByRole('status', { name: '' })).toBeDefined();
    expect(screen.getByText('Mostrando 1–12 de 30')).toBeInTheDocument();
  });

  it('o componente aparece mesmo com uma página só', () => {
    renderPage({ users: itens(3) });

    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1–3 de 3')).toBeInTheDocument();
  });

  it('não aparece quando a lista está vazia', () => {
    renderPage({ users: [] });
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
  });

  it('navega entre páginas e rola para o topo da lista', async () => {
    renderPage({ users: itens(30) });

    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(screen.getByText('Mostrando 13–24 de 30')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'card Pessoa 13' })).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    await userEvent.click(screen.getByRole('button', { name: 'Página 3' }));
    expect(cards()).toHaveLength(6);
  });

  it('respeita prefers-reduced-motion ao rolar', async () => {
    window.matchMedia = ((q: string) => ({ matches: true, media: q }) as MediaQueryList) as typeof window.matchMedia;
    renderPage({ users: itens(30) });

    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('buscar volta para a primeira página', async () => {
    renderPage({ users: itens(30), filterConfig: filtro });
    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }));
    expect(screen.getByText('Mostrando 13–24 de 30')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Pesquisar pessoas...'), 'pessoa 1');

    expect(screen.getByText(/Mostrando 1–/)).toBeInTheDocument();
  });

  it('um item selecionado em outra página continua abrindo os detalhes', () => {
    renderPage({ users: itens(30) }, '/lista?id=25');

    expect(screen.getByText('detalhes de Pessoa 25')).toBeInTheDocument();
  });
});
