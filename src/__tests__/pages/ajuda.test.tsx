import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Ajuda from '../../pages/ajuda/Ajuda';
import { BlocoAjuda } from '../../pages/ajuda/BlocoAjuda';
import { Lightbox } from '../../pages/ajuda/Lightbox';
import { Texto } from '../../pages/ajuda/texto';
import {
  ATALHOS,
  FLUXO_PEDIDO,
  INTRODUCAO,
  SECOES,
  TOTAL_FIGURAS,
  type Bloco,
  type Figura,
  type Secao,
} from '../../pages/ajuda/ajudaData';
import { filtrarSecoes, normalizar, semMarcacao, subtitulosDaSecao, textoIndexavel } from '../../pages/ajuda/busca';
import { AuthContext, type AuthContextValue } from '../../context/auth';

/* ───────────── Ajudantes ───────────── */

const auth = (role: 'ADMIN' | 'COLABORADOR' | null): AuthContextValue => ({
  user: role ? { email: 'u@x.com', nome: 'Usuária Teste', role, exp: 9999999999 } : null,
  isLoading: false,
  isAuthenticated: !!role,
  login: async () => {},
  logout: () => {},
});

const renderAjuda = (role: 'ADMIN' | 'COLABORADOR' | null = 'ADMIN', rota = '/admin/ajuda') =>
  render(
    <AuthContext.Provider value={auth(role)}>
      <MemoryRouter initialEntries={[rota]}>
        <Ajuda />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

const todasAsFiguras = (): Figura[] =>
  SECOES.flatMap((s) =>
    s.blocos.flatMap((b) => (b.tipo === 'figura' ? [b.figura] : b.tipo === 'figuras' ? b.figuras : [])),
  );

const idsDeDestino = (secoes: Secao[]) =>
  new Set(secoes.flatMap((s) => [s.id, ...subtitulosDaSecao(s).map((sub) => sub.id)]));

const secoesAdmin = SECOES.filter((s) => s.perfil === 'admin');
const secoesDeTodos = SECOES.filter((s) => s.perfil === 'todos');

const figuraDeTeste: Figura = {
  numero: 7,
  src: '/img/teste.webp',
  largura: 1600,
  altura: 1000,
  alt: 'Tela de teste',
  legenda: 'Tela usada no teste',
  marcas: ['Primeiro ponto: **botão**', 'Segundo ponto'],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.style.overflow = '';
});

/* ───────────── Conteúdo (dados) ───────────── */

describe('conteúdo do guia', () => {
  it('cada tópico tem id próprio, título, resumo e conteúdo', () => {
    const ids = SECOES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SECOES) {
      expect(s.titulo.trim()).not.toBe('');
      expect(s.resumo.trim()).not.toBe('');
      expect(s.blocos.length).toBeGreaterThan(0);
    }
  });

  it('os subtítulos têm id único e não repetem o id de um tópico nem os ids fixos da página', () => {
    const subIds = SECOES.flatMap((s) => subtitulosDaSecao(s).map((sub) => sub.id));
    expect(new Set(subIds).size).toBe(subIds.length);
    const secIds = new Set(SECOES.map((s) => s.id));
    expect(subIds.filter((id) => secIds.has(id))).toEqual([]);
    expect(subIds.filter((id) => id === 'indice' || id.startsWith('ajuda-'))).toEqual([]);
  });

  it('todo atalho leva a um destino que existe para quem o vê', () => {
    for (const a of ATALHOS) {
      const visiveis = a.perfil === 'admin' ? SECOES : secoesDeTodos;
      expect(idsDeDestino(visiveis), `atalho "${a.titulo}" → #${a.destino}`).toContain(a.destino);
    }
    const titulos = ATALHOS.map((a) => a.titulo);
    expect(new Set(titulos).size).toBe(titulos.length);
  });

  it('as imagens são numeradas em sequência e todas têm descrição, legenda e tamanho', () => {
    const figuras = todasAsFiguras();
    expect(figuras).toHaveLength(TOTAL_FIGURAS);
    expect(figuras.map((f) => f.numero)).toEqual(figuras.map((_, i) => i + 1));
    for (const f of figuras) {
      expect(f.src, `figura ${f.numero}`).toBeTruthy();
      expect(f.alt.trim(), `figura ${f.numero}`).not.toBe('');
      expect(f.legenda.trim(), `figura ${f.numero}`).not.toBe('');
      expect(f.largura).toBeGreaterThan(0);
      expect(f.altura).toBeGreaterThan(0);
      for (const marca of f.marcas ?? []) expect(marca.trim()).not.toBe('');
    }
  });

  it('o guia usa linguagem simples: sem os termos técnicos mais comuns', () => {
    const proibidos = /\b(modal|dropdown|api|backend|frontend|endpoint|jwt|token|payload|crud|deploy|json|cache|query|debug)\b/i;
    const texto = normalizar(semMarcacao(JSON.stringify(SECOES.map((s) => [s.titulo, s.resumo, s.blocos]))));
    expect(texto.match(proibidos)?.[0]).toBeUndefined();
  });

  it('as etapas do caminho de um pedido estão preenchidas', () => {
    expect(FLUXO_PEDIDO.length).toBeGreaterThanOrEqual(2);
    for (const e of FLUXO_PEDIDO) {
      expect(e.titulo).not.toBe('');
      expect(e.texto).not.toBe('');
    }
  });
});

