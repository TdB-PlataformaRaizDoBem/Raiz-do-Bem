import { describe, expect, it } from 'vitest';
import { calcularRankingRenda } from './rankingRenda';

describe('calcularRankingRenda', () => {
  it('a menor renda do conjunto fica em primeiro (mais atenção); a maior, em último', () => {
    const resultado = calcularRankingRenda([
      { codigo: 'MA', rendaMedia: 900 },
      { codigo: 'SP', rendaMedia: 2600 },
      { codigo: 'AC', rendaMedia: 1500 },
    ]);

    expect(resultado.get('MA')).toMatchObject({ posicao: 1, faixa: 'muito_alta' });
    expect(resultado.get('SP')).toMatchObject({ posicao: 3, faixa: 'muito_baixa' });
    expect(resultado.get('MA')!.indiceAtencao).toBeCloseTo(1);
    expect(resultado.get('SP')!.indiceAtencao).toBeCloseTo(0);
  });

  it('é relativo ao conjunto: a mesma renda produz faixas diferentes em conjuntos diferentes', () => {
    const comVizinhoMaisPobre = calcularRankingRenda([
      { codigo: 'X', rendaMedia: 900 },
      { codigo: 'Y', rendaMedia: 100 },
    ]);
    const comVizinhoMaisRico = calcularRankingRenda([
      { codigo: 'X', rendaMedia: 900 },
      { codigo: 'Y', rendaMedia: 5000 },
    ]);

    expect(comVizinhoMaisPobre.get('X')?.faixa).toBe('muito_baixa');
    expect(comVizinhoMaisRico.get('X')?.faixa).toBe('muito_alta');
  });

  it('renda ausente, zero ou negativa fica fora do ranking: nunca a cor do pior quintil', () => {
    const resultado = calcularRankingRenda([
      { codigo: 'A', rendaMedia: 900 },
      { codigo: 'B', rendaMedia: undefined },
      { codigo: 'C', rendaMedia: null },
      { codigo: 'D', rendaMedia: 0 },
      { codigo: 'E', rendaMedia: -50 },
    ]);

    for (const codigo of ['B', 'C', 'D', 'E']) {
      expect(resultado.get(codigo)).toEqual({ indiceAtencao: null, faixa: null, posicao: null, total: 1 });
    }
    expect(resultado.get('A')?.faixa).not.toBeNull();
  });

  it('um único item válido cai no meio da escala (não há "relativo" com amostra de 1)', () => {
    const resultado = calcularRankingRenda([{ codigo: 'A', rendaMedia: 1500 }]);

    expect(resultado.get('A')).toMatchObject({ indiceAtencao: 0.5, faixa: 'media', posicao: 1, total: 1 });
  });

  it('lista vazia não quebra e devolve mapa vazio', () => {
    expect(calcularRankingRenda([])).toEqual(new Map());
  });

  it('empate de renda mantém a ordem de entrada (sort estável) sem pular posição', () => {
    const resultado = calcularRankingRenda([
      { codigo: 'A', rendaMedia: 1000 },
      { codigo: 'B', rendaMedia: 1000 },
    ]);

    expect([resultado.get('A')?.posicao, resultado.get('B')?.posicao].sort()).toEqual([1, 2]);
  });
});
