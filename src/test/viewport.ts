import { afterEach, beforeEach } from 'vitest';

const originalMatchMedia = window.matchMedia;

/** Simula viewport desktop (>= 1280px), onde a visualização em tabela está disponível. */
export function mockDesktop() {
  window.matchMedia = ((query: string) => ({
    ...originalMatchMedia(query),
    matches: query.includes('min-width: 1280px'),
  })) as typeof window.matchMedia;
}

export function restoreViewport() {
  window.matchMedia = originalMatchMedia;
}

/** Registra beforeEach/afterEach que colocam o bloco de testes atual em viewport desktop. */
export function useDesktopViewport() {
  beforeEach(mockDesktop);
  afterEach(restoreViewport);
}
