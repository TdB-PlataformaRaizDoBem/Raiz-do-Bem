import { describe, expect, it } from 'vitest';
import { formatCEP, formatCPF, formatPhone, normalizeStr } from '../../utils/formatUtils';

describe('normalizeStr', () => {
  it('remove acentos, espaços nas pontas e deixa minúsculo', () => {
    expect(normalizeStr('  João da Conceição  ')).toBe('joao da conceicao');
  });

  it('mantém string vazia', () => {
    expect(normalizeStr('')).toBe('');
  });
});

describe('formatCPF', () => {
  it('formata 11 dígitos', () => {
    expect(formatCPF('12345678901')).toBe('123.456.789-01');
  });

  it('aceita CPF já formatado', () => {
    expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
  });

  it('devolve o valor original quando não tem 11 dígitos', () => {
    expect(formatCPF('123')).toBe('123');
  });

  it.each([null, undefined, ''])('devolve "—" para %p', (valor) => {
    expect(formatCPF(valor)).toBe('—');
  });
});

describe('formatPhone', () => {
  it('formata celular (11 dígitos)', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('formata fixo (10 dígitos)', () => {
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
  });

  it('ignora máscara existente', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });

  it('devolve o original quando o tamanho é inesperado', () => {
    expect(formatPhone('12345')).toBe('12345');
  });

  it.each([null, undefined, ''])('devolve "—" para %p', (valor) => {
    expect(formatPhone(valor)).toBe('—');
  });
});

describe('formatCEP', () => {
  it('formata 8 dígitos', () => {
    expect(formatCEP('01001000')).toBe('01001-000');
  });

  it('devolve o original quando inválido', () => {
    expect(formatCEP('123')).toBe('123');
  });

  it.each([null, undefined, ''])('devolve "—" para %p', (valor) => {
    expect(formatCEP(valor)).toBe('—');
  });
});
