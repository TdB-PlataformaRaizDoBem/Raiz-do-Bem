import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { serializarCenario, useCenarioVoluntarios } from '../../hooks/useCenarioVoluntarios';

const CHAVE = 'raiz-do-bem:cenario-voluntarios:v1';

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('serializarCenario', () => {
  it('formata como UF:qtd separado por vírgula, em ordem alfabética (mesmo cenário, mesma string)', () => {
    expect(serializarCenario({ SP: 4200, MA: 900 })).toBe('MA:900,SP:4200');
    expect(serializarCenario({ MA: 900, SP: 4200 })).toBe('MA:900,SP:4200');
  });

  it('ignora quantidades zeradas ou negativas e devolve vazio sem cenário', () => {
    expect(serializarCenario({ MA: 0, SP: -3 })).toBe('');
    expect(serializarCenario({})).toBe('');
  });
});

describe('useCenarioVoluntarios', () => {
  it('começa vazio', () => {
    const { result } = renderHook(() => useCenarioVoluntarios());

    expect(result.current.cenario).toEqual({});
    expect(result.current.parametro).toBe('');
    expect(result.current.totalEstados).toBe(0);
    expect(result.current.totalVoluntarios).toBe(0);
    expect(result.current.quantidadeDe('MA')).toBe(0);
  });

  it('definir normaliza a sigla, arredonda para baixo e alimenta os totais', () => {
    const { result } = renderHook(() => useCenarioVoluntarios());

    act(() => result.current.definir('ma', 900.7));
    act(() => result.current.definir('SP', 4200));

    expect(result.current.cenario).toEqual({ MA: 900, SP: 4200 });
    expect(result.current.parametro).toBe('MA:900,SP:4200');
    expect(result.current.totalEstados).toBe(2);
    expect(result.current.totalVoluntarios).toBe(5100);
    expect(result.current.quantidadeDe('ma')).toBe(900);
    expect(result.current.quantidadeDe('RJ')).toBe(0);
  });

  it.each([[0], [-5], [0.4]])('definir com %s remove a entrada em vez de gravar zero', (quantidade) => {
    const { result } = renderHook(() => useCenarioVoluntarios());
    act(() => result.current.definir('MA', 900));

    act(() => result.current.definir('MA', quantidade));

    expect(result.current.cenario).toEqual({});
    expect(result.current.parametro).toBe('');
  });

  it('remover tira só aquela UF', () => {
    const { result } = renderHook(() => useCenarioVoluntarios());
    act(() => result.current.definir('MA', 10));
    act(() => result.current.definir('SP', 20));

    act(() => result.current.remover('ma'));

    expect(result.current.cenario).toEqual({ SP: 20 });
  });

  it('limpar apaga tudo', () => {
    const { result } = renderHook(() => useCenarioVoluntarios());
    act(() => result.current.definir('MA', 10));

    act(() => result.current.limpar());

    expect(result.current.cenario).toEqual({});
  });

  describe('persistência', () => {
    it('grava no localStorage e uma nova montagem recupera o cenário', () => {
      const primeira = renderHook(() => useCenarioVoluntarios());
      act(() => primeira.result.current.definir('MA', 900));
      primeira.unmount();

      expect(JSON.parse(window.localStorage.getItem(CHAVE)!)).toEqual({ MA: 900 });
      const segunda = renderHook(() => useCenarioVoluntarios());
      expect(segunda.result.current.cenario).toEqual({ MA: 900 });
    });

    it('sanitiza o que veio do localStorage (editável pelo usuário)', () => {
      window.localStorage.setItem(
        CHAVE,
        JSON.stringify({ MA: 900.9, sp: 10, SPP: 5, RJ: -1, BA: 'x', CE: 0, PE: null }),
      );

      const { result } = renderHook(() => useCenarioVoluntarios());

      expect(result.current.cenario).toEqual({ MA: 900 });
    });

    it.each([
      ['vazio', ''],
      ['JSON inválido', '{quebrado'],
      ['null', 'null'],
      ['texto', '"abc"'],
      ['número', '42'],
    ])('conteúdo %s vira cenário vazio', (_nome, bruto) => {
      window.localStorage.setItem(CHAVE, bruto);

      const { result } = renderHook(() => useCenarioVoluntarios());

      expect(result.current.cenario).toEqual({});
    });

    it('localStorage inacessível na leitura: começa vazio', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('bloqueado');
      });

      const { result } = renderHook(() => useCenarioVoluntarios());

      expect(result.current.cenario).toEqual({});
    });

    it('cota estourada ou modo privativo: o cenário segue funcionando em memória', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const { result } = renderHook(() => useCenarioVoluntarios());

      act(() => result.current.definir('MA', 900));

      expect(result.current.cenario).toEqual({ MA: 900 });
    });
  });
});
