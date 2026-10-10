import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COOKIE_CONSENT_MAX_AGE_MS,
  COOKIE_CONSENT_VERSION,
  readCookieChoice,
  saveCookieChoice,
} from '../../lib/cookieConsent';

const KEY = 'raiz-do-bem:cookies';
const AGORA = new Date('2026-10-10T12:00:00.000Z');

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('readCookieChoice', () => {
  it('devolve null quando ainda não há escolha', () => {
    expect(readCookieChoice(AGORA.getTime())).toBeNull();
  });

  it('devolve a escolha salva', () => {
    saveCookieChoice(true, AGORA);

    expect(readCookieChoice(AGORA.getTime())).toEqual({
      v: COOKIE_CONSENT_VERSION,
      terceiros: true,
      em: AGORA.toISOString(),
    });
  });

  it.each([
    ['JSON corrompido', '{quebrado'],
    ['outra versão do aviso', JSON.stringify({ v: 99, terceiros: true, em: AGORA.toISOString() })],
    ['terceiros que não é booleano', JSON.stringify({ v: COOKIE_CONSENT_VERSION, terceiros: 'sim', em: AGORA.toISOString() })],
    ['data ausente', JSON.stringify({ v: COOKIE_CONSENT_VERSION, terceiros: true })],
    ['data inválida', JSON.stringify({ v: COOKIE_CONSENT_VERSION, terceiros: true, em: 'ontem' })],
  ])('descarta %s', (_caso, bruto) => {
    localStorage.setItem(KEY, bruto);

    expect(readCookieChoice(AGORA.getTime())).toBeNull();
  });

  it('vale por 12 meses e depois pede de novo', () => {
    saveCookieChoice(false, AGORA);

    expect(readCookieChoice(AGORA.getTime() + COOKIE_CONSENT_MAX_AGE_MS)).not.toBeNull();
    expect(readCookieChoice(AGORA.getTime() + COOKIE_CONSENT_MAX_AGE_MS + 1)).toBeNull();
  });

  it('devolve null quando o storage está bloqueado', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    expect(readCookieChoice()).toBeNull();
  });
});

describe('saveCookieChoice', () => {
  it('grava e devolve a escolha', () => {
    const escolha = saveCookieChoice(false, AGORA);

    expect(escolha).toEqual({ v: COOKIE_CONSENT_VERSION, terceiros: false, em: AGORA.toISOString() });
    expect(JSON.parse(localStorage.getItem(KEY) ?? '{}')).toEqual(escolha);
  });

  it('com o storage bloqueado, a escolha vale só para a visita', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    expect(saveCookieChoice(true, AGORA).terceiros).toBe(true);
  });
});