/* ───────────── Busca ───────────── */

describe('busca', () => {
  it('normalizar tira acentos e põe em minúsculas', () => {
    expect(normalizar('PÉDIDO de Ajuda — Ação')).toBe('pedido de ajuda — acao');
  });

  it('semMarcacao remove só os asteriscos de negrito', () => {
    expect(semMarcacao('Clique em **Salvar** agora')).toBe('Clique em Salvar agora');
  });

  it('filtrarSecoes sem texto devolve a mesma lista', () => {
    expect(filtrarSecoes(SECOES, '')).toBe(SECOES);
    expect(filtrarSecoes(SECOES, '   ')).toBe(SECOES);
  });

  it('filtrarSecoes ignora acentos e maiúsculas e exige todas as palavras', () => {
    const porAcento = filtrarSecoes(SECOES, 'BENEFICIARIO');
    expect(porAcento.map((s) => s.id)).toContain('beneficiarios');
    const ambas = filtrarSecoes(SECOES, 'mapa simulador');
    expect(ambas.length).toBeGreaterThan(0);
    expect(ambas.length).toBeLessThanOrEqual(filtrarSecoes(SECOES, 'mapa').length);
    expect(filtrarSecoes(SECOES, 'mapa xyzxyzxyz')).toEqual([]);
  });

  it('a busca também encontra as palavras-chave do tópico (sinônimos)', () => {
    const comSinonimo = SECOES.find((s) => s.palavras.length > 0);
    expect(comSinonimo).toBeDefined();
    const [palavra] = comSinonimo!.palavras;
    expect(filtrarSecoes(SECOES, palavra).map((s) => s.id)).toContain(comSinonimo!.id);
  });

  it('textoIndexavel guarda o resultado e não inclui os asteriscos', () => {
    const s = SECOES[0];
    const primeiro = textoIndexavel(s);
    expect(textoIndexavel(s)).toBe(primeiro);
    expect(primeiro).not.toContain('**');
  });

  it('subtitulosDaSecao devolve só os subtítulos, na ordem', () => {
    const s: Secao = {
      id: 'x',
      titulo: 'X',
      resumo: 'r',
      perfil: 'todos',
      palavras: [],
      blocos: [
        { tipo: 'texto', texto: 't' },
        { tipo: 'subtitulo', id: 'a', titulo: 'A' },
        { tipo: 'subtitulo', id: 'b', titulo: 'B' },
      ],
    };
    expect(subtitulosDaSecao(s)).toEqual([
      { id: 'a', titulo: 'A' },
      { id: 'b', titulo: 'B' },
    ]);
  });
});

/* ───────────── Texto com negrito ───────────── */

describe('Texto', () => {
  it('transforma **trechos** em negrito', () => {
    const { container } = render(<Texto>{'Clique em **Salvar** e depois em **Fechar**.'}</Texto>);
    const negritos = [...container.querySelectorAll('strong')].map((n) => n.textContent);
    expect(negritos).toEqual(['Salvar', 'Fechar']);
    expect(container).toHaveTextContent('Clique em Salvar e depois em Fechar.');
  });

  it('texto sem marcação sai como está', () => {
    const { container } = render(<Texto>Só texto comum</Texto>);
    expect(container.querySelector('strong')).toBeNull();
    expect(container).toHaveTextContent('Só texto comum');
  });
});

