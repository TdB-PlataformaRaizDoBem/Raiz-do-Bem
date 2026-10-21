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

/**
 * Indicadores oficiais de uma UF (card RDB-2).
 *
 * `renda_media` é a única grandeza sempre presente — tabela anual versionada
 * (PNAD Contínua), nunca consultada em tempo real. `populacao` vem do SIDRA
 * quando o IBGE responde; ausente (não `null` dentro do objeto, a CHAVE some
 * do JSON por `response_model_exclude_none`) quando não.
 *
 * idh, taxa_pobreza, acesso_saude_pct e dentistas_por_1000 NÃO são campos
 * aqui: não têm fonte oficial versionada ainda, e o contrato é "campo
 * ausente", não `null` nem zero. Ver docs/PROCEDENCIA.md da API.
 */
export interface IndicadoresOficiaisAPI {
  populacao?: number | null;
  populacao_fonte?: string | null;
  populacao_periodo?: string | null;

  renda_media: number;
  renda_media_fonte: string;
  renda_media_ano: number;
  renda_media_coletado_em: string;
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

  /**
   * OPCIONAL de propósito: `null` quando o IBGE/SIDRA está indisponível — a
   * chave some do JSON (`response_model_exclude_none`). NUNCA um valor de
   * referência: UF sem dado é desenhada em cinza, nunca como zero.
   */
  populacao?: number | null;
  indicadores?: IndicadoresOficiaisAPI | null;

  /** [longitude, latitude] — enviado mesmo com incluir_geometria=false. */
  centroide?: [number, number] | null;

  fonte_geometria?: string;
  /**
   * Procedência dos indicadores. Nunca carrega o prefixo `mock:` (card
   * RDB-2): o que não tem fonte oficial não aparece "estimado", simplesmente
   * não aparece.
   */
  fonte_indicadores?: string;
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

/** Parâmetros de consulta aceitos pelo endpoint geográfico. */
export interface ConsultaGeoParams {
  limit?: number;
  offset?: number;
  ordenar_por?: "populacao_desc" | "nome_asc";
  /** Tolerância de simplificação em graus decimais. Deve acompanhar o zoom. */
  tolerancia?: number;
  incluir_geometria?: boolean;
  incluir_indicadores?: boolean;
}
