import { Suspense } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Footer from '../../components/footer/Footer';
import { CONTROLADOR } from '../../domain/legal/organizacao';
import { PublicLayout } from '../../layout/Layout';
import {
  PoliticaPrivacidadePage,
  TermoPedidoAjudaPage,
  TermoVoluntarioPage,
} from '../../pages/legal/LegalDocumentPage';
import { routes } from '../../Routes/Routes';

vi.mock('../../components/header/Header', () => ({ Header: () => <header data-testid="header" /> }));

const emRota = (ui: React.ReactNode) => <MemoryRouter>{ui}</MemoryRouter>;

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.doUnmock('../../domain/legal/organizacao');
  vi.resetModules();
});

/** Cada link do índice precisa apontar para uma seção que existe no documento. */
const verificarIndice = () => {
  const indice = screen.getByRole('navigation', { name: 'Índice do documento' });
  const links = within(indice).getAllByRole('link');
  expect(links.length).toBeGreaterThan(5);
  for (const link of links) {
    const id = link.getAttribute('href')!.slice(1);
    expect(document.getElementById(id), `seção #${id}`).not.toBeNull();
  }
};

describe('Política de Privacidade', () => {
  it('mostra o título, a versão, o aviso de validação e o índice completo', () => {
    render(emRota(<PoliticaPrivacidadePage />));

    expect(screen.getByRole('heading', { level: 1, name: 'Política de Privacidade' })).toBeInTheDocument();
    expect(screen.getByText(/Versão 1\.0/)).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Projeto acadêmico');
    verificarIndice();
  });

  it('identifica o controlador com os dados reais da Turma do Bem', () => {
    render(emRota(<PoliticaPrivacidadePage />));

    expect(screen.getByText(new RegExp(CONTROLADOR.cnpj.replace(/[./]/g, '\\$&')))).toBeInTheDocument();
    expect(screen.getAllByText(/Rua Maurício Francisco Klabin, 449/).length).toBeGreaterThan(0);
    for (const contato of CONTROLADOR.contatos) {
      expect(screen.getAllByRole('link', { name: contato.email })[0]).toHaveAttribute('href', `mailto:${contato.email}`);
    }
  });

  it('diz com franqueza que o encarregado ainda não foi divulgado e aponta o canal', () => {
    render(emRota(<PoliticaPrivacidadePage />));

    expect(screen.getByText(/ainda não divulgou um encarregado/)).toBeInTheDocument();
  });

  it('cobre as seções exigidas: dados, sensíveis e menores, compartilhamento, direitos, cookies', () => {
    render(emRota(<PoliticaPrivacidadePage />));

    for (const titulo of [
      /Quais dados tratamos e para quê/,
      /Dados sensíveis, crianças e adolescentes/,
      /Com quem compartilhamos/,
      /Transferência para fora do Brasil/,
      /Seus direitos/,
      /Cookies e armazenamento no navegador/,
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: titulo })).toBeInTheDocument();
    }
    expect(screen.getByText(/revogar o consentimento a qualquer momento/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'gov.br/anpd' })).toHaveAttribute('href', 'https://www.gov.br/anpd');
  });

  it('as tabelas têm legenda, cabeçalhos e a tabela de cookies lista os terceiros', () => {
    render(emRota(<PoliticaPrivacidadePage />));

    const tabelaCookies = screen.getByRole('table', { name: 'Cookies e armazenamento local' });
    expect(within(tabelaCookies).getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Item',
      'Para quê',
      'Quando',
      'Duração',
    ]);
    for (const item of [/^Google Maps/, /^YouTube \(youtube-nocookie/, /^VLibras \(/]) {
      expect(within(tabelaCookies).getByRole('cell', { name: item })).toBeInTheDocument();
    }
    expect(screen.getByRole('table', { name: 'Dados tratados, finalidades e bases legais' })).toBeInTheDocument();
  });
});

describe('Termo de Consentimento: Pedido de ajuda', () => {
  it('explica dados, finalidades, dados sensíveis, menores, recusa e versão', () => {
    render(emRota(<TermoPedidoAjudaPage />));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Termo de Consentimento — Pedido de ajuda' }),
    ).toBeInTheDocument();
    for (const titulo of [/Quais dados pedimos/, /Para que vamos usar/, /Dados sensíveis/, /Menores de 18 anos/, /E se eu não concordar/, /Versão deste termo/]) {
      expect(screen.getByRole('heading', { level: 2, name: titulo })).toBeInTheDocument();
    }
    expect(screen.getAllByText(/Dentista do Bem/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Apolônias do Bem/).length).toBeGreaterThan(0);
    verificarIndice();
  });

  it('liga à Política de Privacidade', () => {
    render(emRota(<TermoPedidoAjudaPage />));

    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/privacidade#compartilhamento');
  });
});

