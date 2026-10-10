import { useContext } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { CookieBanner } from '../../components/legal/CookieBanner';
import ConsentCheckbox from '../../components/legal/ConsentCheckbox';
import { ConsentSection, LegalLink } from '../../components/legal/ConsentSection';
import { EmailLink } from '../../components/legal/EmailLink';
import { GoogleMapEmbed } from '../../components/legal/GoogleMapEmbed';
import { CookieConsentContext, useCookieConsent } from '../../context/cookieConsent';
import { CookieConsentProvider } from '../../context/CookieConsentProvider';
import { COOKIE_CONSENT_MAX_AGE_MS, readCookieChoice, saveCookieChoice } from '../../lib/cookieConsent';

const comProvider = (ui: ReactNode) => (
  <MemoryRouter>
    <CookieConsentProvider>{ui}</CookieConsentProvider>
  </MemoryRouter>
);

beforeEach(() => localStorage.clear());

describe('ConsentCheckbox', () => {
  it('nasce desmarcada, o texto é o rótulo e clicar nele marca', async () => {
    render(<ConsentCheckbox name="aceite">Li e concordo</ConsentCheckbox>);

    const caixa = screen.getByRole('checkbox', { name: 'Li e concordo' });
    expect(caixa).not.toBeChecked();
    await userEvent.click(screen.getByText('Li e concordo'));
    expect(caixa).toBeChecked();
  });

  it('com erro: avisa leitores de tela e liga a mensagem ao campo', () => {
    render(
      <ConsentCheckbox name="aceite" error="Marque para enviar">
        Li e concordo
      </ConsentCheckbox>,
    );

    const caixa = screen.getByRole('checkbox');
    expect(caixa).toHaveAttribute('aria-invalid', 'true');
    expect(caixa).toHaveAttribute('aria-describedby', 'aceite-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Marque para enviar');
  });

  it('sem erro: não mostra alerta nem liga descrição', () => {
    render(<ConsentCheckbox name="aceite">Li e concordo</ConsentCheckbox>);

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('o tom escuro usa texto claro e o claro usa texto escuro', () => {
    const { rerender } = render(
      <ConsentCheckbox name="aceite" tone="dark" error="Erro">
        Texto
      </ConsentCheckbox>,
    );
    expect(screen.getByText('Texto')).toHaveClass('text-white');
    expect(screen.getByRole('alert')).toHaveClass('text-white');

    rerender(
      <ConsentCheckbox name="aceite" error="Erro">
        Texto
      </ConsentCheckbox>,
    );
    expect(screen.getByText('Texto')).toHaveClass('text-black');
    expect(screen.getByRole('alert')).toHaveClass('text-red-800');
  });

  it('aceita classes extras no campo', () => {
    render(
      <ConsentCheckbox name="aceite" className="minha-classe">
        Texto
      </ConsentCheckbox>,
    );
    expect(screen.getByRole('checkbox')).toHaveClass('minha-classe');
  });
});

describe('ConsentSection e LegalLink', () => {
  it('agrupa o resumo e as caixas sob uma legenda', () => {
    render(
      <ConsentSection resumo={<p>Resumo do aviso</p>}>
        <ConsentCheckbox name="a">Primeira</ConsentCheckbox>
      </ConsentSection>,
    );

    const grupo = screen.getByRole('group', { name: 'Autorização para uso dos seus dados' });
    expect(grupo).toHaveTextContent('Resumo do aviso');
    expect(screen.getByRole('checkbox', { name: 'Primeira' })).toBeInTheDocument();
  });

  it('aplica o tom escuro ao grupo', () => {
    render(
      <ConsentSection tone="dark" resumo="x">
        <span />
      </ConsentSection>,
    );
    expect(screen.getByRole('group')).toHaveClass('text-white');
  });

  it('LegalLink abre em nova aba e avisa isso aos leitores de tela', () => {
    render(<LegalLink to="/privacidade">Política</LegalLink>);

    const link = screen.getByRole('link', { name: 'Política (abre em nova aba)' });
    expect(link).toHaveAttribute('href', '/privacidade');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('LegalLink no tom escuro tem texto claro', () => {
    render(
      <LegalLink to="/x" tone="dark">
        Termo
      </LegalLink>,
    );
    expect(screen.getByRole('link')).toHaveClass('text-white');
  });
});

describe('EmailLink', () => {
  it('é um link mailto', () => {
    render(<EmailLink endereco="faleconosco@tdb.org.br" />);
    expect(screen.getByRole('link', { name: 'faleconosco@tdb.org.br' })).toHaveAttribute(
      'href',
      'mailto:faleconosco@tdb.org.br',
    );
  });
});

describe('CookieBanner', () => {
  it('na primeira visita aparece, sem roubar o foco, e explica o que é opcional', () => {
    render(comProvider(<CookieBanner />));

    const aviso = screen.getByRole('region', { name: 'Cookies e privacidade' });
    expect(aviso).toHaveTextContent('O mapa do Google só carrega se você permitir');
    expect(screen.getByRole('link', { name: /Saiba mais/ })).toHaveAttribute(
      'href',
      '/privacidade#cookies',
    );
    expect(document.activeElement).toBe(document.body);
  });

  it('recusar e aceitar têm o mesmo peso (mesma classe de tamanho) e nenhum vem marcado', () => {
    render(comProvider(<CookieBanner />));

    const recusar = screen.getByRole('button', { name: 'Recusar opcionais' });
    const aceitar = screen.getByRole('button', { name: 'Aceitar opcionais' });
    expect(recusar.className).toContain('min-h-[44px]');
    expect(aceitar.className).toContain('min-h-[44px]');
    expect(readCookieChoice()).toBeNull();
  });

  it('aceitar guarda a escolha e esconde o aviso', async () => {
    render(comProvider(<CookieBanner />));

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar opcionais' }));

    expect(screen.queryByRole('region', { name: 'Cookies e privacidade' })).not.toBeInTheDocument();
    expect(readCookieChoice()?.terceiros).toBe(true);
  });

  it('recusar guarda a escolha e esconde o aviso', async () => {
    render(comProvider(<CookieBanner />));

    await userEvent.click(screen.getByRole('button', { name: 'Recusar opcionais' }));

    expect(screen.queryByRole('region', { name: 'Cookies e privacidade' })).not.toBeInTheDocument();
    expect(readCookieChoice()?.terceiros).toBe(false);
  });

  it('com escolha válida salva, não volta a aparecer', () => {
    saveCookieChoice(true);

    render(comProvider(<CookieBanner />));

    expect(screen.queryByRole('region', { name: 'Cookies e privacidade' })).not.toBeInTheDocument();
  });

  it('escolha com mais de 12 meses pede de novo', () => {
    saveCookieChoice(true, new Date(Date.now() - COOKIE_CONSENT_MAX_AGE_MS - 60_000));

    render(comProvider(<CookieBanner />));

    expect(screen.getByRole('region', { name: 'Cookies e privacidade' })).toBeInTheDocument();
  });
});

describe('GoogleMapEmbed', () => {
  it('sem permissão, mostra o espaço reservado e não carrega o iframe do Google', () => {
    render(comProvider(<GoogleMapEmbed />));

    expect(screen.queryByTitle(/Mapa com a localização/)).not.toBeInTheDocument();
    expect(screen.getByText(/O mapa é fornecido pelo Google/)).toBeInTheDocument();
    const alternativa = screen.getByRole('link', { name: 'Abrir no Google Maps (nova aba)' });
    expect(alternativa).toHaveAttribute('target', '_blank');
    expect(alternativa).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('"Carregar o mapa agora" mostra o mapa só desta vez, sem gravar escolha', async () => {
    render(comProvider(<GoogleMapEmbed />));

    await userEvent.click(screen.getByRole('button', { name: 'Carregar o mapa agora' }));

    expect(screen.getByTitle(/Mapa com a localização/)).toHaveAttribute('src', expect.stringContaining('google.com/maps/embed'));
    expect(readCookieChoice()).toBeNull();
  });

  it('com cookies opcionais permitidos, o mapa carrega direto', () => {
    saveCookieChoice(true);

    render(comProvider(<GoogleMapEmbed className="mapa" />));

    expect(screen.getByTitle(/Mapa com a localização/)).toHaveClass('mapa');
  });

  it('com cookies opcionais recusados, continua pedindo permissão', () => {
    saveCookieChoice(false);

    render(comProvider(<GoogleMapEmbed />));

    expect(screen.queryByTitle(/Mapa com a localização/)).not.toBeInTheDocument();
  });

  it('"Mudar preferências de cookies" reabre o aviso e leva o foco até ele', async () => {
    saveCookieChoice(false);
    render(
      comProvider(
        <>
          <GoogleMapEmbed />
          <CookieBanner />
        </>,
      ),
    );
    expect(screen.queryByRole('region', { name: 'Cookies e privacidade' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Mudar preferências de cookies' }));

    expect(screen.getByRole('region', { name: 'Cookies e privacidade' })).toBeInTheDocument();
    expect(screen.getByText('Sua escolha atual: cookies opcionais recusados.')).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Cookies e privacidade' }));

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar opcionais' }));
    expect(screen.getByTitle(/Mapa com a localização/)).toBeInTheDocument();
  });

  it('ao reabrir depois de aceitar, o aviso mostra a escolha atual como "permitidos"', async () => {
    saveCookieChoice(true);
    const Reabrir = () => <button type="button" onClick={useCookieConsent().reabrir}>reabrir</button>;
    render(
      comProvider(
        <>
          <Reabrir />
          <GoogleMapEmbed />
          <CookieBanner />
        </>,
      ),
    );
    expect(screen.getByTitle(/Mapa com a localização/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mudar preferências de cookies' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'reabrir' }));

    expect(screen.getByText('Sua escolha atual: cookies opcionais permitidos.')).toBeInTheDocument();
  });
});

describe('sem o provider (componentes isolados)', () => {
  it('o mapa pede permissão e o botão de preferências não quebra', () => {
    render(<GoogleMapEmbed />);

    expect(screen.queryByTitle(/Mapa com a localização/)).not.toBeInTheDocument();
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Mudar preferências de cookies' }))).not.toThrow();
  });

  it('o aviso não aparece', () => {
    render(
      <MemoryRouter>
        <CookieBanner />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('region', { name: 'Cookies e privacidade' })).not.toBeInTheDocument();
  });

  it('as ações padrão do contexto são inofensivas', async () => {
    const Painel = () => {
      const contexto = useContext(CookieConsentContext);
      return (
        <>
          <button type="button" onClick={contexto.aceitar}>aceitar</button>
          <button type="button" onClick={contexto.recusar}>recusar</button>
          <button type="button" onClick={contexto.reabrir}>reabrir</button>
          <output>{`${contexto.aceitouTerceiros}|${contexto.escolha}|${contexto.aberto}`}</output>
        </>
      );
    };
    render(<Painel />);

    for (const nome of ['aceitar', 'recusar', 'reabrir']) {
      await userEvent.click(screen.getByRole('button', { name: nome }));
    }

    expect(screen.getByRole('status')).toHaveTextContent('false|null|false');
  });
});
