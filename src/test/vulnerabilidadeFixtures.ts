/**
 * Fixtures do mapa de vulnerabilidade, com números na ordem de grandeza real
 * (Maranhão, resposta mock da API — card RDB-2: só indicadores oficiais).
 */

import type {
  FeatureAPI,
  IndicadoresOficiaisAPI,
  VulnerabilidadePropertiesAPI,
} from '../domain/entities/VulnerabilidadeGeoAPI';

export function indicadoresUF(
  sobrescrever: Partial<IndicadoresOficiaisAPI> = {},
): IndicadoresOficiaisAPI {
  return {
    populacao: 6_776_699,
    populacao_fonte: 'ibge:sidra/4709-v93',
    populacao_periodo: '2022',
    renda_media: 872,
    renda_media_fonte: 'ibge:pnad-continua-2024-rendimento-domiciliar-per-capita',
    renda_media_ano: 2024,
    renda_media_coletado_em: '2026-10-20',
    ...sobrescrever,
  };
}

type SobrescreverPropsUF = Partial<Omit<VulnerabilidadePropertiesAPI, 'indicadores'>> & {
  indicadores?: Partial<IndicadoresOficiaisAPI> | null;
};

export function propsUF(sobrescrever: SobrescreverPropsUF = {}): VulnerabilidadePropertiesAPI {
  const { indicadores, ...resto } = sobrescrever;
  return {
    codigo_ibge: '21',
    nome: 'Maranhão',
    nivel: 'uf',
    uf_sigla: 'MA',
    nome_qualificado: 'Maranhão (MA)',
    regiao: 'Nordeste',
    populacao: 6_776_699,
    indicadores: indicadores === null ? null : { ...indicadoresUF(), ...indicadores },
    fonte_geometria: 'ibge:malhas/v4',
    fonte_indicadores:
      'ibge:pnad-continua-2024-rendimento-domiciliar-per-capita (renda domiciliar per capita, 2024) + ibge:sidra/4709-v93 (população residente, Censo 2022)',
    ...resto,
  };
}

export const feature = (p: VulnerabilidadePropertiesAPI): FeatureAPI => ({
  type: 'Feature',
  geometry: null,
  properties: p,
});
