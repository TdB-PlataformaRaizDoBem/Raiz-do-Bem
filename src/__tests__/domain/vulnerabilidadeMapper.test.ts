import { describe, expect, it } from 'vitest';
import type { ColecaoVulnerabilidadeAPI, Geometry } from '../../domain/entities/VulnerabilidadeGeoAPI';
import {
  ehPoligono,
  propsDaFeature,
  toColecaoViewModel,
} from '../../domain/mappers/VulnerabilidadeMapper';
import { feature, propsUF } from '../../test/vulnerabilidadeFixtures';

/** Região mínima: só os campos obrigatórios da API, sem nenhum dos opcionais. */
const minima = () =>
  toColecaoViewModel({
    type: 'FeatureCollection',
    features: [
      feature(
        propsUF({
          nome_qualificado: undefined,
          uf_sigla: undefined,
          uf_nome: undefined,
          regiao: undefined,
          centroide: undefined,
          indicadores: null,
          populacao: undefined,
          fonte_geometria: undefined,
          fonte_indicadores: undefined,
        }),
      ),
    ],
  }).regioes[0];

describe('toRegiaoViewModel — campos opcionais ausentes', () => {
  it('cai em valores neutros sem quebrar a tela', () => {
    const r = minima();

    expect(r).toMatchObject({
      codigoIbge: '21',
      nome: 'Maranhão',
      nomeQualificado: 'Maranhão', // sem nome qualificado usa o nome
      ufSigla: null,
      ufNome: null,
      regiao: null,
      populacao: null,
      centroide: null,
      fonteGeometria: 'desconhecida',
      fonteIndicadores: 'desconhecida',
    });
    // Sem `indicadores`, não há renda válida: fora do ranking — null, nunca
    // a cor do pior quintil (card RDB-2).
    expect(r.faixa).toBeNull();
    expect(r.indiceAtencao).toBeNull();
    expect(r.indicadores.rendaMedia).toBe(0);
  });
});

describe('toRegiaoViewModel — campos presentes', () => {
  it('inverte o centroide de [lon, lat] (GeoJSON) para [lat, lon] (Leaflet)', () => {
    const r = toColecaoViewModel({
      type: 'FeatureCollection',
      features: [feature(propsUF({ centroide: [-45.28, -5.08] }))],
    }).regioes[0];

    expect(r.centroide).toEqual([-5.08, -45.28]);
  });

  it('traduz renda e população oficiais, com fonte e ano', () => {
    const r = toColecaoViewModel({
      type: 'FeatureCollection',
      features: [feature(propsUF())],
    }).regioes[0];

    expect(r.indicadores).toMatchObject({
      populacao: 6_776_699,
      populacaoFonte: 'ibge:sidra/4709-v93',
      rendaMedia: 872,
      rendaFonte: 'ibge:pnad-continua-2024-rendimento-domiciliar-per-capita',
      rendaAno: 2024,
    });
  });

  it('população ausente (IBGE indisponível) vira null — nunca um valor de referência', () => {
    const r = toColecaoViewModel({
      type: 'FeatureCollection',
      features: [
        feature(
          propsUF({ populacao: undefined, indicadores: { populacao: undefined, populacao_fonte: undefined } }),
        ),
      ],
    }).regioes[0];

    expect(r.populacao).toBeNull();
    expect(r.indicadores.populacao).toBeNull();
    expect(r.indicadores.populacaoFonte).toBeNull();
  });
});

