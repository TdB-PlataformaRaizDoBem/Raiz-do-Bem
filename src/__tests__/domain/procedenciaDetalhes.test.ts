import { describe, expect, it } from 'vitest';
import type { FeatureAPI, Geometry } from '../../domain/entities/VulnerabilidadeGeoAPI';
import { avaliarProcedencia, ehOficial } from '../../domain/procedencia';
import { feature, propsUF } from '../../test/vulnerabilidadeFixtures';

const POLIGONO: Geometry = {
  type: 'Polygon',
  coordinates: [[[0, 0], [1, 0], [1, 1]]],
};

const OFICIAL = 'ibge:malhas/v4';
const ESTIMADO = 'mock:sintetico';

/** Feição com contorno desenhado (ou não) e a procedência de cada parte. */
function uf(
  sigla: string,
  o: { geometria?: boolean; fonteGeometria?: string; fonteIndicadores?: string } = {},
): FeatureAPI {
  const { geometria = true, fonteGeometria = OFICIAL, fonteIndicadores = OFICIAL } = o;
  return {
    ...feature(
      propsUF({
        codigo_ibge: `c-${sigla}`,
        uf_sigla: sigla,
        fonte_geometria: fonteGeometria,
        fonte_indicadores: fonteIndicadores,
      }),
    ),
    geometry: geometria ? POLIGONO : null,
  };
}

const SIGLAS = ['AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'HH'];

describe('ehOficial', () => {
  it.each([
    [OFICIAL, true],
    ['  IBGE:malhas ', true], // ignora caixa e espaços
    [ESTIMADO, false],
    ['', false],
    [null, false],
    [undefined, false],
  ])('%j -> %s', (fonte, esperado) => {
    expect(ehOficial(fonte)).toBe(esperado);
  });
});

describe('avaliarProcedencia — como as UFs são citadas', () => {
  const detalheDe = (features: FeatureAPI[]) => avaliarProcedencia(features).detalhe;

  it('usa a sigla da UF; sem sigla, o código IBGE; sem código, o nome', () => {
    const semSigla = { ...uf('X', { geometria: false }), properties: { ...propsUF({ uf_sigla: undefined, codigo_ibge: '99' }) } };
    const semCodigo = {
      ...uf('Y', { geometria: false }),
      properties: { ...propsUF({ uf_sigla: undefined, codigo_ibge: undefined as unknown as string, nome: 'Terra Nova' }) },
    };

    expect(detalheDe([uf('AA'), uf('BB'), semSigla, semCodigo])).toContain('99, Terra Nova não aparecem no mapa');
  });

  it('lista até 4 UFs inteiras', () => {
    const detalhe = detalheDe([...SIGLAS.slice(0, 4).map((s) => uf(s, { fonteGeometria: ESTIMADO })), uf('ZZ')]);

    expect(detalhe).toContain('O contorno de AA, BB, CC, DD é aproximado');
    expect(detalhe).not.toContain('e mais');
  });

  it('acima de 4, resume o resto em "e mais N"', () => {
    const detalhe = detalheDe([...SIGLAS.slice(0, 6).map((s) => uf(s, { fonteGeometria: ESTIMADO })), uf('ZZ'), uf('YY')]);

    expect(detalhe).toContain('O contorno de AA, BB, CC, DD e mais 2 é aproximado');
  });
});

describe('avaliarProcedencia — estados sem contorno', () => {
  it('um só sem contorno: "não aparece"', () => {
    const p = avaliarProcedencia([uf('AA', { geometria: false }), uf('BB'), uf('CC')]);

    expect(p.detalhe).toContain('AA não aparece no mapa: contorno não carregado');
    expect(p.nivel).toBe('parcial');
    expect(p.titulo).toBe('Dados parcialmente estimados');
  });

  it('vários sem contorno: "não aparecem"', () => {
    const p = avaliarProcedencia([uf('AA', { geometria: false }), uf('BB', { geometria: false }), uf('CC')]);

    expect(p.detalhe).toContain('AA, BB não aparecem no mapa: contorno não carregado');
  });

  it('nenhum contorno carregado: o mapa está sem desenho', () => {
    const p = avaliarProcedencia([uf('AA', { geometria: false }), uf('BB', { geometria: false })]);

    expect(p.detalhe).toContain('Nenhum contorno foi carregado — o mapa está sem desenho');
  });

  it('quem não tem contorno não é chamado de "aproximado" também', () => {
    const p = avaliarProcedencia([uf('AA', { geometria: false }), uf('BB', { fonteGeometria: ESTIMADO }), uf('CC')]);

    expect(p.detalhe).toContain('AA não aparece');
    expect(p.detalhe).toContain('o contorno de BB é aproximado');
    expect(p.ufsGeometriaEstimada).toEqual(['AA', 'BB']);
  });

  it('declarar "ibge:" sem trazer o polígono não conta como contorno oficial', () => {
    const p = avaliarProcedencia([uf('AA', { geometria: false, fonteGeometria: OFICIAL }), uf('BB')]);

    expect(p.ufsGeometriaEstimada).toEqual(['AA']);
  });
});

describe('avaliarProcedencia — indicadores', () => {
  it('todos os indicadores de referência: a frase fala do conjunto', () => {
    const p = avaliarProcedencia([uf('AA', { fonteIndicadores: ESTIMADO }), uf('BB', { fonteIndicadores: ESTIMADO })]);

    expect(p.detalhe).toContain('Os indicadores socioeconômicos são valores de referência, não extração oficial');
  });

  it('só alguns indicadores de referência: cita quais', () => {
    const p = avaliarProcedencia([uf('AA', { fonteIndicadores: ESTIMADO }), uf('BB'), uf('CC')]);

    expect(p.detalhe).toContain('Os indicadores de AA são valores de referência');
    expect(p.ufsIndicadoresEstimados).toEqual(['AA']);
  });

  it('tudo estimado (contorno e indicadores) é "Dados estimados"', () => {
    const p = avaliarProcedencia([
      uf('AA', { fonteGeometria: ESTIMADO, fonteIndicadores: ESTIMADO }),
      uf('BB', { fonteGeometria: ESTIMADO, fonteIndicadores: ESTIMADO }),
    ]);

    expect(p).toMatchObject({ nivel: 'estimado', mostrarSelo: true, titulo: 'Dados estimados' });
    expect(p.detalhe).toContain('Os contornos do mapa são aproximados');
    expect(p.detalhe.endsWith('Não use estes números como dado oficial em relatório.')).toBe(true);
  });

  it('tudo oficial desliga o selo', () => {
    const p = avaliarProcedencia([uf('AA'), uf('BB')]);

    expect(p).toMatchObject({ nivel: 'oficial', mostrarSelo: false, total: 2 });
    expect(p.detalhe).toContain('das 2 unidades');
  });

  it('coleção vazia liga o selo: na dúvida, avisa', () => {
    expect(avaliarProcedencia([])).toMatchObject({ nivel: 'estimado', mostrarSelo: true, total: 0, titulo: 'Sem dados para exibir' });
  });
});
