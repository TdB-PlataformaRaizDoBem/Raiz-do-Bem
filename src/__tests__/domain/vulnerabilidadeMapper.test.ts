import { describe, expect, it } from 'vitest';
import type {
  AnaliseColecaoAPI,
  AnaliseUnidadeAPI,
  ColecaoVulnerabilidadeAPI,
  ComponentesScoreAPI,
  Geometry,
} from '../../domain/entities/VulnerabilidadeGeoAPI';
import {
  ehPoligono,
  METADADOS_INDICADOR,
  propsDaFeature,
  toColecaoViewModel,
  toRegiaoViewModel,
} from '../../domain/mappers/VulnerabilidadeMapper';
import { ANALISE_COLECAO, feature, propsUF } from '../../test/vulnerabilidadeFixtures';

/** Região mínima: só os campos obrigatórios da API, sem nenhum dos opcionais. */
const minima = () =>
  toRegiaoViewModel(
    feature(
      propsUF({
        nome_qualificado: undefined,
        uf_sigla: undefined,
        uf_nome: undefined,
        regiao: undefined,
        demanda_atendimentos_prevista: undefined,
        centroide: undefined,
        simulacao: undefined,
        demanda_por_1000_hab: undefined,
        predicao_fora_da_distribuicao: undefined,
        componentes: undefined,
        indicadores: undefined,
        analise: undefined,
        fonte_geometria: undefined,
        fonte_indicadores: undefined,
      }),
    ),
  );

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
      demandaPrevista: null,
      centroide: null,
      simulacao: null,
      demandaPor1000: null,
      extrapolado: false,
      fatores: [],
      indicadores: null,
      analise: null,
      fonteGeometria: 'desconhecida',
      fonteIndicadores: 'desconhecida',
    });
  });
});

describe('toRegiaoViewModel — campos presentes', () => {
  it('inverte o centroide de [lon, lat] (GeoJSON) para [lat, lon] (Leaflet)', () => {
    const r = toRegiaoViewModel(feature(propsUF({ centroide: [-45.28, -5.08] })));

    expect(r.centroide).toEqual([-5.08, -45.28]);
  });

  it('só marca como extrapolado quando a API diz exatamente true', () => {
    expect(toRegiaoViewModel(feature(propsUF({ predicao_fora_da_distribuicao: true }))).extrapolado).toBe(true);
    expect(toRegiaoViewModel(feature(propsUF({ predicao_fora_da_distribuicao: false }))).extrapolado).toBe(false);
  });

  it('traduz os indicadores e calcula o déficit de dentistas contra a referência de 2 por mil', () => {
    const r = toRegiaoViewModel(feature(propsUF()));

    expect(r.indicadores).toMatchObject({
      rendaMedia: 872,
      idh: 0.676,
      dentistasPor1000: 0.61,
      taxaPobreza: 53.8,
      acessoSaudePercent: 36,
    });
    expect(r.indicadores?.deficitDentistas).toBeCloseTo(1.39);
  });

  it('o déficit de dentistas nunca é negativo', () => {
    const base = propsUF();
    const r = toRegiaoViewModel(feature(propsUF({ indicadores: { ...base.indicadores!, dentistas_por_1000: 3.4 } })));

    expect(r.indicadores?.deficitDentistas).toBe(0);
  });

  it('traduz a simulação do back-end', () => {
    const r = toRegiaoViewModel(feature(propsUF()));

    expect(r.simulacao).toEqual({
      demandaPublicoAlvo: 200_000,
      capacidadeSimulada: 0,
      demandaResidual: 200_000,
      coberturaPercent: 0,
      voluntariosAplicados: 0,
      voluntariosFaltantes: 1667,
      simulado: false,
    });
  });
});

