import { jest } from '@jest/globals';
import { useEffect } from 'react';

/**
 * Mock de `lib/gsap` e `@gsap/react`: GSAP precisa de layout/scroll reais, que o jsdom não tem.
 * Os callbacks passados a `gsap.matchMedia().add()` ficam guardados em `registry` e os testes
 * os executam com `runMatchMedia()` para verificar o que a animação faria.
 *
 * Uso nos testes:
 *   jest.mock('../../lib/gsap', () => require('../../test/gsapMock'));
 *   jest.mock('@gsap/react', () => ({ useGSAP: require('../../test/gsapMock').useGSAP }));
 */

type MatchMediaEntry = { query: string; fn: () => unknown };

export const registry: MatchMediaEntry[] = [];

const mm = {
  add: jest.fn((query: string, fn: () => unknown) => {
    registry.push({ query, fn });
    return mm;
  }),
  revert: jest.fn(),
};

export const gsap = {
  matchMedia: jest.fn(() => mm),
  to: jest.fn(),
  from: jest.fn(),
  fromTo: jest.fn(),
  set: jest.fn(),
  registerPlugin: jest.fn(),
  ticker: { add: jest.fn(), remove: jest.fn(), lagSmoothing: jest.fn() },
};

export const ScrollTrigger = {
  update: jest.fn(),
  create: jest.fn<(vars?: unknown) => { kill: jest.Mock }>(() => ({ kill: jest.fn() })),
};

export class SplitText {
  lines: HTMLElement[] = [document.createElement('div')];
  element: unknown;
  vars: unknown;
  constructor(element: unknown, vars: unknown) {
    this.element = element;
    this.vars = vars;
  }
}

export const motionQuery = '(prefers-reduced-motion: no-preference)';

/** Substitui o useGSAP: roda o callback uma vez quando o componente monta. */
export function useGSAP(callback: () => unknown): void {
  useEffect(() => {
    const cleanup = callback();
    return typeof cleanup === 'function' ? (cleanup as () => void) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Executa os callbacks de matchMedia registrados (opcionalmente só os que casam com o filtro). */
export function runMatchMedia(filter: (query: string) => boolean = () => true): Array<() => void> {
  const cleanups: Array<() => void> = [];
  registry
    .filter((entry) => filter(entry.query))
    .forEach((entry) => {
      const cleanup = entry.fn();
      if (typeof cleanup === 'function') cleanups.push(cleanup as () => void);
    });
  return cleanups;
}

export function resetGsapMock(): void {
  registry.length = 0;
}
