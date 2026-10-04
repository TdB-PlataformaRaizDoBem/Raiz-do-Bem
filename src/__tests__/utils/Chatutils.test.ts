import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  avatarColor,
  avatarInitials,
  buildChatUrl,
  buildGlobalChatUrl,
  formatHora,
  formatPreview,
  normalizeTel,
} from '../../utils/Chatutils';

const irPara = (path: string) => window.history.pushState({}, '', path);

afterEach(() => irPara('/'));

describe('formatHora', () => {
  it('formata HH:MM no padrão pt-BR', () => {
    expect(formatHora(new Date(2026, 2, 9, 14, 5).toISOString())).toBe('14:05');
  });

  it('devolve "" quando o locale falha', () => {
    const spy = jest.spyOn(Date.prototype, 'toLocaleTimeString').mockImplementation(() => {
      throw new Error('sem ICU');
    });
    expect(formatHora('2026-03-09T10:00:00')).toBe('');
    spy.mockRestore();
  });
});

describe('formatPreview', () => {
  it('devolve reticências para texto nulo ou vazio', () => {
    expect(formatPreview(null)).toBe('…');
    expect(formatPreview('')).toBe('…');
  });

  it('mantém textos curtos', () => {
    expect(formatPreview('Olá')).toBe('Olá');
  });

  it('trunca textos longos com reticências', () => {
    expect(formatPreview('a'.repeat(50))).toBe('a'.repeat(40) + '…');
    expect(formatPreview('abcdef', 3)).toBe('abc…');
  });

  it('texto exatamente no limite não é truncado', () => {
    expect(formatPreview('abc', 3)).toBe('abc');
  });
});

describe('normalizeTel', () => {
  it.each([
    ['+5511987654321', '+5511987654321'], // já normalizado
    ['%2B5511987654321', '+5511987654321'], // vindo codificado da URL
    ['11987654321', '+5511987654321'], // sem DDI
    ['(11) 98765-4321', '+5511987654321'],
    ['5511987654321', '+5511987654321'], // DDI sem o +
  ])('%s → %s', (entrada, esperado) => {
    expect(normalizeTel(entrada)).toBe(esperado);
  });

  it('número curto que começa com 55 é tratado como DDD, não como DDI', () => {
    expect(normalizeTel('551234567')).toBe('+55551234567');
  });
});

describe('buildChatUrl / buildGlobalChatUrl', () => {
  it.each([
    ['/admin/beneficiarios', '/admin'],
    ['/coord/dentistas', '/coord'],
    ['/outra-rota', ''],
  ])('estando em %s usa o prefixo "%s"', (path, prefixo) => {
    irPara(path);

    expect(buildChatUrl('11987654321')).toBe(`${prefixo}/chat/%2B5511987654321`);
    expect(buildGlobalChatUrl('11987654321')).toBe(`${prefixo}/chat?phone=%2B5511987654321`);
  });

  it('não duplica o DDI quando o número já começa com 55', () => {
    irPara('/admin/x');

    expect(buildChatUrl('5511987654321')).toBe('/admin/chat/%2B5511987654321');
    expect(buildGlobalChatUrl('+55 11 98765-4321')).toBe('/admin/chat?phone=%2B5511987654321');
  });
});

describe('avatar', () => {
  it('avatarColor é determinístico e usa um dos 8 tons', () => {
    expect(avatarColor('+5511987654321')).toBe(avatarColor('+5511987654321'));
    expect(avatarColor('+5511987654321')).toMatch(/^bg-/);
  });

  it('avatarColor varia com os 3 últimos dígitos', () => {
    // 321 % 8 = 1 → "bg-darkgreen"; 320 % 8 = 0 → "bg-teal-600"
    expect(avatarColor('+5511987654321')).toBe('bg-darkgreen');
    expect(avatarColor('+5511987654320')).toBe('bg-teal-600');
  });

  it('avatarColor aceita texto sem dígitos', () => {
    expect(avatarColor('abc')).toBe('bg-teal-600');
  });

  it('avatarInitials usa os dígitos antes dos dois últimos', () => {
    expect(avatarInitials('+5511987654321')).toBe('43');
  });
});