describe('toRegiaoViewModel — fatores do índice', () => {
  const comp = (o: Partial<ComponentesScoreAPI> = {}): ComponentesScoreAPI => ({
    pobreza: 0.5,
    idh_invertido: 0.2,
    acesso_saude_invertido: 0.4,
    pesos: { pobreza: 0.4, idh_invertido: 0.35, acesso_saude_invertido: 0.25 },
    ...o,
  });
  const fatores = (componentes: ComponentesScoreAPI) => toRegiaoViewModel(feature(propsUF({ componentes }))).fatores;

  it('decompõe o índice em 3 fatores com rótulo e descrição em linguagem de gestor', () => {
    const lista = fatores(comp());

    expect(lista.map((f) => [f.chave, f.label])).toEqual([
      ['pobreza', 'Pobreza'],
      ['idh_invertido', 'Déficit de IDH'],
      ['acesso_saude_invertido', 'Falta de acesso à saúde'],
    ]);
    expect(lista[0].descricao).toBe('População abaixo da linha de pobreza');
    expect(lista[1].descricao).toBe('Distância até o IDH máximo (1,00)');
    expect(lista[2].descricao).toBe('População sem acesso regular a serviço de saúde');
  });

  it('a contribuição de cada fator é proporcional a valor × peso e soma 100%', () => {
    const lista = fatores(comp());

    // produtos: 0,20 · 0,07 · 0,10 → soma 0,37
    expect(lista[0].contribuicaoPercent).toBeCloseTo((0.2 / 0.37) * 100);
    expect(lista[1].contribuicaoPercent).toBeCloseTo((0.07 / 0.37) * 100);
    expect(lista[2].contribuicaoPercent).toBeCloseTo((0.1 / 0.37) * 100);
    expect(lista.reduce((acc, f) => acc + f.contribuicaoPercent, 0)).toBeCloseTo(100);
    expect(lista[0]).toMatchObject({ valor: 0.5, peso: 0.4 });
  });

  it('score zero (soma zero) não divide por zero: todas as contribuições são 0', () => {
    const lista = fatores(comp({ pobreza: 0, idh_invertido: 0, acesso_saude_invertido: 0 }));

    expect(lista.map((f) => f.contribuicaoPercent)).toEqual([0, 0, 0]);
  });

  it('sem pesos informados, cada peso vale 0', () => {
    const lista = fatores(comp({ pesos: undefined as unknown as Record<string, number> }));

    expect(lista.map((f) => f.peso)).toEqual([0, 0, 0]);
    expect(lista.map((f) => f.contribuicaoPercent)).toEqual([0, 0, 0]);
  });

  it('componente ausente vale 0', () => {
    const lista = fatores(comp({ idh_invertido: undefined as unknown as number }));

    expect(lista[1].valor).toBe(0);
    expect(lista[1].contribuicaoPercent).toBe(0);
  });
});

describe('análise da região', () => {
  const analise = (o: Partial<AnaliseUnidadeAPI> = {}): AnaliseUnidadeAPI => ({ ...propsUF().analise!, ...o });
  const montar = (a: AnaliseUnidadeAPI | null | undefined) =>
    toRegiaoViewModel(feature(propsUF({ analise: a }))).analise;

  it.each([[null], [undefined]])('sem análise (%s) o bloco some', (ausente) => {
    expect(montar(ausente)).toBeNull();
  });

  it('indicador novo no back-end é ignorado em vez de derrubar a tela antiga', () => {
    const base = propsUF().analise!;
    const resultado = montar(
      analise({ comparativo: [...base.comparativo, { ...base.comparativo[0], indicador: 'indicador_novo' as never }] }),
    );

    expect(resultado?.comparativo).toHaveLength(base.comparativo.length);
  });

  it('desvio ausente vira null', () => {
    const base = propsUF().analise!;
    const resultado = montar(
      analise({ comparativo: [{ ...base.comparativo[0], desvio_relativo_pct: undefined as unknown as number }] }),
    );

    expect(resultado?.comparativo[0].desvioPercent).toBeNull();
  });

  it('sensibilidade com campos opcionais ausentes vira null em cada um', () => {
    const resultado = montar(
      analise({ sensibilidade: { reducao_prioridade_por_100_voluntarios: 0.03 } as never }),
    );

    expect(resultado?.sensibilidade).toEqual({
      reducaoPor100Voluntarios: 0.03,
      voluntariosParaFaixaInferior: null,
      faixaInferior: null,
    });
  });

  it('sem sensibilidade, o campo é null', () => {
    expect(montar(analise({ sensibilidade: null }))?.sensibilidade).toBeNull();
  });
});

