import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import Lenis from 'lenis';
import * as React from 'react';
import { gsap, motionQuery, ScrollTrigger, SplitText } from '../../lib/gsap';
import { useHeroReveal } from '../../hooks/useHeroReveal';
import { useLenis } from '../../hooks/useLenis';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useSpeech } from '../../hooks/useSpeech';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import { resetGsapMock, runMatchMedia } from '../../test/gsapMock';

vi.mock('../../lib/gsap', () => import('../../test/gsapMock'));
vi.mock('@gsap/react', async () => ({ useGSAP: (await import('../../test/gsapMock')).useGSAP }));
vi.mock('lenis', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({ on: vi.fn(), raf: vi.fn(), destroy: vi.fn() })),
}));

type Synth = { speak: Mock; cancel: Mock };
const synth = () => (window as unknown as { speechSynthesis: Synth }).speechSynthesis;

beforeEach(() => {
  resetGsapMock();
});

/* ───────────────────────── useSpeech ───────────────────────── */

describe('useSpeech', () => {
  it('speak cancela a fala anterior, configura pt-BR e inicia a nova', () => {
    const { result } = renderHook(() => useSpeech());

    act(() => result.current.speak('Olá, mundo'));

    expect(result.current.isSupported).toBe(true);
    expect(synth().cancel).toHaveBeenCalled();
    expect(synth().speak).toHaveBeenCalledTimes(1);
    const utterance = synth().speak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('Olá, mundo');
    expect(utterance.lang).toBe('pt-BR');
    expect([utterance.rate, utterance.pitch, utterance.volume]).toEqual([1, 1, 1]);
  });

  it('acompanha o estado de fala: onstart / onend / onerror', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.speak('texto'));
    const utterance = synth().speak.mock.calls[0][0] as SpeechSynthesisUtterance;

    act(() => utterance.onstart?.(new Event('start') as SpeechSynthesisEvent));
    expect(result.current.isSpeaking).toBe(true);

    act(() => utterance.onend?.(new Event('end') as SpeechSynthesisEvent));
    expect(result.current.isSpeaking).toBe(false);

    act(() => utterance.onstart?.(new Event('start') as SpeechSynthesisEvent));
    act(() => utterance.onerror?.(new Event('error') as SpeechSynthesisErrorEvent));
    expect(result.current.isSpeaking).toBe(false);
  });

  it.each(['', '   '])('ignora texto vazio (%p)', (texto) => {
    const { result } = renderHook(() => useSpeech());

    act(() => result.current.speak(texto));

    expect(synth().speak).not.toHaveBeenCalled();
  });

  it('cancel interrompe a fala e zera isSpeaking', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.speak('texto'));
    const utterance = synth().speak.mock.calls[0][0] as SpeechSynthesisUtterance;
    act(() => utterance.onstart?.(new Event('start') as SpeechSynthesisEvent));

    act(() => result.current.cancel());

    expect(result.current.isSpeaking).toBe(false);
    expect(synth().cancel).toHaveBeenCalled();
  });

  it('cancela a fala ao desmontar', () => {
    const { unmount } = renderHook(() => useSpeech());
    synth().cancel.mockClear();

    unmount();

    expect(synth().cancel).toHaveBeenCalled();
  });

  it('sem suporte do navegador: isSupported é false e speak não faz nada', async () => {
    const original = synth();
    Reflect.deleteProperty(window, 'speechSynthesis');

    // `isSupported` é calculado quando o módulo carrega: carrega uma cópia isolada do hook,
    // reaproveitando a mesma instância do React para os hooks continuarem válidos.
    vi.resetModules();
    vi.doMock('react', () => React);
    const { useSpeech: useSpeechIsolado } = await import('../../hooks/useSpeech');
    const { result, unmount } = renderHook(() => useSpeechIsolado());

    expect(result.current.isSupported).toBe(false);
    act(() => result.current.speak('texto'));
    act(() => result.current.cancel());
    expect(result.current.isSpeaking).toBe(false);
    unmount();

    vi.doUnmock('react');
    Object.assign(window, { speechSynthesis: original });
  });
});

/* ───────────────────────── useVoiceSearch ───────────────────────── */

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  lang = '';
  continuous = true;
  interimResults = true;
  maxAlternatives = 0;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onresult: ((e: unknown) => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  constructor() {
    FakeRecognition.instances.push(this);
  }
}

const resultado = (transcript?: string) => ({ results: [transcript === undefined ? [] : [{ transcript }]] });