/* ───────────── Blocos ───────────── */

describe('BlocoAjuda', () => {
  const desenhar = (bloco: Bloco) => render(<BlocoAjuda bloco={bloco} />);

  it('texto, subtítulo e chamadas (dica e atenção)', () => {
    desenhar({ tipo: 'texto', texto: 'Um **parágrafo**.' });
    desenhar({ tipo: 'subtitulo', id: 'meu-sub', titulo: 'Meu subtítulo' });
    desenhar({ tipo: 'dica', texto: 'Use a **busca**.' });
    desenhar({ tipo: 'atencao', texto: 'Cuidado.' });

    expect(screen.getByText('parágrafo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Meu subtítulo' })).toHaveAttribute('id', 'meu-sub');
    expect(screen.getByRole('note', { name: 'Dica' })).toHaveTextContent('Dica: Use a busca.');
    expect(screen.getByRole('note', { name: 'Atenção' })).toHaveTextContent('Atenção: Cuidado.');
  });

  it('passos e lista: com e sem título, mantendo a ordem', () => {
    desenhar({ tipo: 'passos', titulo: 'Como fazer', itens: ['Primeiro', 'Segundo'] });
    desenhar({ tipo: 'passos', itens: ['Solto'] });
    desenhar({ tipo: 'lista', titulo: 'Itens', itens: ['Um', 'Dois'] });
    desenhar({ tipo: 'lista', itens: ['Sem título'] });

    expect(screen.getByText('Como fazer')).toBeInTheDocument();
    expect(screen.getByText('Itens')).toBeInTheDocument();
    const listas = screen.getAllByRole('list');
    expect(within(listas[0]).getAllByRole('listitem').map((i) => i.textContent)).toEqual(['1Primeiro', '2Segundo']);
    expect(within(listas[1]).getAllByRole('listitem')).toHaveLength(1);
    expect(within(listas[2]).getAllByRole('listitem').map((i) => i.textContent)).toEqual(['Um', 'Dois']);
    expect(screen.getByText('Sem título')).toBeInTheDocument();
  });

  it('figura mostra imagem, legenda numerada e a explicação de cada número azul', () => {
    desenhar({ tipo: 'figura', figura: figuraDeTeste });

    const img = screen.getByRole('img', { name: 'Tela de teste' });
    expect(img).toHaveAttribute('src', '/img/teste.webp');
    expect(img).toHaveAttribute('width', '1600');
    expect(screen.getByText('Figura 7 — Tela usada no teste')).toBeInTheDocument();
    const marcas = screen.getAllByRole('listitem');
    expect(marcas).toHaveLength(2);
    expect(marcas[0]).toHaveTextContent('1Primeiro ponto: botão');
    expect(marcas[1]).toHaveTextContent('2Segundo ponto');
  });

  it('figura sem marcas não mostra lista; imagem estreita não é esticada', () => {
    const { container } = desenhar({
      tipo: 'figura',
      figura: { ...figuraDeTeste, largura: 390, altura: 844, marcas: undefined },
    });

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(container.querySelector('figure')).toHaveStyle({ maxWidth: '390px' });
  });

  it('figuras lado a lado mostra todas', () => {
    desenhar({
      tipo: 'figuras',
      figuras: [figuraDeTeste, { ...figuraDeTeste, numero: 8, alt: 'Outra tela', legenda: 'Outra' }],
    });

    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText('Figura 8 — Outra')).toBeInTheDocument();
  });

  it('tabela com mais de duas colunas repete o nome da coluna em cada célula (para o celular)', () => {
    desenhar({
      tipo: 'tabela',
      legenda: 'Quem pode o quê',
      colunas: ['Ação', 'Administrador', 'Colaborador'],
      linhas: [['Aprovar pedidos', 'Sim', 'Sim']],
    });

    const tabela = screen.getByRole('table', { name: 'Quem pode o quê' });
    expect(within(tabela).getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Ação',
      'Administrador',
      'Colaborador',
    ]);
    expect(within(tabela).getByRole('rowheader')).toHaveTextContent('Aprovar pedidos');
    const celulas = within(tabela).getAllByRole('cell');
    expect(celulas.map((c) => c.getAttribute('data-rotulo'))).toEqual(['Administrador: ', 'Colaborador: ']);
  });

  it('tabela de duas colunas não repete o nome da coluna', () => {
    desenhar({
      tipo: 'tabela',
      legenda: 'Significados',
      colunas: ['Item', 'Para que serve'],
      linhas: [['Painel', 'Consultar']],
    });

    expect(screen.getByRole('cell')).not.toHaveAttribute('data-rotulo');
  });

  it('caminho de etapas numerado', () => {
    desenhar({ tipo: 'fluxo', titulo: 'O caminho', etapas: [{ titulo: 'Início', texto: 'Começa' }, { titulo: 'Fim', texto: 'Termina' }] });

    expect(screen.getByText('O caminho')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((i) => i.textContent)).toEqual(['1Início' + 'Começa', '2Fim' + 'Termina']);
  });

  it('perguntas frequentes: cada pergunta é um item que abre para mostrar a resposta', () => {
    const { container } = desenhar({
      tipo: 'perguntas',
      itens: [
        { pergunta: 'Como entro?', resposta: 'Com **e-mail** e senha.' },
        { pergunta: 'Como saio?', resposta: 'Pelo botão **Sair da Conta**.' },
      ],
    });

    const itens = container.querySelectorAll('details');
    expect(itens).toHaveLength(2);
    expect(itens[0].querySelector('summary')).toHaveTextContent('Como entro?');
    expect(itens[0]).toHaveTextContent('Com e-mail e senha.');
    expect(itens[1].querySelector('strong')).toHaveTextContent('Sair da Conta');
  });

  it('definições listam termo e significado', () => {
    const { container } = desenhar({ tipo: 'definicoes', itens: [{ termo: 'CRO', significado: 'Registro do dentista.' }] });

    expect(container.querySelector('dt')).toHaveTextContent('CRO');
    expect(container.querySelector('dd')).toHaveTextContent('Registro do dentista.');
  });
});

