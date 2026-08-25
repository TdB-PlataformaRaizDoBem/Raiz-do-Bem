/**
 * Mapper: DTO da API -> ViewModel de UI.
 *
 * Mesmo papel de Beneficiariomapper/DentistaMapper: a camada visual não deve
 * conhecer `snake_case` nem precisar tratar `null` vindo do back-end.
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

/** Um fator que compõe o score, já normalizado para exibição. */
export interface FatorViewModel {
  chave: "pobreza" | "idh_invertido" | "acesso_saude_invertido";
  label: string;
  descricao: string;
  /** Valor do fator em si, 0 a 1. */
  valor: number;
  /** Peso do fator na fórmula (0.40 / 0.35 / 0.25). */
  peso: number;
  /** Quanto este fator representa do score final, em % (0 a 100). */
  contribuicaoPercent: number;
}

export interface IndicadoresViewModel {
  populacao: number;
  rendaMedia: number;
  idh: number;
  dentistasPor1000: number;
  taxaPobreza: number;
  acessoSaudePercent: number;
  /** Quantos dentistas faltam para atingir a referência de 2 por 1.000 hab. */
  deficitDentistas: number;
}

export interface SimulacaoViewModel {
  /** Atendimentos/ano para o público da ONG. */
  demandaPublicoAlvo: number;
  capacidadeSimulada: number;
  demandaResidual: number;
  coberturaPercent: number;
  voluntariosAplicados: number;
  voluntariosFaltantes: number;
  /** False quando o estado não tem cenário — exibe a vulnerabilidade real. */
  simulado: boolean;
}

export interface RegiaoViewModel {
  codigoIbge: string;
  nome: string;
  nomeQualificado: string;
  nivel: NivelGeografico;

  ufSigla: string | null;
  ufNome: string | null;
  regiao: string | null;

  populacao: number;
  score: number;
  faixa: FaixaVulnerabilidade;

  demandaPrevista: number | null;
  /** [latitude, longitude] — ordem do Leaflet, já invertida. */
  centroide: [number, number] | null;

  /** Índice que colore o mapa. Reage à simulação de voluntários. */
  indicePrioridade: number;
  simulacao: SimulacaoViewModel | null;
  demandaPor1000: number | null;
  /** Predição feita fora da faixa de população vista no treino do modelo. */
  extrapolado: boolean;

  fatores: FatorViewModel[];
  indicadores: IndicadoresViewModel | null;

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
  /**
   * Quantas regiões trazem predição de demanda fora da faixa de população vista
   * no treino do modelo. Nenhuma delas deve ser lida como projeção confiável.
   */
  totalExtrapoladas: number;
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

const METADADOS_FATOR = {
  pobreza: {
    label: "Pobreza",
    descricao: "População abaixo da linha de pobreza",
  },
  idh_invertido: {
    label: "Déficit de IDH",
    descricao: "Distância até o IDH máximo (1,00)",
  },
  acesso_saude_invertido: {
    label: "Falta de acesso à saúde",
    descricao: "População sem acesso regular a serviço de saúde",
  },
} as const;

function montarFatores(props: VulnerabilidadePropertiesAPI): FatorViewModel[] {
  const comp = props.componentes;
  if (!comp) return [];

  const pesos = comp.pesos ?? {};
  const bruto = (
    ["pobreza", "idh_invertido", "acesso_saude_invertido"] as const
  ).map((chave) => {
    const valor = comp[chave] ?? 0;
    const peso = pesos[chave] ?? 0;
    return { chave, valor, peso, produto: valor * peso };
  });

  // A soma dos produtos é o próprio score; usar essa soma como denominador
  // evita divisão por zero quando o score é 0 e mantém o total em 100%.
  const soma = bruto.reduce((acc, f) => acc + f.produto, 0);

  return bruto.map((f) => ({
    chave: f.chave,
    label: METADADOS_FATOR[f.chave].label,
    descricao: METADADOS_FATOR[f.chave].descricao,
    valor: f.valor,
    peso: f.peso,
    contribuicaoPercent: soma > 0 ? (f.produto / soma) * 100 : 0,
  }));
}

export function toRegiaoViewModel(feature: FeatureAPI): RegiaoViewModel {
  const p = feature.properties;
  const ind = p.indicadores ?? null;

  return {
    codigoIbge: p.codigo_ibge,
    nome: p.nome,
    nomeQualificado: p.nome_qualificado ?? p.nome,
    nivel: p.nivel,

    ufSigla: p.uf_sigla ?? null,
    ufNome: p.uf_nome ?? null,
    regiao: p.regiao ?? null,

    populacao: p.populacao,
    score: p.score_vulnerabilidade,
    faixa: p.faixa,

    demandaPrevista: p.demanda_atendimentos_prevista ?? null,
    // GeoJSON entrega [lon, lat]; o Leaflet quer [lat, lon]. Invertido aqui,
    // num lugar só, para o resto do app nunca precisar pensar nisso.
    centroide: p.centroide ? [p.centroide[1], p.centroide[0]] : null,
    indicePrioridade: p.indice_prioridade,
    simulacao: p.simulacao
      ? {
          demandaPublicoAlvo: p.simulacao.demanda_publico_alvo,
          capacidadeSimulada: p.simulacao.capacidade_simulada,
          demandaResidual: p.simulacao.demanda_residual,
          coberturaPercent: p.simulacao.cobertura_percent,
          voluntariosAplicados: p.simulacao.voluntarios_aplicados,
          voluntariosFaltantes: p.simulacao.voluntarios_faltantes,
          simulado: p.simulacao.simulado,
        }
      : null,
    demandaPor1000: p.demanda_por_1000_hab ?? null,
    extrapolado: p.predicao_fora_da_distribuicao === true,

    fatores: montarFatores(p),
    indicadores: ind
      ? {
          populacao: ind.populacao,
          rendaMedia: ind.renda_media,
          idh: ind.idh,
          dentistasPor1000: ind.dentistas_por_1000,
          taxaPobreza: ind.taxa_pobreza,
          acessoSaudePercent: ind.acesso_saude_pct,
          deficitDentistas: Math.max(0, 2 - ind.dentistas_por_1000),
        }
      : null,

    fonteGeometria: p.fonte_geometria ?? "desconhecida",
    fonteIndicadores: p.fonte_indicadores ?? "desconhecida",
  };
}

export function toColecaoViewModel(
  api: ColecaoVulnerabilidadeAPI,
): ColecaoViewModel {
  const regioes = api.features.map(toRegiaoViewModel);

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
    totalExtrapoladas: regioes.filter((r) => r.extrapolado).length,
  };
}

/** Extrai o ViewModel de uma feature já dentro do Leaflet. */
export function propsDaFeature(
  feature: { properties?: unknown } | undefined,
): VulnerabilidadePropertiesAPI | null {
  const props = feature?.properties as VulnerabilidadePropertiesAPI | undefined;
  return props && typeof props.codigo_ibge === "string" ? props : null;
}

/** Verdadeiro se a geometria tem área (é clicável/pintável no mapa). */
export function ehPoligono(geometry: Geometry | null): boolean {
  return (
    geometry?.type === "Polygon" || geometry?.type === "MultiPolygon"
  );
}