describe('useVoiceSearch', () => {
  beforeEach(() => {
    FakeRecognition.instances = [];
    Object.assign(window, { SpeechRecognition: FakeRecognition });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'SpeechRecognition');
    Reflect.deleteProperty(window, 'webkitSpeechRecognition');
  });

  it('sem suporte: isSupported false e toggle não faz nada', () => {
    Reflect.deleteProperty(window, 'SpeechRecognition');
    const { result } = renderHook(() => useVoiceSearch(() => {}));

    act(() => result.current.toggle());

    expect(result.current.isSupported).toBe(false);
    expect(FakeRecognition.instances).toHaveLength(0);
  });

  it('aceita a variante webkit', () => {
    Reflect.deleteProperty(window, 'SpeechRecognition');
    Object.assign(window, { webkitSpeechRecognition: FakeRecognition });

    const { result } = renderHook(() => useVoiceSearch(() => {}));

    expect(result.current.isSupported).toBe(true);
  });

  it('toggle inicia o reconhecimento em pt-BR, sem modo contínuo', () => {
    const { result } = renderHook(() => useVoiceSearch(() => {}));

    act(() => result.current.toggle());

    const rec = FakeRecognition.instances[0];
    expect(rec.start).toHaveBeenCalled();
    expect(rec.lang).toBe('pt-BR');
    expect([rec.continuous, rec.interimResults, rec.maxAlternatives]).toEqual([false, false, 1]);
  });

  it('acompanha o estado listening: onstart / onend / onerror', () => {
    const { result } = renderHook(() => useVoiceSearch(() => {}));
    act(() => result.current.toggle());
    const rec = FakeRecognition.instances[0];

    act(() => rec.onstart?.());
    expect(result.current.listening).toBe(true);
    act(() => rec.onend?.());
    expect(result.current.listening).toBe(false);

    act(() => rec.onstart?.());
    act(() => rec.onerror?.());
    expect(result.current.listening).toBe(false);
  });

  it('entrega a transcrição ao callback mais recente', () => {
    const primeiro = vi.fn();
    const segundo = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useVoiceSearch(cb), { initialProps: { cb: primeiro } });
    act(() => result.current.toggle());
    rerender({ cb: segundo });

    act(() => FakeRecognition.instances[0].onresult?.(resultado('maria silva')));

    expect(primeiro).not.toHaveBeenCalled();
    expect(segundo).toHaveBeenCalledWith('maria silva');
  });

  it.each([[undefined], ['']])('transcrição vazia (%p) não chama o callback', (texto) => {
    const cb = vi.fn();
    const { result } = renderHook(() => useVoiceSearch(cb));
    act(() => result.current.toggle());

    act(() => FakeRecognition.instances[0].onresult?.(resultado(texto)));

    expect(cb).not.toHaveBeenCalled();
  });

  it('toggle enquanto escuta interrompe o reconhecimento', () => {
    const { result } = renderHook(() => useVoiceSearch(() => {}));
    act(() => result.current.toggle());
    act(() => FakeRecognition.instances[0].onstart?.());
    expect(result.current.listening).toBe(true);

    act(() => result.current.toggle());

    expect(FakeRecognition.instances[0].stop).toHaveBeenCalled();
    expect(result.current.listening).toBe(false);
  });

  it('aborta o reconhecimento ao desmontar', () => {
    const { result, unmount } = renderHook(() => useVoiceSearch(() => {}));
    act(() => result.current.toggle());

    unmount();

    expect(FakeRecognition.instances[0].abort).toHaveBeenCalled();
  });
});

/* ───────────────────────── useScrollLock ───────────────────────── */