/* ───────────── Imagem ampliada ───────────── */

describe('Lightbox', () => {
  it('clicar na imagem abre a ampliação; Esc fecha e devolve o foco à imagem', async () => {
    render(<BlocoAjuda bloco={{ tipo: 'figura', figura: figuraDeTeste }} />);
    const abrir = screen.getByRole('button', { name: /Tela de teste/ });

    await userEvent.click(abrir);
    const janela = screen.getByRole('dialog', { name: 'Imagem ampliada. Tela de teste' });
    expect(janela).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar imagem' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(abrir).toHaveFocus();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('o botão "Fechar imagem" e o clique fora da imagem fecham; clicar na imagem não fecha', async () => {
    render(<BlocoAjuda bloco={{ tipo: 'figura', figura: figuraDeTeste }} />);
    const abrir = () => userEvent.click(screen.getByRole('button', { name: /Tela de teste/ }));

    await abrir();
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('img'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar imagem' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await abrir();
    await userEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Tab mantém o foco no botão de fechar', async () => {
    render(<Lightbox src="/x.webp" alt="Imagem" onClose={() => {}} />);

    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Fechar imagem' })).toHaveFocus();
  });

  it('imagem larga ganha largura mínima no celular; imagem estreita não', () => {
    const { rerender } = render(<Lightbox src="/x.webp" alt="Larga" largura={1600} onClose={() => {}} />);
    expect(screen.getByRole('img', { name: 'Larga' }).className).toContain('w-[900px]');

    rerender(<Lightbox src="/x.webp" alt="Estreita" largura={390} onClose={() => {}} />);
    expect(screen.getByRole('img', { name: 'Estreita' }).className).not.toContain('w-[900px]');

    rerender(<Lightbox src="/x.webp" alt="Sem medida" onClose={() => {}} />);
    expect(screen.getByRole('img', { name: 'Sem medida' }).className).not.toContain('w-[900px]');
  });
});

/* ───────────── Página ───────────── */

describe('página Como usar a plataforma — administrador', () => {
  it('mostra boas-vindas, busca, atalhos, índice e todos os tópicos', () => {
    renderAjuda('ADMIN');

    expect(screen.getByRole('heading', { level: 2, name: /Bem-vindo\(a\) à plataforma Raiz do Bem/ })).toBeInTheDocument();
    expect(screen.getByText(INTRODUCAO.boasVindas)).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByLabelText('Procurar um assunto')).toBeInTheDocument();

    const atalhos = screen.getByRole('region', { name: 'O que você quer fazer?' });
    expect(within(atalhos).getAllByRole('link')).toHaveLength(ATALHOS.length);

    const indice = screen.getByRole('navigation', { name: 'Índice do guia' });
    expect(within(indice).getAllByRole('link').map((a) => a.textContent)).toEqual(SECOES.map((s) => s.titulo));
    for (const s of SECOES) {
      expect(document.getElementById(s.id)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: s.titulo })).toBeInTheDocument();
    }
  });

  it('cada link do índice e cada atalho aponta para um elemento que existe na página', () => {
    renderAjuda('ADMIN');

    const links = [
      ...within(screen.getByRole('navigation', { name: 'Índice do guia' })).getAllByRole('link'),
      ...within(screen.getByRole('region', { name: 'O que você quer fazer?' })).getAllByRole('link'),
    ];
    for (const link of links) {
      const id = link.getAttribute('href')!.slice(1);
      expect(document.getElementById(id), `#${id}`).toBeInTheDocument();
    }
  });

  it('marca os tópicos exclusivos de administradores', () => {
    renderAjuda('ADMIN');

    expect(screen.getAllByText('Somente administradores')).toHaveLength(secoesAdmin.length);
  });

  it('mostra todas as imagens do guia, cada uma com a sua legenda', () => {
    renderAjuda('ADMIN');

    expect(screen.getAllByRole('img')).toHaveLength(TOTAL_FIGURAS);
    for (const f of todasAsFiguras()) {
      expect(screen.getByText(`Figura ${f.numero} — ${f.legenda}`)).toBeInTheDocument();
    }
  });

  it('"Neste tópico" lista os subtítulos de cada tópico que tem mais de um', () => {
    renderAjuda('ADMIN');

    const comVarios = SECOES.filter((s) => subtitulosDaSecao(s).length > 1);
    expect(comVarios.length).toBeGreaterThan(0);
    for (const secao of comVarios) {
      const cabecalho = document.getElementById(secao.id)!.querySelector('header')!;
      const chips = within(cabecalho).getAllByRole('link');
      expect(chips.map((c) => c.textContent)).toEqual(subtitulosDaSecao(secao).map((sub) => sub.titulo));
      expect(chips.map((c) => c.getAttribute('href'))).toEqual(subtitulosDaSecao(secao).map((sub) => `#${sub.id}`));
    }
  });

  it('abre direto no ponto do endereço (#tópico) e ignora ids que não existem', () => {
    const rolados: string[] = [];
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(function (this: Element) {
      rolados.push(this.id);
    });
    const destino = ATALHOS.find((a) => a.perfil === 'todos' && a.destino !== 'primeiros-passos')!.destino;

    const { unmount } = renderAjuda('ADMIN', `/admin/ajuda#${destino}`);
    expect(rolados).toEqual([destino]);
    unmount();

    rolados.length = 0;
    renderAjuda('ADMIN', '/admin/ajuda#nao-existe');
    expect(rolados).toEqual([]);
  });

  it('um endereço com "#" mal formado não derruba a página', () => {
    renderAjuda('ADMIN', '/admin/ajuda#%E0%A4%A');

    expect(screen.getByRole('heading', { level: 2, name: SECOES[0].titulo })).toBeInTheDocument();
  });
});