describe('toColecaoViewModel — ranking de renda', () => {
  const colecao = (rendas: Record<string, number>) =>
    toColecaoViewModel({
      type: 'FeatureCollection',
      features: Object.entries(rendas).map(([codigo, renda]) =>
        feature(propsUF({ codigo_ibge: codigo, indicadores: { renda_media: renda } })),
      ),
    });

  it('a menor renda do conjunto recebe a faixa de maior atenção', () => {
    const c = colecao({ '21': 900, '35': 2600, '12': 1500, '53': 3400, '43': 2700 });
    const porCodigo = new Map(c.regioes.map((r) => [r.codigoIbge, r]));

    expect(porCodigo.get('21')?.faixa).toBe('muito_alta');
    expect(porCodigo.get('53')?.faixa).toBe('muito_baixa');
    expect(porCodigo.get('21')?.indiceAtencao).toBeCloseTo(1);
    expect(porCodigo.get('53')?.indiceAtencao).toBeCloseTo(0);
  });

  it('o ranking é relativo ao conjunto: a mesma renda produz faixas diferentes em conjuntos diferentes', () => {
    const baixo = colecao({ '21': 900, '35': 1000 }); // 900 é a menor do par
    const alto = colecao({ '21': 900, '12': 100 }); // 900 passa a ser a maior do par

    const rendaMa = (c: ReturnType<typeof colecao>) => c.regioes.find((r) => r.codigoIbge === '21')!;

    expect(rendaMa(baixo).faixa).toBe('muito_alta');
    expect(rendaMa(alto).faixa).toBe('muito_baixa');
  });

  it('renda inválida (ausente, zero ou negativa) fica fora do ranking: faixa e índice null', () => {
    const c = colecao({ '21': 900, '35': 0, '12': -5 });
    const porCodigo = new Map(c.regioes.map((r) => [r.codigoIbge, r]));

    expect(porCodigo.get('35')?.faixa).toBeNull();
    expect(porCodigo.get('35')?.indiceAtencao).toBeNull();
    expect(porCodigo.get('12')?.faixa).toBeNull();
  });
});

describe('toColecaoViewModel — metadados', () => {
  const vazia = (o: Partial<ColecaoVulnerabilidadeAPI> = {}): ColecaoVulnerabilidadeAPI => ({
    type: 'FeatureCollection',
    features: [],
    ...o,
  });

  it('sem metadados, paginação nem bbox, usa valores neutros', () => {
    const c = toColecaoViewModel(vazia({ features: [feature(propsUF())] }));

    expect(c).toMatchObject({
      total: 1,
      bbox: null,
      cacheHit: false,
      referenciaTemporal: '—',
      fonte: '—',
      geradoEm: null,
    });
  });

  it('com metadados e paginação, repassa o que a API informou', () => {
    const c = toColecaoViewModel(
      vazia({
        features: [feature(propsUF()), feature(propsUF({ codigo_ibge: '35' }))],
        bbox: [-74, -34, -34, 6],
        paginacao: { total: 27 } as never,
        metadados: {
          nivel: 'uf',
          fonte: 'ibge',
          referencia_temporal: '2022',
          crs: 'EPSG:4326',
          metodo_score: 'nenhum',
          cache_hit: true,
          gerado_em: '2026-03-09T10:00:00Z',
        },
      }),
    );

    expect(c).toMatchObject({
      total: 27,
      bbox: [-74, -34, -34, 6],
      cacheHit: true,
      referenciaTemporal: '2022',
      fonte: 'ibge',
      geradoEm: '2026-03-09T10:00:00Z',
    });
    expect(c.regioes).toHaveLength(2);
  });

  it('avalia a procedência sobre as feições recebidas', () => {
    const c = toColecaoViewModel(vazia());

    expect(c.procedencia.nivel).toBe('estimado');
    expect(c.procedencia.mostrarSelo).toBe(true);
  });
});

describe('propsDaFeature', () => {
  it('devolve as propriedades quando a feição tem código IBGE em texto', () => {
    const props = propsUF();

    expect(propsDaFeature({ properties: props })).toBe(props);
  });

  it.each([
    ['feição ausente', undefined],
    ['sem propriedades', {}],
    ['propriedades nulas', { properties: null }],
    ['código que não é texto', { properties: { codigo_ibge: 21 } }],
  ])('%s -> null', (_nome, f) => {
    expect(propsDaFeature(f)).toBeNull();
  });
});

describe('ehPoligono', () => {
  const geometria = (type: string) => ({ type, coordinates: [] }) as unknown as Geometry;

  it.each([['Polygon'], ['MultiPolygon']])('%s tem área', (tipo) => {
    expect(ehPoligono(geometria(tipo))).toBe(true);
  });

  it.each([['Point'], ['LineString']])('%s não tem área', (tipo) => {
    expect(ehPoligono(geometria(tipo))).toBe(false);
  });

  it('sem geometria não é polígono', () => {
    expect(ehPoligono(null)).toBe(false);
  });
});
