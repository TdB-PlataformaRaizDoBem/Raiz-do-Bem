import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  escurecerAteContraste,
  lerCorDoTema,
  lerIndice,
  luminanciaRelativa,
  razaoContraste,
  useEscalaVulnerabilidade,
} from '../../hooks/useEscalaVulnerabilidade';

const raiz = () => document.documentElement;

afterEach(() => {
  for (const token of ['vuln-1', 'vuln-4', 'canvas', 'canvas-line']) {
    raiz().style.removeProperty(`--color-${token}`);
  }
});

describe('lerCorDoTema', () => {
  it('lê a variável CSS do tema e apara espaços', () => {
    raiz().style.setProperty('--color-vuln-1', '  #123456 ');

    expect(lerCorDoTema('vuln-1')).toBe('#123456');
  });

  it('sem a variável (CSS não carregou) usa a cor de reserva do token', () => {
    expect(lerCorDoTema('vuln-5')).toBe('#8b0000');
    expect(lerCorDoTema('canvas')).toBe('#eef1f5');
  });

  it('token desconhecido cai no cinza neutro', () => {
    expect(lerCorDoTema('inexistente')).toBe('#cccccc');
  });
});

describe('contraste (WCAG 2.1)', () => {
  it('luminância: branco = 1, preto = 0, e hex curto (#fff) vale como o longo', () => {
    expect(luminanciaRelativa('#ffffff')).toBeCloseTo(1);
    expect(luminanciaRelativa('#fff')).toBeCloseTo(1);
    expect(luminanciaRelativa('#000000')).toBe(0);
    expect(luminanciaRelativa('#000')).toBe(0);
  });

  it('usa a curva linear para canais escuros e a de potência para os claros', () => {
    // 0x0a = 10 → 10/255 ≤ 0,03928 (ramo linear); 0x80 = 128 → ramo da potência.
    expect(luminanciaRelativa('#0a0a0a')).toBeCloseTo(10 / 255 / 12.92, 5);
    expect(luminanciaRelativa('#808080')).toBeCloseTo(0.2159, 3);
  });

  it('razão de contraste: 21 entre preto e branco, nos dois sentidos', () => {
    expect(razaoContraste('#000000', '#ffffff')).toBeCloseTo(21);
    expect(razaoContraste('#ffffff', '#000000')).toBeCloseTo(21);
    expect(razaoContraste('#777777', '#777777')).toBeCloseTo(1);
  });

  it('escurecerAteContraste devolve a cor intacta quando já contrasta o bastante', () => {
    expect(escurecerAteContraste('#000000')).toBe('#000000');
  });

  it('escurece uma cor clara até atingir 4,5:1 contra o fundo, preservando o matiz', () => {
    const resultado = escurecerAteContraste('#88aac5');

    expect(razaoContraste(resultado, '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(luminanciaRelativa(resultado)).toBeLessThan(luminanciaRelativa('#88aac5'));
    // continua azulada: o canal azul segue sendo o maior
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(resultado.slice(i, i + 2), 16));
    expect(b).toBeGreaterThan(r);
    expect(b).toBeGreaterThanOrEqual(g);
  });

  it('respeita um alvo e um fundo customizados', () => {
    const resultado = escurecerAteContraste('#ffffff', '#000000', 3);

    expect(resultado).toBe('#ffffff'); // branco sobre preto já passa
    expect(razaoContraste('#202020', '#000000')).toBeLessThan(3);
  });

  it('alvo inalcançável termina após 40 passos, sem laço infinito', () => {
    const resultado = escurecerAteContraste('#ffffff', '#ffffff', 22);

    expect(resultado).toMatch(/^#[0-9a-f]{6}$/);
    expect(resultado).not.toBe('#ffffff');
  });
});

describe('lerIndice', () => {
  it.each([
    [0.1, 'Risco baixo', 10],
    [0.2, 'Risco moderado', 20],
    [0.39, 'Risco moderado', 39],
    [0.4, 'Risco elevado', 40],
    [0.6, 'Risco alto', 60],
    [0.79, 'Risco alto', 79],
    [0.8, 'Risco crítico', 80],
    [1, 'Risco crítico', 100],
  ])('score %f -> %s (%d%%)', (score, rotulo, percentual) => {
    const leitura = lerIndice(score);

    expect(leitura.rotulo).toBe(rotulo);
    expect(leitura.percentual).toBe(percentual);
    expect(leitura.apoio.length).toBeGreaterThan(10);
  });
});

describe('useEscalaVulnerabilidade', () => {
  const escala = () => renderHook(() => useEscalaVulnerabilidade()).result.current;

  it('tem os 5 degraus, do menos ao mais urgente, cobrindo 0 a 1', () => {
    const { degraus } = escala();

    expect(degraus.map((d) => d.faixa)).toEqual(['muito_baixa', 'baixa', 'media', 'alta', 'muito_alta']);
    expect(degraus[0].min).toBe(0);
    expect(degraus[4].max).toBe(1);
    degraus.slice(1).forEach((d, i) => expect(d.min).toBe(degraus[i].max));
  });

  it('o texto de cada degrau tem contraste mínimo de 4,5:1 sobre branco', () => {
    for (const degrau of escala().degraus) {
      expect(razaoContraste(degrau.corTexto, '#ffffff')).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('usa as cores do tema quando elas existem', () => {
    raiz().style.setProperty('--color-vuln-4', '#112233');
    raiz().style.setProperty('--color-canvas', '#aabbcc');
    raiz().style.setProperty('--color-canvas-line', '#ddeeff');

    const { corPorFaixa, corNeutra, canvas } = escala();

    expect(corPorFaixa('alta')).toBe('#112233');
    expect(corNeutra).toBe('#ddeeff');
    expect(canvas).toEqual({ fundo: '#aabbcc', suave: '#f7f9fb', linha: '#ddeeff' });
  });

  it('busca por faixa: conhecida devolve o degrau, desconhecida cai no neutro / primeiro', () => {
    const { corPorFaixa, degrauPorFaixa, degraus, corNeutra } = escala();

    expect(degrauPorFaixa('media')).toBe(degraus[2]);
    expect(corPorFaixa('media')).toBe(degraus[2].cor);
    expect(corPorFaixa('nao_existe' as never)).toBe(corNeutra);
    expect(degrauPorFaixa('nao_existe' as never)).toBe(degraus[0]);
  });

  it('busca por score: o limite superior pertence ao degrau seguinte e 1,0 fica no último', () => {
    const { degrauPorScore, corPorScore, degraus } = escala();

    expect(degrauPorScore(0.05).faixa).toBe('muito_baixa');
    expect(degrauPorScore(0.2).faixa).toBe('baixa');
    expect(degrauPorScore(0.79).faixa).toBe('alta');
    expect(degrauPorScore(1).faixa).toBe('muito_alta');
    expect(corPorScore(0.5)).toBe(degraus[2].cor);
  });

  it('mantém a mesma instância entre renders (memoizada)', () => {
    const { result, rerender } = renderHook(() => useEscalaVulnerabilidade());
    const primeira = result.current;

    rerender();

    expect(result.current).toBe(primeira);
  });
});