describe('página Como usar a plataforma — colaborador', () => {
  it('não mostra os tópicos nem os atalhos exclusivos de administradores', () => {
    renderAjuda('COLABORADOR', '/coord/ajuda');

    const indice = screen.getByRole('navigation', { name: 'Índice do guia' });
    expect(within(indice).getAllByRole('link').map((a) => a.textContent)).toEqual(secoesDeTodos.map((s) => s.titulo));
    for (const s of secoesAdmin) expect(document.getElementById(s.id)).not.toBeInTheDocument();
    expect(screen.queryByText('Somente administradores')).not.toBeInTheDocument();

    const atalhos = screen.getByRole('region', { name: 'O que você quer fazer?' });
    expect(within(atalhos).getAllByRole('link')).toHaveLength(ATALHOS.filter((a) => a.perfil === 'todos').length);
    for (const a of ATALHOS.filter((x) => x.perfil === 'admin')) {
      expect(within(atalhos).queryByText(a.titulo)).not.toBeInTheDocument();
    }
  });

  it('sem usuário no contexto, trata como colaborador (não mostra nada de administrador)', () => {
    renderAjuda(null);

    for (const s of secoesAdmin) expect(document.getElementById(s.id)).not.toBeInTheDocument();
  });

  it('todos os links do índice e dos atalhos continuam apontando para algo que existe', () => {
    renderAjuda('COLABORADOR', '/coord/ajuda');

    const links = [
      ...within(screen.getByRole('navigation', { name: 'Índice do guia' })).getAllByRole('link'),
      ...within(screen.getByRole('region', { name: 'O que você quer fazer?' })).getAllByRole('link'),
    ];
    for (const link of links) {
      const id = link.getAttribute('href')!.slice(1);
      expect(document.getElementById(id), `#${id}`).toBeInTheDocument();
    }
  });
});

