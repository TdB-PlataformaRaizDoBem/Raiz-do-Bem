/**
 * Regras da tabela técnica que não dependem de React: ordenação e o layout do
 * CSV exportado. Separadas do componente para serem testáveis sem DOM.
 */

import { baixarCsv, gerarCsv, type ColunaCsv } from "../utils/csvUtils";
import {
  METADADOS_INDICADOR,
  ROTULO_FAIXA,
  type RegiaoViewModel,
} from "./mappers/VulnerabilidadeMapper";

export type Direcao = "asc" | "desc";
export type ValorOrdenavel = number | string | null;

/**
 * Ordena sem mutar. Valores ausentes vão SEMPRE para o fim, nas duas
 * direções — senão "sem predição" apareceria como o estado mais coberto do
 * país. Empate desfeito pelo código IBGE: a ordem não "pisca" entre cliques.
 */
export function ordenarRegioes(
  regioes: RegiaoViewModel[],
  chave: (r: RegiaoViewModel) => ValorOrdenavel,
  direcao: Direcao,
): RegiaoViewModel[] {
  const fator = direcao === "asc" ? 1 : -1;
  return [...regioes].sort((a, b) => {
    const va = chave(a);
    const vb = chave(b);
    if (va === null && vb === null) return a.codigoIbge.localeCompare(b.codigoIbge);
    if (va === null) return 1;
    if (vb === null) return -1;
    const cmp =
      typeof va === "string" && typeof vb === "string"
        ? va.localeCompare(vb, "pt-BR")
        : (va as number) - (vb as number);
    return cmp !== 0 ? cmp * fator : a.codigoIbge.localeCompare(b.codigoIbge);
  });
}

const indicador = (r: RegiaoViewModel, chave: keyof typeof METADADOS_INDICADOR) =>
  r.analise?.comparativo.find((c) => c.chave === chave);

/** CSV completo: tudo que a tela mostra e mais o que ela resume. Nomes de
 *  coluna em snake_case, iguais aos do contrato da API — quem cruzar a
 *  planilha com o /docs não precisa de dicionário. */
export const COLUNAS_CSV: ColunaCsv<RegiaoViewModel>[] = [
  { cabecalho: "codigo_ibge", valor: (r) => r.codigoIbge },
  { cabecalho: "uf", valor: (r) => r.ufSigla },
  { cabecalho: "nome", valor: (r) => r.nome },
  { cabecalho: "regiao", valor: (r) => r.regiao },
  { cabecalho: "indice_prioridade", valor: (r) => r.indicePrioridade },
  { cabecalho: "faixa", valor: (r) => ROTULO_FAIXA[r.faixa] },
  { cabecalho: "score_vulnerabilidade", valor: (r) => r.score },
  { cabecalho: "posicao_prioridade", valor: (r) => r.analise?.posicaoPrioridade },
  { cabecalho: "posicao_vulnerabilidade", valor: (r) => r.analise?.posicaoVulnerabilidade },
  { cabecalho: "percentil_vulnerabilidade", valor: (r) => r.analise?.percentilVulnerabilidade },
  { cabecalho: "populacao", valor: (r) => r.populacao },
  ...(Object.keys(METADADOS_INDICADOR) as (keyof typeof METADADOS_INDICADOR)[]).flatMap(
    (chave): ColunaCsv<RegiaoViewModel>[] => [
      { cabecalho: chave, valor: (r) => indicador(r, chave)?.valor },
      { cabecalho: `${chave}_brasil`, valor: (r) => indicador(r, chave)?.referencia },
      { cabecalho: `${chave}_desvio_pct`, valor: (r) => indicador(r, chave)?.desvioPercent },
    ],
  ),
  { cabecalho: "demanda_bruta_ano", valor: (r) => r.demandaPrevista },
  { cabecalho: "demanda_publico_alvo_ano", valor: (r) => r.simulacao?.demandaPublicoAlvo },
  { cabecalho: "voluntarios_cenario", valor: (r) => r.simulacao?.voluntariosAplicados },
  { cabecalho: "capacidade_simulada_ano", valor: (r) => r.simulacao?.capacidadeSimulada },
  { cabecalho: "demanda_residual_ano", valor: (r) => r.simulacao?.demandaResidual },
  { cabecalho: "cobertura_pct", valor: (r) => r.simulacao?.coberturaPercent },
  { cabecalho: "voluntarios_para_zerar", valor: (r) => r.simulacao?.voluntariosFaltantes },
  {
    cabecalho: "reducao_prioridade_100_vol",
    valor: (r) => r.analise?.sensibilidade?.reducaoPor100Voluntarios,
  },
  {
    cabecalho: "voluntarios_para_faixa_inferior",
    valor: (r) => r.analise?.sensibilidade?.voluntariosParaFaixaInferior,
  },
  { cabecalho: "predicao_extrapolada", valor: (r) => (r.extrapolado ? "sim" : "nao") },
  { cabecalho: "fonte_geometria", valor: (r) => r.fonteGeometria },
  { cabecalho: "fonte_indicadores", valor: (r) => r.fonteIndicadores },
];

export function exportarRegioesCsv(regioes: RegiaoViewModel[], cenario: string): void {
  const data = new Date().toISOString().slice(0, 10);
  const sufixo = cenario ? "cenario" : "real";
  baixarCsv(`vulnerabilidade-uf-${sufixo}-${data}.csv`, gerarCsv(regioes, COLUNAS_CSV));
}
