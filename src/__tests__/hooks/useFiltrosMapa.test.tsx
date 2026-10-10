import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FaixaVulnerabilidade } from '../../domain/entities/VulnerabilidadeGeoAPI';
import { toRegiaoViewModel } from '../../domain/mappers/VulnerabilidadeMapper';
import { FAIXAS_ORDENADAS, useFiltrosMapa } from '../../hooks/useFiltrosMapa';
import { feature, propsUF } from '../../test/vulnerabilidadeFixtures';

const regiao = (codigo: string, nome: string, faixa: FaixaVulnerabilidade, prioridade: number) =>
  toRegiaoViewModel(
    feature(propsUF({ codigo_ibge: codigo, nome, faixa, indice_prioridade: prioridade })),
  );

const MA = regiao('21', 'Maranhão', 'alta', 0.62);
const SP = regiao('35', 'São Paulo', 'baixa', 0.12);
const PA = regiao('15', 'Pará', 'muito_alta', 0.8);
const PR = regiao('41', 'Paraná', 'media', 0.4);
const REGIOES = [MA, SP, PA, PR];

const nomes = (regioes: { nome: string }[]) => regioes.map((r) => r.nome);

describe('FAIXAS_ORDENADAS', () => {
  it('vai da faixa mais urgente para a menos urgente', () => {
    expect(FAIXAS_ORDENADAS).toEqual(['muito_alta', 'alta', 'media', 'baixa', 'muito_baixa']);
  });
});