describe('useScrollLock', () => {
  const setWidth = (w: number) => Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });

  afterEach(() => {
    setWidth(1024);
    document.body.style.overflow = '';
  });

  it('trava o scroll quando aberto em tela pequena (< 1280px)', () => {
    setWidth(800);
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('não trava em tela grande, a menos que forceLock', () => {
    setWidth(1400);
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('unset');

    renderHook(() => useScrollLock(true, true));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('não trava quando fechado', () => {
    setWidth(800);
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe('unset');
  });

  it('libera ao fechar e ao desmontar', () => {
    setWidth(800);
    const { rerender, unmount } = renderHook(({ open }) => useScrollLock(open), { initialProps: { open: true } });
    expect(document.body.style.overflow).toBe('hidden');

    rerender({ open: false });
    expect(document.body.style.overflow).toBe('unset');

    rerender({ open: true });
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('reavalia ao redimensionar a janela', () => {
    setWidth(800);
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    setWidth(1500);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(document.body.style.overflow).toBe('unset');
  });
});

/* ───────────────────────── useLenis ───────────────────────── */

describe('useLenis', () => {
  const matchMedia = (matches: boolean) => {
    window.matchMedia = ((q: string) => ({ matches, media: q }) as MediaQueryList) as typeof window.matchMedia;
  };

  it('com movimento reduzido não inicia o Lenis', () => {
    matchMedia(false);
    renderHook(() => useLenis());

    expect(Lenis).not.toHaveBeenCalled();
  });

  it('com movimento permitido inicia o Lenis ligado ao ticker do GSAP', () => {
    matchMedia(true);
    renderHook(() => useLenis());

    expect(Lenis).toHaveBeenCalledTimes(1);
    const lenis = (Lenis as unknown as Mock).mock.results[0].value as {
      on: Mock;
      raf: Mock;
    };
    expect(lenis.on).toHaveBeenCalledWith('scroll', ScrollTrigger.update);
    expect(gsap.ticker.add).toHaveBeenCalledTimes(1);
    expect(gsap.ticker.lagSmoothing).toHaveBeenCalledWith(0);

    // o frame do ticker repassa o tempo em ms ao Lenis
    const onFrame = (gsap.ticker.add as Mock).mock.calls[0][0] as (t: number) => void;
    onFrame(2);
    expect(lenis.raf).toHaveBeenCalledWith(2000);

    // easing exponencial limitado a 1
    const opts = (Lenis as unknown as Mock).mock.calls[0][0] as { easing: (t: number) => number; duration: number };
    expect(opts.duration).toBe(0.8);
    expect(opts.easing(0)).toBeCloseTo(0.001, 3);
    expect(opts.easing(1)).toBe(1);
  });

  it('destrói o Lenis e remove o ticker ao desmontar', () => {
    matchMedia(true);
    const { unmount } = renderHook(() => useLenis());
    const lenis = (Lenis as unknown as Mock).mock.results[0].value as { destroy: Mock };

    unmount();

    expect(lenis.destroy).toHaveBeenCalled();
    expect(gsap.ticker.remove).toHaveBeenCalled();
  });
});

/* ───────────────────────── useHeroReveal ───────────────────────── */

describe('useHeroReveal', () => {
  const montar = (headingEl: HTMLElement | null) => {
    const fade = document.createElement('p');
    const scope = { current: document.createElement('section') };
    const heading = { current: headingEl };
    const fadeEls = { current: [fade, null] as (HTMLElement | null)[] };
    renderHook(() => useHeroReveal({ scope, heading, fadeEls }));
    return { fade };
  };

  beforeEach(() => {
    Object.assign(document, { fonts: { ready: Promise.resolve() } });
  });

  it('sem elemento de título não registra animações', () => {
    montar(null);

    expect(gsap.matchMedia).not.toHaveBeenCalled();
  });

  it('com movimento permitido: revela o título em linhas e faz fade dos demais elementos', async () => {
    const h1 = document.createElement('h1');
    const { fade } = montar(h1);

    await act(async () => {
      runMatchMedia((q) => q === motionQuery);
      await document.fonts.ready;
      await Promise.resolve();
    });

    expect(gsap.from).toHaveBeenCalledTimes(2);
    const chamadas = (gsap.from as Mock).mock.calls as [unknown[], Record<string, unknown>][];
    // o fade dos elementos de apoio é agendado na hora; o título só depois das fontes carregarem
    const [elementosFade, opcoesFade] = chamadas[0];
    expect(elementosFade).toEqual([fade]); // null filtrado
    expect(opcoesFade).toMatchObject({ autoAlpha: 0, y: 24, delay: 0.5 });
    const [linhas, opcoesLinhas] = chamadas[1];
    expect(linhas).toHaveLength(1);
    expect(opcoesLinhas).toMatchObject({ yPercent: 110, autoAlpha: 0, stagger: 0.12 });
    expect(SplitText).toBeDefined();
  });

  it('se desmontar antes das fontes carregarem, não cria o SplitText', async () => {
    let fontesProntas: () => void = () => {};
    Object.assign(document, { fonts: { ready: new Promise<void>((res) => (fontesProntas = res)) } });
    montar(document.createElement('h1'));

    const limpezas = runMatchMedia((q) => q === motionQuery);
    limpezas.forEach((fn) => fn()); // cancelled = true
    await act(async () => {
      fontesProntas();
      await Promise.resolve();
    });

    expect(gsap.from).toHaveBeenCalledTimes(1); // só o fade; o título foi cancelado
  });

  it('com movimento reduzido: deixa tudo visível sem animar', () => {
    const h1 = document.createElement('h1');
    montar(h1);

    runMatchMedia((q) => q === '(prefers-reduced-motion: reduce)');

    expect(gsap.set).toHaveBeenCalledTimes(1);
    expect((gsap.set as Mock).mock.calls[0][1]).toEqual({ autoAlpha: 1 });
    expect(gsap.from).not.toHaveBeenCalled();
  });
});
