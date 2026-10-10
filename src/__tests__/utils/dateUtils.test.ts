import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calcularIdade, formatDate, parseISODate, toISODate } from '../../utils/dateUtils';

describe('formatDate', () => {
  it('converte ISO para DD/MM/YYYY', () => {
    expect(formatDate('2024-03-09')).toBe('09/03/2024');
  });

  it.each([null, undefined, '', 'abc', '2024-03'])('devolve "—" para %p', (valor) => {
    expect(formatDate(valor)).toBe('—');
  });
});

describe('parseISODate', () => {
  it('interpreta a data no fuso local, sem deslocar o dia', () => {
    const d = parseISODate('2024-03-09');
    expect(d?.getFullYear()).toBe(2024);
    expect(d?.getMonth()).toBe(2);
    expect(d?.getDate()).toBe(9);
  });

  it.each([null, undefined, '', 'lixo'])('devolve null para %p', (valor) => {
    expect(parseISODate(valor)).toBeNull();
  });
});

describe('toISODate', () => {
  it('converte DD/MM/YYYY para ISO', () => {
    expect(toISODate('09/03/2024')).toBe('2024-03-09');
  });

  it('mantém ISO como está', () => {
    expect(toISODate('2024-03-09')).toBe('2024-03-09');
  });

  it.each([null, undefined, '', '09-03'])('devolve "" para %p', (valor) => {
    expect(toISODate(valor)).toBe('');
  });
});

describe('calcularIdade', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 4, 12, 0, 0)); // 04/10/2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('já fez aniversário no ano', () => {
    expect(calcularIdade('2010-05-05')).toBe(16);
  });

  it('ainda não fez aniversário no ano', () => {
    expect(calcularIdade('2010-12-25')).toBe(15);
  });

  it('faz aniversário hoje', () => {
    expect(calcularIdade('2010-10-04')).toBe(16);
  });

  it('um dia antes do aniversário', () => {
    expect(calcularIdade('2010-10-05')).toBe(15);
  });

  it('devolve null para data inválida', () => {
    expect(calcularIdade('invalida')).toBeNull();
    expect(calcularIdade(null)).toBeNull();
  });
});
