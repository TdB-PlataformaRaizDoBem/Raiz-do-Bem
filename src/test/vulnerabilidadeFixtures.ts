/**
 * Fixtures do mapa de vulnerabilidade, com números na ordem de grandeza real
 * (Maranhão, referência nacional da resposta mock da API).
 */

import type {
  AnaliseColecaoAPI,
  FeatureAPI,
  VulnerabilidadePropertiesAPI,
} from '../domain/entities/VulnerabilidadeGeoAPI';

export function propsUF(
  sobrescrever: Partial<VulnerabilidadePropertiesAPI> = {},
): VulnerabilidadePropertiesAPI {
  return {
    codigo_ibge: '21',
    nome: 'Maranhão',
    nivel: 'uf',
    uf_sigla: 'MA',
    nome_qualificado: 'Maranhão (MA)',
    regiao: 'Nordeste',
    populacao: 6_776_699,
    score_vulnerabilidade: 0.62,
    faixa: 'alta',
    indice_prioridade: 0.62,
    indicadores: {
      populacao: 6_776_699,
      renda_media: 872,
      idh: 0.676,
      dentistas_por_1000: 0.61,
      taxa_pobreza: 53.8,
      acesso_saude_pct: 36,
    },
    simulacao: {
      demanda_publico_alvo: 200_000,
      capacidade_simulada: 0,
      demanda_residual: 200_000,
      cobertura_percent: 0,
      voluntarios_aplicados: 0,
      voluntarios_faltantes: 1667,
      simulado: false,
    },
    analise: {
      posicao_prioridade: 1,
      posicao_vulnerabilidade: 1,
      total_unidades: 27,
      percentil_vulnerabilidade: 100,
      comparativo: [
        {
          indicador: 'taxa_pobreza',
          valor: 53.8,
          referencia_nacional: 28.59,
          desvio_relativo_pct: 88.18,
          desfavoravel: true,
        },
        {
          indicador: 'idh',
          valor: 0.676,
          referencia_nacional: 0.7547,
          desvio_relativo_pct: -10.43,
          desfavoravel: true,
        },
      ],
      sensibilidade: {
        reducao_prioridade_por_100_voluntarios: 0.0372,
        voluntarios_para_faixa_inferior: 54,
        faixa_inferior: 'media',
      },
    },
    fonte_geometria: 'ibge:malhas/v4',
    fonte_indicadores: 'mock:referencia',
    ...sobrescrever,
  };
}

export const feature = (p: VulnerabilidadePropertiesAPI): FeatureAPI => ({
  type: 'Feature',
  geometry: null,
  properties: p,
});

export const ANALISE_COLECAO: AnaliseColecaoAPI = {
  universo: 27,
  referencia_nacional: {
    populacao: 203_079_313,
    score_vulnerabilidade_medio: 0.2981,
    indice_prioridade_medio: 0.2914,
    indicadores: {
      taxa_pobreza: 28.59,
      idh: 0.7547,
      acesso_saude_pct: 60.84,
      dentistas_por_1000: 1.69,
      renda_media: 1853.62,
    },
  },
  capacidade: {
    demanda_publico_alvo: 6_305_096,
    capacidade_simulada: 108_000,
    demanda_residual: 6_197_096,
    cobertura_percent: 1.71,
    voluntarios_aplicados: 900,
    voluntarios_faltantes: 51_655,
    unidades_simuladas: 1,
  },
  parametros: {
    pesos_score: { pobreza: 0.4, idh_invertido: 0.35, acesso_saude_invertido: 0.25 },
    limiares_faixa: { muito_baixa: 0, baixa: 0.2, media: 0.4, alta: 0.6, muito_alta: 0.8 },
    capacidade_anual_por_dentista: 120,
    fracao_publico_alvo: 0.51,
    densidade_referencia_dentistas: 2,
    periodo: 'anual',
    modelo: {
      disponivel: true,
      tipo: 'Pipeline',
      faixa_populacao_treino: [5000, 3_000_000],
      unidades_extrapoladas: 19,
    },
  },
};