describe('página Como usar a plataforma — busca', () => {
  const caixa = () => screen.getByLabelText('Procurar um assunto');

  it('filtra os tópicos, avisa quantos achou e esconde os atalhos enquanto procura', async () => {
    renderAjuda('ADMIN');
    const esperados = filtrarSecoes(SECOES, 'MAPA');

    await userEvent.type(caixa(), 'MAPA');

    const aviso = esperados.length === 1 ? '1 tópico encontrado.' : `${esperados.length} tópicos encontrados.`;
    expect(document.getElementById('ajuda-busca-status')).toHaveTextContent(aviso);
    expect(screen.queryByRole('region', { name: 'O que você quer fazer?' })).not.toBeInTheDocument();
    const indice = screen.getByRole('navigation', { name: 'Índice do guia' });
    expect(within(indice).getAllByRole('link').map((a) => a.textContent)).toEqual(esperados.map((s) => s.titulo));
  });

  it('um único resultado usa o singular', async () => {
    renderAjuda('ADMIN');

    await userEvent.type(caixa(), 'simulador');

    expect(filtrarSecoes(SECOES, 'simulador')).toHaveLength(1);
    expect(document.getElementById('ajuda-busca-status')).toHaveTextContent('1 tópico encontrado.');
  });

  it('"Limpar" volta a mostrar tudo', async () => {
    renderAjuda('ADMIN');
    await userEvent.type(caixa(), 'senha');
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(caixa()).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'O que você quer fazer?' })).toBeInTheDocument();
    expect(document.getElementById('ajuda-busca-status')).toBeEmptyDOMElement();
  });

  it('sem resultado mostra o aviso, sugere palavras mais simples e permite ver tudo de novo', async () => {
    renderAjuda('ADMIN');

    await userEvent.type(caixa(), 'zzzzzz');

    expect(document.getElementById('ajuda-busca-status')).toHaveTextContent('Nenhum tópico encontrado.');
    expect(screen.getByText('Nenhum tópico corresponde à busca.')).toBeInTheDocument();
    expect(screen.getByText(/Não encontramos nenhum tópico com/)).toHaveTextContent('“zzzzzz”');
    SECOES.forEach((s) => expect(document.getElementById(s.id)).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Ver todos os tópicos' }));

    expect(caixa()).toHaveValue('');
    expect(document.getElementById(SECOES[0].id)).toBeInTheDocument();
  });

  it('a busca de colaborador não encontra tópicos de administrador', async () => {
    renderAjuda('COLABORADOR', '/coord/ajuda');

    await userEvent.type(caixa(), 'simulador');

    expect(document.getElementById('ajuda-busca-status')).toHaveTextContent('Nenhum tópico encontrado.');
  });
});

