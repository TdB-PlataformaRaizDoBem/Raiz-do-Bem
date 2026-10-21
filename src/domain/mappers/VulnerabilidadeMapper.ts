/**
 * Mapper: DTO da API -> ViewModel de UI.
 *
 * Mesmo papel de Beneficiariomapper/DentistaMapper: a camada visual não deve
 * conhecer `snake_case` nem precisar tratar `null` vindo do back-end.
 *
 * Card RDB-2: o back-end parou de calcular score de vulnerabilidade,
 * predição de demanda e simulação de capacidade (dependiam de indicadores
 * sem fonte oficial). `faixa` e `indiceAtencao` deste ViewModel não vêm mais
 * da API — são calculados aqui por `domain/rankingRenda.ts`, a partir do
 * ranking relativo de renda entre as UFs da coleção.
 */

import type {
  ColecaoVulnerabilidadeAPI,
  FaixaVulnerabilidade,
  FeatureAPI,
  Geometry,
  NivelGeografico,
  VulnerabilidadePropertiesAPI,
} from "../entities/VulnerabilidadeGeoAPI";
import { avaliarProcedencia, type Procedencia } from "../procedencia";
import { calcularRankingRenda } from "../rankingRenda";

export interface IndicadoresViewModel {
  /** Null quando o IBGE/SIDRA estava indisponível na consulta. */
  populacao: number | null;
  populacaoFonte: string | null;
  populacaoPeriodo: string | null;

  rendaMedia: number;
  rendaFonte: string;
  rendaAno: number;
  rendaColetadoEm: string;
}

export interface RegiaoViewModel {
  codigoIbge: string;
  nome: string;
  nomeQualificado: string;
  nivel: NivelGeografico;

  ufSigla: string | null;
  ufNome: string | null;
  regiao: string | null;

  /** Null quando o IBGE estava indisponível — nunca um valor de referência. */
  populacao: number | null;
  indicadores: IndicadoresViewModel;

  /** [latitude, longitude] — ordem do Leaflet, já invertida. */
  centroide: [number, number] | null;

  /**
   * Nível de atenção por RANKING RELATIVO de renda entre as UFs da coleção
   * (quintis, menor renda = mais atenção). Null quando a UF não tem renda
   * válida — não deveria ocorrer, já que a renda é uma tabela oficial sempre
   * carregada, mas o cliente nunca assume isso.
   */
  faixa: FaixaVulnerabilidade | null;
  /** 0 (maior renda do conjunto) a 1 (menor renda). Null junto com `faixa`. */
  indiceAtencao: number | null;
  /** 1 = menor renda do conjunto. Null junto com `faixa`. */
  posicaoRenda: number | null;
  /** Quantas UFs entraram no ranking — denominador de `posicaoRenda`. */
  totalRanking: number;

  fonteGeometria: string;
  fonteIndicadores: string;
}

export interface ColecaoViewModel {
  regioes: RegiaoViewModel[];
  /** GeoJSON cru, repassado ao Leaflet sem cópia desnecessária. */
  geojson: ColecaoVulnerabilidadeAPI;
  bbox: [number, number, number, number] | null;
  total: number;
  /** True quando o back-end serviu do cache — exibido como selo discreto. */
  cacheHit: boolean;
  referenciaTemporal: string;
  fonte: string;
  /**
   * Veredito de procedência da coleção inteira, derivado dos prefixos
   * `ibge:`/`mock:` que o servidor carimba em cada feição. É o que decide se o
   * selo de "dados estimados" aparece sobre o mapa.
   */
  procedencia: Procedencia;
  geradoEm: string | null;
}

export const ROTULO_FAIXA: Record<FaixaVulnerabilidade, string> = {
  muito_baixa: "Muito baixa",
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  muito_alta: "Muito alta",
};

export const ROTULO_NIVEL: Record<NivelGeografico, string> = {
  pais: "País",
  uf: "Estado",
};

function montarIndicadores(
  feature: FeatureAPI,
): IndicadoresViewModel {
  const ind = feature.properties.indicadores ?? null;
  const rendaMedia = ind?.renda_media ?? 0;

  return {
    populacao: feature.properties.populacao ?? ind?.populacao ?? null,
    populacaoFonte: ind?.populacao_fonte ?? null,
    populacaoPeriodo: ind?.populacao_periodo ?? null,
    rendaMedia,
    rendaFonte: ind?.renda_media_fonte ?? "desconhecida",
    rendaAno: ind?.renda_media_ano ?? 0,
    rendaColetadoEm: ind?.renda_media_coletado_em ?? "",
  };
}

