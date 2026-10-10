import { describe, expect, it } from 'vitest';
import { gsap, motionQuery, ScrollTrigger, SplitText } from '../../lib/gsap';

// Os demais testes substituem este módulo pelo mock (src/test/gsapMock.ts); aqui vale o real.
describe('lib/gsap', () => {
  it('reexporta o gsap com os plugins de scroll e de texto', () => {
    expect(typeof gsap.to).toBe('function');
    expect(ScrollTrigger).toBeDefined();
    expect(SplitText).toBeDefined();
  });

  it('registra os plugins no gsap', () => {
    expect(gsap.plugins).toBeDefined();
  });

  it('o efeito de movimento só roda quando o usuário não pediu para reduzir movimento', () => {
    expect(motionQuery).toBe('(prefers-reduced-motion: no-preference)');
  });
});
