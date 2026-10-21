/**
 * Regras da tabela técnica que não dependem de React: ordenação e o layout do
 * CSV exportado. Separadas do componente para serem testáveis sem DOM.
 */

import { baixarCsv, gerarCsv, type ColunaCsv } from "../utils/csvUtils";
import { ROTULO_FAIXA, type RegiaoViewModel } from "./mappers/VulnerabilidadeMapper";

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

/**
 * CSV completo: tudo que a tela mostra e mais o que ela resume. Nomes de
 * coluna em snake_case, iguais aos do contrato da API — quem cruzar a
 * planilha com o /docs não precisa de dicionário.
 *
 * Card RDB-2: as colunas de score, simulação e análise saíram — o back-end
 * não as calcula mais. `indice_atencao`/`faixa_atencao` são calculados no
 * cliente a partir do ranking relativo de renda (`domain/rankingRenda.ts`),
 * não um dado vindo do servidor.
 */
export const COLUNAS_CSV: ColunaCsv<RegiaoViewModel>[] = [
  { cabecalho: "codigo_ibge", valor: (r) => r.codigoIbge },
  { cabecalho: "uf", valor: (r) => r.ufSigla },
  { cabecalho: "nome", valor: (r) => r.nome },
  { cabecalho: "regiao", valor: (r) => r.regiao },
  { cabecalho: "indice_atencao", valor: (r) => r.indiceAtencao },
  { cabecalho: "faixa_atencao", valor: (r) => (r.faixa ? ROTULO_FAIXA[r.faixa] : null) },
  { cabecalho: "posicao_ranking_renda", valor: (r) => r.posicaoRenda },
  { cabecalho: "populacao", valor: (r) => r.populacao },
  { cabecalho: "populacao_fonte", valor: (r) => r.indicadores.populacaoFonte },
  { cabecalho: "renda_media", valor: (r) => r.indicadores.rendaMedia },
  { cabecalho: "renda_media_fonte", valor: (r) => r.indicadores.rendaFonte },
  { cabecalho: "renda_media_ano", valor: (r) => r.indicadores.rendaAno },
  { cabecalho: "fonte_geometria", valor: (r) => r.fonteGeometria },
  { cabecalho: "fonte_indicadores", valor: (r) => r.fonteIndicadores },
];

export function exportarRegioesCsv(regioes: RegiaoViewModel[]): void {
  const data = new Date().toISOString().slice(0, 10);
  baixarCsv(`vulnerabilidade-uf-${data}.csv`, gerarCsv(regioes, COLUNAS_CSV));
}