function toRegiaoViewModel(
  feature: FeatureAPI,
  ranking: ReturnType<typeof calcularRankingRenda>,
): RegiaoViewModel {
  const p = feature.properties;
  const indicadores = montarIndicadores(feature);
  const posicao = ranking.get(p.codigo_ibge) ?? {
    indiceAtencao: null,
    faixa: null,
    posicao: null,
    total: 0,
  };

  return {
    codigoIbge: p.codigo_ibge,
    nome: p.nome,
    nomeQualificado: p.nome_qualificado ?? p.nome,
    nivel: p.nivel,

    ufSigla: p.uf_sigla ?? null,
    ufNome: p.uf_nome ?? null,
    regiao: p.regiao ?? null,

    populacao: indicadores.populacao,
    indicadores,

    // GeoJSON entrega [lon, lat]; o Leaflet quer [lat, lon]. Invertido aqui,
    // num lugar só, para o resto do app nunca precisar pensar nisso.
    centroide: p.centroide ? [p.centroide[1], p.centroide[0]] : null,

    faixa: posicao.faixa,
    indiceAtencao: posicao.indiceAtencao,
    posicaoRenda: posicao.posicao,
    totalRanking: posicao.total,

    fonteGeometria: p.fonte_geometria ?? "desconhecida",
    fonteIndicadores: p.fonte_indicadores ?? "desconhecida",
  };
}

export function toColecaoViewModel(api: ColecaoVulnerabilidadeAPI): ColecaoViewModel {
  // O ranking é calculado sobre o UNIVERSO inteiro da resposta, antes de
  // qualquer filtro de tela — mesmo princípio da antiga referência nacional
  // do back-end: filtrar por faixa não pode reescrever o que "faixa alta"
  // significa para quem não foi filtrado.
  const ranking = calcularRankingRenda(
    api.features.map((f) => ({
      codigo: f.properties.codigo_ibge,
      rendaMedia: f.properties.indicadores?.renda_media,
    })),
  );

  const regioes = api.features.map((f) => toRegiaoViewModel(f, ranking));

  return {
    regioes,
    geojson: api,
    bbox: api.bbox ?? null,
    total: api.paginacao?.total ?? api.features.length,
    cacheHit: api.metadados?.cache_hit ?? false,
    referenciaTemporal: api.metadados?.referencia_temporal ?? "—",
    fonte: api.metadados?.fonte ?? "—",
    // Avaliada aqui, sobre as features JÁ unidas à malha: o join pode promover
    // um contorno de sintético para oficial, e o selo tem que refletir o que
    // está desenhado na tela, não o que a API respondeu antes do join.
    procedencia: avaliarProcedencia(api.features),
    geradoEm: api.metadados?.gerado_em ?? null,
  };
}

/**
 * Properties de uma feição GeoJSON já com o nível de atenção calculado no
 * cliente (`faixa_atencao`/`indice_atencao`). É o formato que as camadas do
 * Leaflet (ChoroplethLayer, RegionMarkers) recebem — nunca a API crua, que
 * não envia mais faixa nem índice algum.
 */
export interface VulnerabilidadePropertiesComAtencao extends VulnerabilidadePropertiesAPI {
  faixa_atencao: FaixaVulnerabilidade | null;
  indice_atencao: number | null;
}

/**
 * Injeta `faixa_atencao`/`indice_atencao` nas properties de cada feição, a
 * partir do ranking relativo de renda calculado sobre TODA a coleção (nunca
 * sobre um recorte filtrado — ver `calcularRankingRenda`).
 */
export type FeatureComAtencao = FeatureAPI & { properties: VulnerabilidadePropertiesComAtencao };

export type ColecaoComAtencao = Omit<ColecaoVulnerabilidadeAPI, "features"> & {
  features: FeatureComAtencao[];
};

export function comNivelDeAtencao(colecao: ColecaoVulnerabilidadeAPI): ColecaoComAtencao {
  const ranking = calcularRankingRenda(
    colecao.features.map((f) => ({
      codigo: f.properties.codigo_ibge,
      rendaMedia: f.properties.indicadores?.renda_media,
    })),
  );

  return {
    ...colecao,
    features: colecao.features.map((f) => {
      const posicao = ranking.get(f.properties.codigo_ibge);
      return {
        ...f,
        properties: {
          ...f.properties,
          faixa_atencao: posicao?.faixa ?? null,
          indice_atencao: posicao?.indiceAtencao ?? null,
        },
      };
    }),
  };
}

/** Extrai o ViewModel de uma feature já dentro do Leaflet. */
export function propsDaFeature(
  feature: { properties?: unknown } | undefined,
): VulnerabilidadePropertiesComAtencao | null {
  const props = feature?.properties as VulnerabilidadePropertiesComAtencao | undefined;
  return props && typeof props.codigo_ibge === "string" ? props : null;
}

/** Verdadeiro se a geometria tem área (é clicável/pintável no mapa). */
export function ehPoligono(geometry: Geometry | null): boolean {
  return geometry?.type === "Polygon" || geometry?.type === "MultiPolygon";
}
