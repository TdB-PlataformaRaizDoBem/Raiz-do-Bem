/**
 * Mapper: DTO da API -> ViewModel de UI.
 *
 * Mesmo papel de Beneficiariomapper/DentistaMapper: a camada visual não deve
 * conhecer `snake_case` nem precisar tratar `null` vindo do back-end.
 */

import type {
  AnaliseColecaoAPI,
  AnaliseUnidadeAPI,
  ColecaoVulnerabilidadeAPI,
  FaixaVulnerabilidade,
  FeatureAPI,
  Geometry,
  IndicadorComparavel,
  NivelGeografico,
  VulnerabilidadePropertiesAPI,
} from "../entities/VulnerabilidadeGeoAPI";
import { formatMoeda, formatPercent } from "../../utils/numberUtils";
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

export interface ComparativoViewModel {
  chave: IndicadorComparavel;
  label: string;
  /** Formata o valor bruto do indicador para exibição. */
  formatar: (valor: number) => string;
  valor: number;
  referencia: number;
  /** Desvio relativo à média nacional, em % (positivo = acima). */
  desvioPercent: number | null;
  desfavoravel: boolean;
}

export interface SensibilidadeViewModel {
  /** Queda do índice de prioridade (0–1) com +100 voluntários. */
  reducaoPor100Voluntarios: number;
  voluntariosParaFaixaInferior: number | null;
  faixaInferior: FaixaVulnerabilidade | null;
}

export interface AnaliseViewModel {
  posicaoPrioridade: number;
  posicaoVulnerabilidade: number;
  totalUnidades: number;
  percentilVulnerabilidade: number;
  comparativo: ComparativoViewModel[];
  sensibilidade: SensibilidadeViewModel | null;
}

export interface AnaliseColecaoViewModel {
  universo: number;
  referencia: {
    populacao: number;
    scoreMedio: number;
    prioridadeMedia: number;
  };
  capacidade: {
    demandaPublicoAlvo: number;
    capacidadeSimulada: number;
    demandaResidual: number;
    coberturaPercent: number;
    voluntariosAplicados: number;
    voluntariosFaltantes: number;
    unidadesSimuladas: number;
  } | null;
  parametros: {
    pesos: Record<string, number>;
    limiaresFaixa: Record<FaixaVulnerabilidade, number>;
    capacidadeAnualPorDentista: number;
    fracaoPublicoAlvo: number;
    densidadeReferenciaDentistas: number;
    periodo: string;
    modelo: {
      disponivel: boolean;
      tipo: string | null;
      faixaPopulacaoTreino: [number, number];
      unidadesExtrapoladas: number;
    };
  };
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
  /** Null num back-end sem o campo: os blocos que dependem dele não aparecem. */
  analise: AnaliseViewModel | null;

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
  /** Referência nacional, totais e parâmetros. Null num back-end antigo. */
  analise: AnaliseColecaoViewModel | null;
  metodoScore: string | null;
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

const decimal = (casas: number) => (v: number) =>
  v.toFixed(casas).replace(".", ",");

/** Rótulo e formato de cada indicador comparável. Ordem = ordem de exibição. */
export const METADADOS_INDICADOR: Record<
  IndicadorComparavel,
  { label: string; formatar: (v: number) => string }
> = {
  taxa_pobreza: { label: "Pobreza", formatar: (v) => formatPercent(v) },
  idh: { label: "IDH", formatar: decimal(3) },
  acesso_saude_pct: { label: "Acesso à saúde", formatar: (v) => formatPercent(v) },
  dentistas_por_1000: { label: "Dentistas / mil hab.", formatar: decimal(2) },
  renda_media: { label: "Renda per capita", formatar: (v) => formatMoeda(v) },
};

function montarAnalise(api: AnaliseUnidadeAPI | null | undefined): AnaliseViewModel | null {
  if (!api) return null;
  const sens = api.sensibilidade;
  return {
    posicaoPrioridade: api.posicao_prioridade,
    posicaoVulnerabilidade: api.posicao_vulnerabilidade,
    totalUnidades: api.total_unidades,
    percentilVulnerabilidade: api.percentil_vulnerabilidade,
    comparativo: api.comparativo
      // Um indicador novo no back-end não pode derrubar a tela antiga.
      .filter((c) => c.indicador in METADADOS_INDICADOR)
      .map((c) => ({
        chave: c.indicador,
        label: METADADOS_INDICADOR[c.indicador].label,
        formatar: METADADOS_INDICADOR[c.indicador].formatar,
        valor: c.valor,
        referencia: c.referencia_nacional,
        desvioPercent: c.desvio_relativo_pct ?? null,
        desfavoravel: c.desfavoravel,
      })),
    sensibilidade: sens
      ? {
          reducaoPor100Voluntarios: sens.reducao_prioridade_por_100_voluntarios,
          voluntariosParaFaixaInferior: sens.voluntarios_para_faixa_inferior ?? null,
          faixaInferior: sens.faixa_inferior ?? null,
        }
      : null,
  };
}

function montarAnaliseColecao(
  api: AnaliseColecaoAPI | null | undefined,
): AnaliseColecaoViewModel | null {
  if (!api) return null;
  const p = api.parametros;
  const c = api.capacidade;
  return {
    universo: api.universo,
    referencia: {
      populacao: api.referencia_nacional.populacao,
      scoreMedio: api.referencia_nacional.score_vulnerabilidade_medio,
      prioridadeMedia: api.referencia_nacional.indice_prioridade_medio,
    },
    capacidade: c
      ? {
          demandaPublicoAlvo: c.demanda_publico_alvo,
          capacidadeSimulada: c.capacidade_simulada,
          demandaResidual: c.demanda_residual,
          coberturaPercent: c.cobertura_percent,
          voluntariosAplicados: c.voluntarios_aplicados,
          voluntariosFaltantes: c.voluntarios_faltantes,
          unidadesSimuladas: c.unidades_simuladas,
        }
      : null,
    parametros: {
      pesos: p.pesos_score,
      limiaresFaixa: p.limiares_faixa,
      capacidadeAnualPorDentista: p.capacidade_anual_por_dentista,
      fracaoPublicoAlvo: p.fracao_publico_alvo,
      densidadeReferenciaDentistas: p.densidade_referencia_dentistas,
      periodo: p.periodo,
      modelo: {
        disponivel: p.modelo.disponivel,
        tipo: p.modelo.tipo ?? null,
        faixaPopulacaoTreino: p.modelo.faixa_populacao_treino,
        unidadesExtrapoladas: p.modelo.unidades_extrapoladas,
      },
    },
  };
}

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
    analise: montarAnalise(p.analise),

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
    analise: montarAnaliseColecao(api.analise),
    metodoScore: api.metadados?.metodo_score ?? null,
    geradoEm: api.metadados?.gerado_em ?? null,
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