describe('useFiltrosMapa', () => {
  it('sem filtro, mostra todas as regiões e não oferece sugestões', () => {
    const { result } = renderHook(() => useFiltrosMapa(REGIOES));

    expect(result.current.regioesFiltradas).toEqual(REGIOES);
    expect(result.current.temFiltroAtivo).toBe(false);
    expect(result.current.ocultadas).toBe(0);
    expect(result.current.sugestoes).toEqual([]);
    expect(result.current.faixas.size).toBe(0);
    expect(result.current.termo).toBe('');
  });

  it('alternarFaixa liga e desliga a faixa, e conta as regiões ocultadas', () => {
    const { result } = renderHook(() => useFiltrosMapa(REGIOES));

    act(() => result.current.alternarFaixa('alta'));
    expect(nomes(result.current.regioesFiltradas)).toEqual(['Maranhão']);
    expect(result.current.temFiltroAtivo).toBe(true);
    expect(result.current.ocultadas).toBe(3);

    act(() => result.current.alternarFaixa('muito_alta'));
    expect(nomes(result.current.regioesFiltradas)).toEqual(['Maranhão', 'Pará']);

    act(() => result.current.alternarFaixa('alta'));
    expect(nomes(result.current.regioesFiltradas)).toEqual(['Pará']);

    act(() => result.current.alternarFaixa('muito_alta'));
    expect(result.current.regioesFiltradas).toEqual(REGIOES);
  });

  it('busca por nome sem diferenciar acento nem caixa', () => {
    const { result } = renderHook(() => useFiltrosMapa(REGIOES));

    act(() => result.current.definirTermo('MARANHAO'));

    expect(nomes(result.current.regioesFiltradas)).toEqual(['Maranhão']);
    expect(result.current.termo).toBe('MARANHAO');
  });

  it('busca por trecho do nome e por código IBGE (prefixo)', () => {
    const { result } = renderHook(() => useFiltrosMapa(REGIOES));

    act(() => result.current.definirTermo('par'));
    expect(nomes(result.current.regioesFiltradas)).toEqual(['Pará', 'Paraná']);

    act(() => result.current.definirTermo('35'));
    expect(nomes(result.current.regioesFiltradas)).toEqual(['São Paulo']);
  });

  it('termo sem correspondência não deixa nenhuma região', () => {
    const { result } = renderHook(() => useFiltrosMapa(REGIOES));

    act(() => result.current.definirTermo('zzz'));

    expect(result.current.regioesFiltradas).toEqual([]);
    expect(result.current.ocultadas).toBe(4);
  });

  it('faixa e termo se combinam (os dois precisam casar)', () => {
    const { result } = renderHook(() => useFiltrosMapa(REGIOES));

    act(() => result.current.alternarFaixa('media'));
    act(() => result.current.definirTermo('par'));

    expect(nomes(result.current.regioesFiltradas)).toEqual(['Paraná']);
  });

  it('termo só com espaços não conta como filtro ativo e não filtra', () => {
    const { result } = renderHook(() => useFiltrosMapa(REGIOES));

    act(() => result.current.definirTermo('   '));

    expect(result.current.temFiltroAtivo).toBe(false);
    expect(result.current.regioesFiltradas).toEqual(REGIOES);
  });

  it('limpar zera faixas e termo', () => {
    const { result } = renderHook(() => useFiltrosMapa(REGIOES));
    act(() => result.current.alternarFaixa('alta'));
    act(() => result.current.definirTermo('mar'));

    act(() => result.current.limpar());

    expect(result.current.faixas.size).toBe(0);
    expect(result.current.termo).toBe('');
    expect(result.current.temFiltroAtivo).toBe(false);
    expect(result.current.regioesFiltradas).toEqual(REGIOES);
  });

  describe('sugestões', () => {
    it('só aparecem a partir de 2 caracteres', () => {
      const { result } = renderHook(() => useFiltrosMapa(REGIOES));

      act(() => result.current.definirTermo('p'));
      expect(result.current.sugestoes).toEqual([]);

      act(() => result.current.definirTermo('pa'));
      expect(nomes(result.current.sugestoes)).not.toEqual([]);
    });

    it('quem começa com o termo vem antes de quem só o contém; empate vai por prioridade', () => {
      const regioes = [
        regiao('01', 'Espírito Santo', 'alta', 0.9), // contém "santo"
        regiao('02', 'Santa Catarina', 'alta', 0.1), // começa com "santa"... não com "sant"? sim, começa
        regiao('03', 'Santana', 'alta', 0.5),
        regiao('04', 'Porto Santo', 'alta', 0.95), // só contém
      ];
      const { result } = renderHook(() => useFiltrosMapa(regioes));

      act(() => result.current.definirTermo('sant'));

      // Começam com "sant": Santana (0,5) e Santa Catarina (0,1). Depois os que só contêm.
      expect(nomes(result.current.sugestoes)).toEqual([
        'Santana',
        'Santa Catarina',
        'Porto Santo',
        'Espírito Santo',
      ]);
    });

    it('a comparação também funciona quando o segundo é quem começa com o termo', () => {
      const regioes = [regiao('01', 'Casa Rio', 'alta', 0.9), regiao('02', 'Rio Verde', 'alta', 0.1)];
      const { result } = renderHook(() => useFiltrosMapa(regioes));

      act(() => result.current.definirTermo('rio'));

      expect(nomes(result.current.sugestoes)).toEqual(['Rio Verde', 'Casa Rio']);
    });

    it('limita a 8 sugestões', () => {
      const muitas = Array.from({ length: 12 }, (_, i) =>
        regiao(String(10 + i), `Estado ${i}`, 'alta', i / 100),
      );
      const { result } = renderHook(() => useFiltrosMapa(muitas));

      act(() => result.current.definirTermo('est'));

      expect(result.current.sugestoes).toHaveLength(8);
      expect(result.current.regioesFiltradas).toHaveLength(12);
    });

    it('respeitam o filtro de faixa', () => {
      const { result } = renderHook(() => useFiltrosMapa(REGIOES));
      act(() => result.current.alternarFaixa('media'));

      act(() => result.current.definirTermo('pa'));

      expect(nomes(result.current.sugestoes)).toEqual(['Paraná']);
    });
  });
});
