import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { validateAge } from '../../hooks/validateAge';

describe('validateAge', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 4, 12, 0, 0)); // 04/10/2026
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('devolve 0 quando não há data', () => {
    expect(validateAge('')).toBe(0);
  });

  it('calcula a idade quando o aniversário já passou', () => {
    expect(validateAge('2000-01-15T12:00:00')).toBe(26);
  });

  it('desconta um ano quando o aniversário ainda não chegou', () => {
    expect(validateAge('2000-12-15T12:00:00')).toBe(25);
  });

  it('desconta um ano no mesmo mês, dia anterior ao aniversário', () => {
    expect(validateAge('2000-10-10T12:00:00')).toBe(25);
  });
});