describe('Termo de Consentimento: Dentista voluntário', () => {
  it('explica dados, finalidades, compartilhamento com a pessoa encaminhada e recusa', () => {
    render(emRota(<TermoVoluntarioPage />));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Termo de Consentimento — Dentista voluntário' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Não pedimos dados sensíveis neste cadastro/)).toBeInTheDocument();
    expect(screen.getByText(/pessoa encaminhada poderá receber o seu nome/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /E se eu não concordar/ })).toBeInTheDocument();
    verificarIndice();
  });
});

describe('quando a ONG validar os documentos e designar um encarregado', () => {
  it('o aviso de validação some e o encarregado aparece', async () => {
    vi.resetModules();
    vi.doMock('../../domain/legal/organizacao', async () => ({
      ...(await vi.importActual<object>('../../domain/legal/organizacao')),
      DOCUMENTOS_VALIDADOS_PELA_ONG: true,
      ENCARREGADO: { nome: 'Fulana de Tal', email: 'privacidade@tdb.org.br' },
    }));
    const { PoliticaPrivacidadePage: Pagina } = await import('../../pages/legal/LegalDocumentPage');

    render(emRota(<Pagina />));

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.getByText('Fulana de Tal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'privacidade@tdb.org.br' })).toHaveAttribute('href', 'mailto:privacidade@tdb.org.br');
    expect(screen.queryByText(/ainda não divulgou um encarregado/)).not.toBeInTheDocument();
  });
});

describe('rotas e navegação', () => {
  it('os termos citados nos formulários existem na tabela de rotas', () => {
    const caminhos = routes.map((r) => r.path);
    expect(caminhos).toEqual(expect.arrayContaining(['/privacidade', '/consentimento/pedido-de-ajuda', '/consentimento/voluntario']));
  });

  it('as rotas legais têm título e descrição entre 120 e 160 caracteres (SEO)', () => {
    for (const rota of routes.filter((r) => r.path === '/privacidade' || r.path.startsWith('/consentimento/'))) {
      expect(rota.description, rota.path).toBeDefined();
      expect(rota.description!.length, rota.path).toBeGreaterThanOrEqual(120);
      expect(rota.description!.length, rota.path).toBeLessThanOrEqual(160);
    }
  });

  it('o rodapé lista a política, os dois termos e usa os dados oficiais de contato', () => {
    render(emRota(<Footer />));

    const privacidade = screen.getByRole('navigation', { name: 'Privacidade e termos' });
    expect(within(privacidade).getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/privacidade');
    expect(within(privacidade).getByRole('link', { name: 'Termo: Pedido de ajuda' })).toHaveAttribute('href', '/consentimento/pedido-de-ajuda');
    expect(within(privacidade).getByRole('link', { name: 'Termo: Dentista voluntário' })).toHaveAttribute('href', '/consentimento/voluntario');
    expect(screen.getByText(`Fone: ${CONTROLADOR.telefone}`)).toBeInTheDocument();
  });
});

describe('rotas legais carregadas pela tabela de rotas', () => {
  it.each([
    ['/privacidade', 'Política de Privacidade'],
    ['/consentimento/pedido-de-ajuda', 'Termo de Consentimento — Pedido de ajuda'],
    ['/consentimento/voluntario', 'Termo de Consentimento — Dentista voluntário'],
  ])('%s abre o documento certo', async (caminho, titulo) => {
    const rota = routes.find((r) => r.path === caminho)!;

    render(
      <MemoryRouter>
        <Suspense fallback={<p>carregando</p>}>{rota.element}</Suspense>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { level: 1, name: titulo })).toBeInTheDocument();
    expect(rota.title).toContain('Raiz do Bem');
  });
});

describe('PublicLayout: aviso de cookies', () => {
  const renderLayout = () =>
    render(
      <MemoryRouter initialEntries={['/x']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/x" element={<p>conteúdo da página</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

  it('aparece na primeira visita, some depois da escolha e volta pelo rodapé', async () => {
    renderLayout();
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Cookies e privacidade' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Recusar opcionais' }));
    expect(screen.queryByRole('region', { name: 'Cookies e privacidade' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Preferências de cookies' }));
    expect(screen.getByRole('region', { name: 'Cookies e privacidade' })).toBeInTheDocument();
  });
});

describe('botão Voltar dos documentos', () => {
  const Anterior = () => <p>página anterior</p>;
  const rotas = (inicial: string[], index: number) => (
    <MemoryRouter initialEntries={inicial} initialIndex={index}>
      <Routes>
        <Route path="/" element={<p>início</p>} />
        <Route path="/anterior" element={<Anterior />} />
        <Route path="/privacidade" element={<PoliticaPrivacidadePage />} />
      </Routes>
    </MemoryRouter>
  );

  it('volta para a página anterior do histórico', async () => {
    render(rotas(['/anterior', '/privacidade'], 1));
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(screen.getByText('página anterior')).toBeInTheDocument();
  });

  it('sem histórico (link direto), leva ao início', async () => {
    render(rotas(['/privacidade'], 0));
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(screen.getByText('início')).toBeInTheDocument();
  });
});
