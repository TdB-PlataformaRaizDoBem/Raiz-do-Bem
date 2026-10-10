import { describe, expect, it } from 'vitest';
import {
  formatCompacto,
  formatMoeda,
  formatNumero,
  formatPercent,
  formatPercentualIndice,
  formatScore,
  partirCompacto,
} from '../../utils/numberUtils';

/** O Intl do pt-BR separa "R$" do valor com espaço não separável (U+00A0). */
const semNbsp = (s: string) => s.replace(/\u00a0/g, ' ');

const AUSENTES = [null, undefined, Number.NaN] as const;

describe('numberUtils', () => {
  describe.each([
    ['formatNumero', formatNumero],
    ['formatMoeda', formatMoeda],
    ['formatPercent', formatPercent],
    ['formatPercentualIndice', formatPercentualIndice],
    ['formatScore', formatScore],
    ['formatCompacto', formatCompacto],
  ] as const)('%s', (_nome, formatar) => {
    it.each(AUSENTES)('devolve o travessão para %s', (ausente) => {
      expect(formatar(ausente)).toBe('—');
    });
  });

  it('formatNumero agrupa milhares no padrão pt-BR', () => {
    expect(formatNumero(12362934)).toBe('12.362.934');
    expect(formatNumero(0)).toBe('0');
  });

  it('formatMoeda usa reais sem centavos', () => {
    expect(semNbsp(formatMoeda(1500))).toBe('R$ 1.500');
    expect(semNbsp(formatMoeda(1234567.89))).toBe('R$ 1.234.568');
  });

  it('formatPercent usa vírgula decimal e 1 casa por padrão', () => {
    expect(formatPercent(12.34)).toBe('12,3%');
    expect(formatPercent(12.34, 0)).toBe('12%');
    expect(formatPercent(5, 2)).toBe('5,00%');
  });

  it('formatPercentualIndice converte o score 0–1 em percentual inteiro', () => {
    expect(formatPercentualIndice(0.304)).toBe('30%');
    expect(formatPercentualIndice(1)).toBe('100%');
    expect(formatPercentualIndice(0)).toBe('0%');
  });

  it('formatScore usa 2 casas com vírgula', () => {
    expect(formatScore(0.5)).toBe('0,50');
    expect(formatScore(0.3049)).toBe('0,30');
  });

  describe('formatCompacto', () => {
    it.each([
      [11451245, '11,5 mi'],
      [1000000, '1,0 mi'],
      [-2500000, '-2,5 mi'],
      [418375, '418 mil'],
      [10000, '10 mil'],
      [1234, '1,2 mil'],
      [1000, '1,0 mil'],
      [999, '999'],
      [0, '0'],
    ])('%d vira "%s"', (valor, esperado) => {
      expect(formatCompacto(valor)).toBe(esperado);
    });
  });

  describe('partirCompacto', () => {
    it.each(AUSENTES)('separa valor e unidade vazios para %s', (ausente) => {
      expect(partirCompacto(ausente)).toEqual({ valor: '—', unidade: '' });
    });

    it('milhões com 1 casa', () => {
      expect(partirCompacto(12362934)).toEqual({ valor: '12,4', unidade: 'milhões' });
      expect(partirCompacto(-3000000)).toEqual({ valor: '-3,0', unidade: 'milhões' });
    });

    it('milhares arredondados, sem casas', () => {
      expect(partirCompacto(418375)).toEqual({ valor: '418', unidade: 'mil' });
      expect(partirCompacto(1500)).toEqual({ valor: '2', unidade: 'mil' });
    });

    it('abaixo de mil devolve o número sem unidade', () => {
      expect(partirCompacto(850)).toEqual({ valor: '850', unidade: '' });
      expect(partirCompacto(0)).toEqual({ valor: '0', unidade: '' });
    });
  });
});
