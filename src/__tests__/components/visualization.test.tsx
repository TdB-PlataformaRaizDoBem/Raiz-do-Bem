import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from '../../components/animation/Counter';
import { Reveal } from '../../components/animation/Reveal';
import { StoryScroller, type StoryPanel } from '../../components/animation/StoryScroller';
import { SlideCarousel } from '../../components/carousel/SlideCarousel';
import ImpactChart from '../../components/impactChart/ImpactChart';
import { OrdersStatusBarChart } from '../../components/orderStatusBarChart/OrderStatusBarChart';
import { CriticalOrdersList } from '../../components/pendingOrdersList/PendingOrdersList';
import { StateRanking } from '../../components/StateRanking/StateRanking';
import { gsap, motionQuery, ScrollTrigger } from '../../lib/gsap';
import { beneficiarioApi, pedidoApi } from '../../test/factories';
import { resetGsapMock, runMatchMedia } from '../../test/gsapMock';
import { installFetch, routeFetch } from '../../test/http';

jest.mock('../../lib/gsap', () => jest.requireActual('../../test/gsapMock'));
jest.mock('@gsap/react', () => ({ useGSAP: jest.requireActual<{ useGSAP: unknown }>('../../test/gsapMock').useGSAP }));

const painel = (n: number): StoryPanel => ({
  eyebrow: `Etapa ${n}`,
  lines: [`Linha A${n}`, `Linha B${n}`],
  text: `Texto ${n}`,
  image: `img${n}.png`,
  imageAlt: `Imagem ${n}`,
});

beforeEach(() => {
  resetGsapMock();
});

/* ───────────── gráficos do dashboard ───────────── */

describe('ImpactChart', () => {
  it('mostra o total e a proporção entre os programas', async () => {
    routeFetch(installFetch(), {
      '/beneficiario': [
        beneficiarioApi({ id: 1, programaSocial: 'DENTISTA_DO_BEM' }),
        beneficiarioApi({ id: 2, programaSocial: 'DENTISTA_DO_BEM' }),
        beneficiarioApi({ id: 3, programaSocial: 'DENTISTA_DO_BEM' }),
        beneficiarioApi({ id: 4, programaSocial: 'APOLONIAS_DO_BEM' }),
      ],
    });

    render(<ImpactChart />);

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(screen.getByText('(75%)')).toBeInTheDocument();
    expect(screen.getByText('(25%)')).toBeInTheDocument();
    expect(screen.getByText('Proporção de Beneficiários')).toBeInTheDocument();
  });

  it('sem beneficiários: zero e 0%', async () => {
    routeFetch(installFetch(), { '/beneficiario': [] });

    render(<ImpactChart />);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(screen.getByText('Total').previousSibling).toHaveTextContent('0');
    expect(screen.getAllByText('(0%)')).toHaveLength(2);
  });
});

