/// <reference types="node" />
// Matchers do jest-dom (toBeInTheDocument, toHaveAttribute...) tipados para @jest/globals.
import '@testing-library/jest-dom/jest-globals';
import { jest } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'node:util';

// jsdom não expõe TextEncoder/TextDecoder, que o react-router precisa.
Object.assign(globalThis, { TextEncoder, TextDecoder });

/* ───────── APIs de navegador que o jsdom não implementa ───────── */

// matchMedia: por padrão nenhuma media query casa.
window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

window.scrollTo = (() => {}) as typeof window.scrollTo;
Element.prototype.scrollIntoView = () => {};

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.assign(globalThis, { IntersectionObserver: NoopObserver, ResizeObserver: NoopObserver });

// Web Speech API (síntese de voz) — presente por padrão; testes de "sem suporte" removem.
class FakeUtterance {
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}
Object.assign(globalThis, {
  SpeechSynthesisUtterance: FakeUtterance,
  speechSynthesis: { speak: jest.fn(), cancel: jest.fn() },
});