describe('METADADOS_INDICADOR — formatação de cada indicador', () => {
  it.each([
    ['taxa_pobreza', 53.8, '53,8%'],
    ['idh', 0.676, '0,676'],
    ['acesso_saude_pct', 36, '36,0%'],
    ['dentistas_por_1000', 0.61, '0,61'],
  ] as const)('%s: %f -> %s', (chave, valor, esperado) => {
    expect(METADADOS_INDICADOR[chave].formatar(valor)).toBe(esperado);
  });

  it('renda per capita em reais, sem centavos', () => {
    expect(METADADOS_INDICADOR.renda_media.formatar(872).replace(/\u00a0/g, ' ')).toBe('R$ 872');
  });

  it('cada indicador tem um rótulo próprio', () => {
    expect(Object.values(METADADOS_INDICADOR).map((m) => m.label)).toEqual([
      'Pobreza',
      'IDH',
      'Acesso à saúde',
      'Dentistas / mil hab.',
      'Renda per capita',
    ]);
  });
});

describe('toColecaoViewModel', () => {
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
      metodoScore: null,
      geradoEm: null,
      analise: null,
      totalExtrapoladas: 0,
    });
  });

  it('com metadados e paginação, repassa o que a API informou', () => {
    const c = toColecaoViewModel(
      vazia({
        features: [feature(propsUF({ predicao_fora_da_distribuicao: true })), feature(propsUF({ codigo_ibge: '35' }))],
        bbox: [-74, -34, -34, 6],
        paginacao: { total: 27 } as never,
        metadados: {
          nivel: 'uf',
          fonte: 'ibge',
          referencia_temporal: '2022',
          crs: 'EPSG:4326',
          metodo_score: 'v2',
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
      metodoScore: 'v2',
      geradoEm: '2026-03-09T10:00:00Z',
      totalExtrapoladas: 1,
    });
    expect(c.regioes).toHaveLength(2);
  });

  it('avalia a procedência sobre as feições recebidas', () => {
    const c = toColecaoViewModel(vazia());

    expect(c.procedencia.nivel).toBe('estimado');
    expect(c.procedencia.mostrarSelo).toBe(true);
  });

  describe('análise nacional', () => {
    const analise = (o: Partial<AnaliseColecaoAPI> = {}): AnaliseColecaoAPI => ({ ...ANALISE_COLECAO, ...o });
    const montar = (a: AnaliseColecaoAPI | null | undefined) => toColecaoViewModel(vazia({ analise: a })).analise;

    it.each([[null], [undefined]])('ausente (%s) vira null', (ausente) => {
      expect(montar(ausente)).toBeNull();
    });

    it('traduz referência, capacidade e parâmetros do modelo', () => {
      const a = montar(analise())!;

      expect(a.universo).toBe(27);
      expect(a.referencia).toEqual({ populacao: 203_079_313, scoreMedio: 0.2981, prioridadeMedia: 0.2914 });
      expect(a.capacidade).toMatchObject({ demandaPublicoAlvo: 6_305_096, coberturaPercent: 1.71, unidadesSimuladas: 1 });
      expect(a.parametros).toMatchObject({
        capacidadeAnualPorDentista: 120,
        fracaoPublicoAlvo: 0.51,
        periodo: 'anual',
        modelo: { disponivel: true, tipo: 'Pipeline', faixaPopulacaoTreino: [5000, 3_000_000], unidadesExtrapoladas: 19 },
      });
    });

    it('sem capacidade simulada, o campo é null', () => {
      expect(montar(analise({ capacidade: null }))?.capacidade).toBeNull();
    });

    it('modelo sem tipo informado vira null', () => {
      const base = ANALISE_COLECAO.parametros;
      const a = montar(analise({ parametros: { ...base, modelo: { ...base.modelo, tipo: undefined } } }));

      expect(a?.parametros.modelo.tipo).toBeNull();
    });
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