describe('OrdersStatusBarChart', () => {
  it('ordena do maior para o menor e mostra o percentual de cada status', async () => {
    routeFetch(installFetch(), {
      '/pedido-ajuda': [
        pedidoApi({ id: 1, status: 'APROVADO' }),
        pedidoApi({ id: 2, status: 'APROVADO' }),
        pedidoApi({ id: 3, status: 'APROVADO' }),
        pedidoApi({ id: 4, status: 'PENDENTE' }),
      ],
    });

    render(<OrdersStatusBarChart />);

    await waitFor(() => expect(screen.getByText('Total: 4')).toBeInTheDocument());
    const rotulos = ['Aprovados', 'Pendentes', 'Negados'].map((t) => screen.getByText(t));
    // ordem no DOM: Aprovados (3) antes de Pendentes (1) antes de Negados (0)
    expect(rotulos[0].compareDocumentPosition(rotulos[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(rotulos[1].compareDocumentPosition(rotulos[2]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('sem pedidos: total 0 e 0% (sem dividir por zero)', async () => {
    routeFetch(installFetch(), { '/pedido-ajuda': [] });

    render(<OrdersStatusBarChart />);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getAllByText('0%')).toHaveLength(3);
  });
});

describe('CriticalOrdersList', () => {
  it('lista os pendentes mais antigos primeiro', async () => {
    routeFetch(installFetch(), {
      '/pedido-ajuda': [
        pedidoApi({ id: 2, nomeCompleto: 'Recente', status: 'PENDENTE', dataPedido: '2026-03-20' }),
        pedidoApi({ id: 1, nomeCompleto: 'Antigo', status: 'PENDENTE', dataPedido: '2026-01-02', descricaoProblema: 'Dente quebrado' }),
        pedidoApi({ id: 3, nomeCompleto: 'Aprovado', status: 'APROVADO' }),
      ],
    });

    render(<CriticalOrdersList />);

    await screen.findByText('Antigo');
    const nomes = screen.getAllByText(/^(Antigo|Recente)$/).map((n) => n.textContent);
    expect(nomes).toEqual(['Antigo', 'Recente']);
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Dente quebrado')).toBeInTheDocument();
    expect(screen.getByText('02/01/2026')).toBeInTheDocument();
    expect(screen.queryByText('Aprovado')).not.toBeInTheDocument();
  });
});

describe('StateRanking', () => {
  it('mostra posição, estado, quantidade e percentual; o primeiro em destaque', () => {
    render(
      <StateRanking
        rankingEstado={[
          { uf: 'SP', qtd: 10, percent: 62.5 },
          { uf: 'RJ', qtd: 6, percent: 37.5 },
        ]}
      />,
    );

    expect(screen.getByText('SP')).toHaveClass('text-darkgreen');
    expect(screen.getByText('RJ')).not.toHaveClass('text-darkgreen');
    expect(screen.getByText('62.5%')).toBeInTheDocument();
    expect(screen.getByText('37.5%')).toBeInTheDocument();
    expect(screen.getByText('Top 5')).toBeInTheDocument();
    expect(screen.queryByText('Nenhum dado disponível')).not.toBeInTheDocument();
  });

  it('sem dados mostra a mensagem de vazio', () => {
    render(<StateRanking rankingEstado={[]} />);
    expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument();
  });
});

/* ───────────── SlideCarousel ───────────── */

describe('SlideCarousel', () => {
  const painéis = [painel(1), painel(2), painel(3)];

  const slides = () => Array.from(document.querySelectorAll('[aria-hidden]')).filter((e) => e.getAttribute('class')?.includes('snap-center'));
  const rect = (left: number, width: number) => () => ({ left, width, right: left + width, top: 0, bottom: 0, height: 0, x: left, y: 0 }) as DOMRect;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('renderiza todos os slides, setas e pontos; o primeiro começa ativo', () => {
    render(<SlideCarousel panels={painéis} />);

    expect(screen.getByRole('region', { name: 'Histórias em destaque' })).toBeInTheDocument();
    expect(screen.getByText('Linha A1 Linha B1')).toBeInTheDocument();
    expect(screen.getByText('Texto 3')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Ir para o slide/ })).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Ir para o slide 1: Etapa 1/ })).toHaveAttribute('aria-current', 'true');
    expect(slides().map((s) => s.getAttribute('aria-hidden'))).toEqual(['false', 'true', 'true']);
  });

  it('clicar num ponto ativa e centraliza o slide', async () => {
    render(<SlideCarousel panels={painéis} />);

    await userEvent.click(screen.getByRole('button', { name: /Ir para o slide 3/ }));

    expect(screen.getByRole('button', { name: /Ir para o slide 3/ })).toHaveAttribute('aria-current', 'true');
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });

  it('"Próximo" avança e volta ao início depois do último', async () => {
    render(<SlideCarousel panels={painéis} />);

    await userEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
    expect(screen.getByRole('button', { name: /slide 2/ })).toHaveAttribute('aria-current', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
    await userEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
    expect(screen.getByRole('button', { name: /slide 1/ })).toHaveAttribute('aria-current', 'true');
  });

  it('"Anterior" no primeiro vai para o último', async () => {
    render(<SlideCarousel panels={painéis} />);

    await userEvent.click(screen.getByRole('button', { name: 'Slide anterior' }));
    expect(screen.getByRole('button', { name: /slide 3/ })).toHaveAttribute('aria-current', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Slide anterior' }));
    expect(screen.getByRole('button', { name: /slide 2/ })).toHaveAttribute('aria-current', 'true');
  });

  it('ao rolar, ativa o slide cujo centro está mais perto do centro da trilha', () => {
    jest.useFakeTimers();
    render(<SlideCarousel panels={painéis} />);
    const track = screen.getByRole('region');
    track.getBoundingClientRect = rect(0, 1000); // centro 500
    const els = slides() as HTMLElement[];
    els[0].getBoundingClientRect = rect(-900, 400); // centro -700
    els[1].getBoundingClientRect = rect(-300, 400); // centro -100
    els[2].getBoundingClientRect = rect(350, 300); // centro 500  ← mais perto

    fireEvent.scroll(track);
    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(screen.getByRole('button', { name: /slide 3/ })).toHaveAttribute('aria-current', 'true');
    jest.useRealTimers();
  });

  it('o redimensionamento também recalcula o slide ativo', () => {
    jest.useFakeTimers();
    render(<SlideCarousel panels={painéis} />);
    const track = screen.getByRole('region');
    track.getBoundingClientRect = rect(0, 1000);
    const els = slides() as HTMLElement[];
    els[0].getBoundingClientRect = rect(-900, 400);
    els[1].getBoundingClientRect = rect(300, 400); // centro 500 ← mais perto
    els[2].getBoundingClientRect = rect(1200, 400);

    act(() => {
      window.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(50);
    });

    expect(screen.getByRole('button', { name: /slide 2/ })).toHaveAttribute('aria-current', 'true');
    jest.useRealTimers();
  });

  describe('arrastar com o mouse', () => {
    const pointer = (type: string, init: Record<string, unknown>) => {
      const e = new Event(type, { bubbles: true }) as Event & Record<string, unknown>;
      Object.assign(e, init);
      return e;
    };

    it('o mouse arrasta a trilha e solta ao terminar', () => {
      render(<SlideCarousel panels={painéis} />);
      const track = screen.getByRole('region');
      track.setPointerCapture = jest.fn();
      track.scrollLeft = 200;

      act(() => {
        track.dispatchEvent(pointer('pointerdown', { pointerType: 'mouse', clientX: 300, pointerId: 1 }));
      });
      expect(track).toHaveClass('cursor-grabbing');

      act(() => {
        track.dispatchEvent(pointer('pointermove', { clientX: 250 }));
      });
      expect(track.scrollLeft).toBe(250); // 200 - (250 - 300)

      act(() => {
        track.dispatchEvent(pointer('pointerup', {}));
      });
      expect(track).not.toHaveClass('cursor-grabbing');

      // sem arrasto ativo, mover não faz nada
      act(() => {
        track.dispatchEvent(pointer('pointermove', { clientX: 0 }));
      });
      expect(track.scrollLeft).toBe(250);
    });

    it('toque não inicia arrasto manual (já rola nativamente)', () => {
      render(<SlideCarousel panels={painéis} />);
      const track = screen.getByRole('region');
      track.setPointerCapture = jest.fn();

      act(() => {
        track.dispatchEvent(pointer('pointerdown', { pointerType: 'touch', clientX: 300, pointerId: 1 }));
      });

      expect(track).not.toHaveClass('cursor-grabbing');
      expect(track.setPointerCapture).not.toHaveBeenCalled();
    });

    it('sair com o ponteiro encerra o arrasto', () => {
      render(<SlideCarousel panels={painéis} />);
      const track = screen.getByRole('region');
      track.setPointerCapture = jest.fn();
      act(() => {
        track.dispatchEvent(pointer('pointerdown', { pointerType: 'mouse', clientX: 10, pointerId: 1 }));
        track.dispatchEvent(pointer('pointerleave', {}));
      });
      expect(track).not.toHaveClass('cursor-grabbing');
    });
  });

  it('remove os listeners ao desmontar', () => {
    const { unmount } = render(<SlideCarousel panels={painéis} />);
    const remove = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
    remove.mockRestore();
  });
});

/* ───────────── animações (GSAP simulado) ───────────── */

describe('Counter', () => {
  it('mostra o prefixo/sufixo e o valor inicial zerado', () => {
    render(<Counter value={1200} prefix="+" suffix=" mil" />);
    expect(screen.getByText('+0 mil')).toBeInTheDocument();
  });

  it('com movimento permitido anima de 0 até o valor, formatando em pt-BR', () => {
    render(<Counter value={1234.5} decimals={1} prefix="+" suffix="%" />);

    runMatchMedia((q) => q === motionQuery);

    expect(gsap.to).toHaveBeenCalledTimes(1);
    const [alvo, opcoes] = (gsap.to as jest.Mock).mock.calls[0] as [{ n: number }, Record<string, unknown> & { onUpdate: () => void }];
    expect(alvo).toEqual({ n: 0 });
    expect(opcoes).toMatchObject({ n: 1234.5, duration: 1.6, scrollTrigger: { start: 'top 85%' } });

    alvo.n = 1234.5;
    act(() => opcoes.onUpdate());
    expect(screen.getByText('+1.234,5%')).toBeInTheDocument();
  });

  it('com movimento reduzido mostra o valor final direto', () => {
    render(<Counter value={42} suffix="x" />);

    runMatchMedia((q) => q === '(prefers-reduced-motion: reduce)');

    expect(screen.getByText('42x')).toBeInTheDocument();
    expect(gsap.to).not.toHaveBeenCalled();
  });

  it('aplica a className', () => {
    render(<Counter value={1} className="grande" />);
    expect(screen.getByText('0')).toHaveClass('grande');
  });
});

describe('Reveal', () => {
  it('renderiza os filhos e anima a entrada ao cruzar o viewport', () => {
    render(
      <Reveal className="bloco" delay={0.3} y={50}>
        <p>conteúdo</p>
      </Reveal>,
    );
    expect(screen.getByText('conteúdo')).toBeInTheDocument();

    runMatchMedia();

    expect(gsap.fromTo).toHaveBeenCalledTimes(1);
    const [el, de, para] = (gsap.fromTo as jest.Mock).mock.calls[0] as [HTMLElement, Record<string, unknown>, Record<string, unknown>];
    expect(el).toHaveClass('bloco');
    expect(de).toEqual({ autoAlpha: 0, y: 50 });
    expect(para).toMatchObject({ autoAlpha: 1, y: 0, delay: 0.3, scrollTrigger: { start: 'top 85%' } });
  });

  it('usa os valores padrão (delay 0, y 32)', () => {
    render(<Reveal>filho</Reveal>);

    runMatchMedia();

    const [, de, para] = (gsap.fromTo as jest.Mock).mock.calls[0] as [unknown, Record<string, unknown>, Record<string, unknown>];
    expect(de).toEqual({ autoAlpha: 0, y: 32 });
    expect(para.delay).toBe(0);
  });
});

describe('StoryScroller', () => {
  const painéis = [painel(1), painel(2), painel(3)];
  const desktop = (q: string) => q.includes('min-width: 768px');

  it('renderiza os painéis do pin (desktop) e a lista empilhada (mobile)', () => {
    render(<StoryScroller panels={painéis} />);

    // cada texto aparece 2 vezes: versão com pin e fallback mobile
    expect(screen.getAllByText('Texto 1')).toHaveLength(2);
    expect(screen.getAllByText('Etapa 3')).toHaveLength(2);
    expect(screen.getAllByAltText('Imagem 2')).toHaveLength(2);
    expect(screen.getByText('Linha A1')).toBeInTheDocument();
  });

  it('o primeiro painel começa visível e os demais ocultos', () => {
    render(<StoryScroller panels={painéis} />);

    runMatchMedia(desktop);

    const chamadas = (gsap.set as jest.Mock).mock.calls.map(([, v]) => (v as { autoAlpha: number }).autoAlpha);
    expect(chamadas).toEqual([1, 0, 0]);
    expect(gsap.fromTo).toHaveBeenCalledTimes(1); // revela as linhas do primeiro painel
    expect(ScrollTrigger.create).toHaveBeenCalledTimes(1);
  });

  it('configura o pin com scrub e o final proporcional ao número de painéis', () => {
    render(<StoryScroller panels={painéis} />);
    runMatchMedia(desktop);

    const config = (ScrollTrigger.create as jest.Mock).mock.calls[0][0] as { end: () => string; scrub: boolean; start: string };

    expect(config.start).toBe('top top');
    expect(config.scrub).toBe(true);
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    expect(config.end()).toBe(`+=${3 * 1000 * 0.62}`);
  });

  it('ao rolar troca o painel ativo, faz a transição e revela as linhas do novo painel', () => {
    render(<StoryScroller panels={painéis} />);
    runMatchMedia(desktop);
    const { onUpdate } = (ScrollTrigger.create as jest.Mock).mock.calls[0][0] as { onUpdate: (self: { progress: number }) => void };
    (gsap.to as jest.Mock).mockClear();
    (gsap.fromTo as jest.Mock).mockClear();

    act(() => onUpdate({ progress: 0.5 })); // 3 painéis → índice 1

    const ocultos = Array.from(document.querySelectorAll('div.absolute.inset-0[aria-hidden]')).map((e) => e.getAttribute('aria-hidden'));
    expect(ocultos).toEqual(['true', 'false', 'true']);
    expect(gsap.to).toHaveBeenCalledTimes(2); // sai o anterior, entra o novo
    expect(gsap.fromTo).toHaveBeenCalledTimes(1);
    // parallax leve na imagem do painel ativo
    expect((gsap.set as jest.Mock).mock.calls.at(-1)?.[1]).toHaveProperty('yPercent');
  });

  it('mesmo painel não repete a transição, só atualiza o parallax', () => {
    render(<StoryScroller panels={painéis} />);
    runMatchMedia(desktop);
    const { onUpdate } = (ScrollTrigger.create as jest.Mock).mock.calls[0][0] as { onUpdate: (self: { progress: number }) => void };
    (gsap.to as jest.Mock).mockClear();

    act(() => onUpdate({ progress: 0.1 }));

    expect(gsap.to).not.toHaveBeenCalled();
  });

  it('progresso 1 não passa do último painel', () => {
    render(<StoryScroller panels={painéis} />);
    runMatchMedia(desktop);
    const { onUpdate } = (ScrollTrigger.create as jest.Mock).mock.calls[0][0] as { onUpdate: (self: { progress: number }) => void };

    act(() => onUpdate({ progress: 1 }));

    const ocultos = Array.from(document.querySelectorAll('div.absolute.inset-0[aria-hidden]')).map((e) => e.getAttribute('aria-hidden'));
    expect(ocultos).toEqual(['true', 'true', 'false']);
  });

  it('destrói o ScrollTrigger quando a media query deixa de valer', () => {
    render(<StoryScroller panels={painéis} />);
    const limpezas = runMatchMedia(desktop);
    const trigger = (ScrollTrigger.create as jest.Mock).mock.results[0].value as { kill: jest.Mock };

    limpezas.forEach((fn) => fn());

    expect(trigger.kill).toHaveBeenCalled();
  });
});