describe('página Como usar a plataforma — índice', () => {
  it('no celular o índice abre e fecha pelo botão e fecha ao escolher um tópico', async () => {
    renderAjuda('ADMIN');
    const botao = screen.getByRole('button', { name: /Índice do guia/ });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('navigation', { name: 'Índice do guia' })).toHaveClass('hidden');

    await userEvent.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Índice do guia' })).toHaveClass('block');

    await userEvent.click(within(screen.getByRole('navigation', { name: 'Índice do guia' })).getAllByRole('link')[1]);
    expect(botao).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(botao);
    await userEvent.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'false');
  });

  it('"Voltar ao índice" no fim de cada tópico abre o índice no celular', async () => {
    renderAjuda('ADMIN');
    const voltar = screen.getAllByRole('link', { name: /Voltar ao índice/ });
    expect(voltar).toHaveLength(SECOES.length);
    expect(voltar[0]).toHaveAttribute('href', '#indice');

    await userEvent.click(voltar[2]);

    expect(screen.getByRole('button', { name: /Índice do guia/ })).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('página Como usar a plataforma — tópico em destaque no índice', () => {
  type Observador = { callback: IntersectionObserverCallback; observados: Element[]; desconectado: boolean };

  const instalarObservador = () => {
    const criados: Observador[] = [];
    class FalsoObservador {
      private estado: Observador;
      constructor(callback: IntersectionObserverCallback) {
        this.estado = { callback, observados: [], desconectado: false };
        criados.push(this.estado);
      }
      observe(el: Element) {
        this.estado.observados.push(el);
      }
      unobserve() {}
      disconnect() {
        this.estado.desconectado = true;
      }
      takeRecords() {
        return [];
      }
    }
    vi.stubGlobal('IntersectionObserver', FalsoObservador);
    return criados;
  };

  const avisar = (obs: Observador, id: string, noVisor: boolean) =>
    act(() => {
      obs.callback([{ isIntersecting: noVisor, target: document.getElementById(id)! } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    });

  const atual = () =>
    within(screen.getByRole('navigation', { name: 'Índice do guia' }))
      .getAllByRole('link')
      .find((a) => a.getAttribute('aria-current') === 'location')?.textContent;

  it('observa todos os tópicos e destaca o primeiro que está na tela', () => {
    const criados = instalarObservador();
    renderAjuda('ADMIN');

    expect(criados).toHaveLength(1);
    expect(criados[0].observados.map((e) => e.id)).toEqual(SECOES.map((s) => s.id));
    expect(atual()).toBe(SECOES[0].titulo);

    avisar(criados[0], SECOES[3].id, true);
    expect(atual()).toBe(SECOES[3].titulo);

    avisar(criados[0], SECOES[2].id, true);
    expect(atual()).toBe(SECOES[2].titulo);
  });

  it('ao voltar para o começo da página, destaca de novo o primeiro tópico', () => {
    const criados = instalarObservador();
    renderAjuda('ADMIN');
    avisar(criados[0], SECOES[3].id, true);
    expect(atual()).toBe(SECOES[3].titulo);

    vi.spyOn(document.getElementById(SECOES[0].id)!, 'getBoundingClientRect').mockReturnValue({ top: 120 } as DOMRect);
    avisar(criados[0], SECOES[3].id, false);

    expect(atual()).toBe(SECOES[0].titulo);
  });

  it('quando nenhum tópico está na tela e o primeiro já passou, mantém o destaque', () => {
    const criados = instalarObservador();
    renderAjuda('ADMIN');
    avisar(criados[0], SECOES[3].id, true);

    vi.spyOn(document.getElementById(SECOES[0].id)!, 'getBoundingClientRect').mockReturnValue({ top: -500 } as DOMRect);
    avisar(criados[0], SECOES[3].id, false);

    expect(atual()).toBe(SECOES[3].titulo);
  });

  it('refaz a observação quando a busca muda a lista e para de observar ao sair', async () => {
    const criados = instalarObservador();
    const { unmount } = renderAjuda('ADMIN');

    await userEvent.type(screen.getByLabelText('Procurar um assunto'), 'mapa');
    const ultimo = criados[criados.length - 1];
    expect(criados[0].desconectado).toBe(true);
    expect(ultimo.observados.map((e) => e.id)).toEqual(filtrarSecoes(SECOES, 'mapa').map((s) => s.id));

    unmount();
    expect(ultimo.desconectado).toBe(true);
  });

  it('sem resultados todos os observadores são desligados', async () => {
    const criados = instalarObservador();
    renderAjuda('ADMIN');

    await userEvent.type(screen.getByLabelText('Procurar um assunto'), 'zzzzzz');

    expect(criados.length).toBeGreaterThan(0);
    expect(criados.every((o) => o.desconectado)).toBe(true);
  });

  it('em navegador sem IntersectionObserver a página continua funcionando', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    renderAjuda('ADMIN');

    expect(screen.getByRole('heading', { level: 2, name: SECOES[0].titulo })).toBeInTheDocument();
  });
});
