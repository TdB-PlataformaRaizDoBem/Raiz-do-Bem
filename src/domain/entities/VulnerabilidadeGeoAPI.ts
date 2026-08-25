/**
 * DTOs da API de Vulnerabilidade (FastAPI).
 *
 * Espelham exatamente o contrato do back-end — nenhum campo é renomeado aqui.
 * A tradução para linguagem de UI acontece em `domain/mappers/VulnerabilidadeMapper.ts`,
 * seguindo o mesmo padrão de BeneficiarioAPI -> Beneficiariomapper.
 *
 * A resposta é um GeoJSON FeatureCollection (RFC 7946, EPSG:4326). `paginacao`
 * e `metadados` são foreign members: o Leaflet ignora o que não conhece, então
 * a resposta continua sendo GeoJSON válido.
 */

/** A hierarquia termina no município — não existe nível de bairro/setor. */
/** Um único nível geográfico: a Unidade da Federação. */
export type NivelGeografico = "pais" | "uf";

export type FaixaVulnerabilidade =
  | "muito_baixa"
  | "baixa"
  | "media"
  | "alta"
  | "muito_alta";

export type RegiaoBrasil =
  | "Norte"
  | "Nordeste"
  | "Sudeste"
  | "Sul"
  | "Centro-Oeste";

/** RFC 7946: a ordem é SEMPRE [longitude, latitude]. */
export type Position = [number, number] | [number, number, number];

export interface PointGeometry {
  type: "Point";
  coordinates: Position;
}

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: Position[][];
}

export interface MultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: Position[][][];
}

export type Geometry = PointGeometry | PolygonGeometry | MultiPolygonGeometry;

export interface IndicadoresCensoAPI {
  populacao: number;
  renda_media: number;
  idh: number;
  dentistas_por_1000: number;
  taxa_pobreza: number;
  acesso_saude_pct: number;
}

export interface ComponentesScoreAPI {
  pobreza: number;
  idh_invertido: number;
  acesso_saude_invertido: number;
  pesos: Record<string, number>;
}

export interface VulnerabilidadePropertiesAPI {
  codigo_ibge: string;
  nome: string;
  nivel: NivelGeografico;

  regiao?: RegiaoBrasil | null;
  uf_sigla?: string | null;
  uf_codigo?: string | null;
  uf_nome?: string | null;
  nome_qualificado?: string | null;

  populacao: number;
  score_vulnerabilidade: number;
  faixa: FaixaVulnerabilidade;
  componentes?: ComponentesScoreAPI | null;
  indicadores?: IndicadoresCensoAPI | null;

  demanda_atendimentos_prevista?: number | null;
  /** [longitude, latitude] — enviado mesmo com incluir_geometria=false. */
  centroide?: [number, number] | null;
  demanda_por_1000_hab?: number | null;
  predicao_fora_da_distribuicao?: boolean | null;

  /** Resultado da simulação de dentistas voluntários. */
  simulacao?: SimulacaoAPI | null;
  /**
   * Índice que COLORE o mapa e ordena o ranking.
   * = score_vulnerabilidade × (demanda_residual / demanda_do_público_alvo).
   * Com zero voluntários é idêntico ao score de vulnerabilidade.
   */
  indice_prioridade: number;

  fonte_geometria?: string;
  fonte_indicadores?: string;
}

export interface SimulacaoAPI {
  /** Atendimentos/ano para o público da ONG: 9–17 anos + mulheres 9+. */
  demanda_publico_alvo: number;
  capacidade_simulada: number;
  demanda_residual: number;
  cobertura_percent: number;
  voluntarios_aplicados: number;
  voluntarios_faltantes: number;
  /** False quando o estado não tem cenário — mostra a vulnerabilidade real. */
  simulado: boolean;
}

export interface FeatureAPI {
  type: "Feature";
  id?: string | null;
  /**
   * OPCIONAL de propósito.
   *
   * Com `incluir_geometria=false` — o modo usado no nível de município — o
   * back-end omite a chave por completo (`response_model_exclude_none`), e não
   * a envia como `null`. Tipar como obrigatória faria o TypeScript prometer
   * algo que o JSON não cumpre.
   */
  geometry?: Geometry | null;
  properties: VulnerabilidadePropertiesAPI;
  bbox?: [number, number, number, number] | null;
}

export interface PaginacaoAPI {
  total: number;
  limit: number;
  offset: number;
  retornadas: number;
  tem_proxima: boolean;
  proximo_offset?: number | null;
}

export interface MetadadosAPI {
  nivel: string;
  fonte: string;
  referencia_temporal: string;
  crs: "EPSG:4326";
  tolerancia_simplificacao?: number | null;
  metodo_score: string;
  cache_hit: boolean;
  gerado_em: string;
}

export interface ColecaoVulnerabilidadeAPI {
  type: "FeatureCollection";
  features: FeatureAPI[];
  bbox?: [number, number, number, number] | null;
  paginacao?: PaginacaoAPI | null;
  metadados?: MetadadosAPI | null;
}

/** Parâmetros de consulta aceitos pelos três endpoints geográficos. */
export interface ConsultaGeoParams {
  limit?: number;
  offset?: number;
  ordenar_por?:
    | "prioridade_desc"
    | "prioridade_asc"
    | "populacao_desc"
    | "nome_asc"
    | "residual_desc";
  /** Tolerância de simplificação em graus decimais. Deve acompanhar o zoom. */
  tolerancia?: number;
  incluir_geometria?: boolean;
  incluir_indicadores?: boolean;
  faixa_minima?: FaixaVulnerabilidade;
  periodo?: "mensal" | "trimestral" | "anual";
  /** Cenário por estado, no formato `MA:900,SP:4200`. */
  voluntarios_por_uf?: string;
  capacidade_anual_por_dentista?: number;
}
