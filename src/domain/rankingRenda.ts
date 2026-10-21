/**
 * Ranking relativo de renda das UFs.
 *
 * -------------------------------------------------------------------------
 * POR QUE EXISTE (card RDB-2)
 * -------------------------------------------------------------------------
 * O back-end deixou de calcular score de vulnerabilidade, predição de demanda
 * e simulação de capacidade: dependiam de IDH, taxa de pobreza e acesso à
 * saúde, que não têm fonte oficial ainda (ver docs/PROCEDENCIA.md da API). O
 * único indicador oficial e sempre presente é a renda domiciliar per capita
 * (PNAD Contínua). Este módulo deriva, NO CLIENTE, a mesma linguagem visual
 * de cinco faixas que o mapa já usava — agora a partir do ranking relativo de
 * renda entre as 27 UFs, e não de um índice calculado pelo servidor.
 *
 * Quanto MENOR a renda, MAIOR o nível de atenção: `indiceAtencao` vai de 0
 * (maior renda do conjunto) a 1 (menor renda do conjunto).
 *
 * -------------------------------------------------------------------------
 * RANKING RELATIVO, NÃO ABSOLUTO
 * -------------------------------------------------------------------------
 * As faixas são quintis do PRÓPRIO conjunto recebido — não um corte fixo em
 * reais. "Renda baixa" aqui significa "entre as menores rendas das UFs
 * presentes nesta resposta", igual ao que o back-end fazia com o score: a
 * régua se adapta ao universo, não a um valor absoluto decidido a priori.
 *
 * -------------------------------------------------------------------------
 * SEM DADO NUNCA É ZERO
 * -------------------------------------------------------------------------
 * Uma UF sem renda válida (ausente, não numérica ou ≤ 0 — não deveria
 * acontecer, já que a renda é uma tabela oficial sempre carregada, mas o
 * cliente nunca assume isso) NÃO entra no ranking e recebe `faixa: null` e
 * `indiceAtencao: null`. É o que faz o mapa desenhá-la em cinza — nunca na
 * cor do pior quintil, que seria o resultado de tratar "sem dado" como "o
 * valor mais baixo possível".
 *
 * Sem React, testável sem DOM — mesmo padrão de `domain/procedencia.ts`.
 */

import type { FaixaVulnerabilidade } from "./entities/VulnerabilidadeGeoAPI";

export interface ItemRenda {
  codigo: string;
  rendaMedia: number | null | undefined;
}

export interface PosicaoRenda {
  /** 0 (maior renda) a 1 (menor renda). Null quando a UF não entrou no ranking. */
  indiceAtencao: number | null;
  /** Faixa de atenção por quintil de renda. Null = sem dado, nunca uma faixa inventada. */
  faixa: FaixaVulnerabilidade | null;
  /** 1 = menor renda do conjunto (mais atenção). Null = sem dado. */
  posicao: number | null;
  /** Quantas UFs entraram no ranking (denominador de `posicao`). */
  total: number;
}

/** Em ordem crescente de atenção — índice 0 é a faixa de maior renda. */
const FAIXAS_POR_QUINTIL: FaixaVulnerabilidade[] = [
  "muito_baixa",
  "baixa",
  "media",
  "alta",
  "muito_alta",
];

function rendaValida(valor: number | null | undefined): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0;
}

/**
 * Calcula a posição relativa de cada item pela renda.
 *
 * SEMPRE sobre o conjunto INTEIRO recebido, nunca sobre um recorte filtrado —
 * mesmo princípio de `referencia_nacional` no back-end antigo: filtrar por
 * faixa não pode reescrever o que "faixa alta" significa.
 */
export function calcularRankingRenda(itens: ItemRenda[]): Map<string, PosicaoRenda> {
  const resultado = new Map<string, PosicaoRenda>();

  const validos = itens.filter((item) => rendaValida(item.rendaMedia));
  const total = validos.length;

  // Menor renda primeiro: posição 1 é quem precisa de mais atenção.
  const ordenados = [...validos].sort(
    (a, b) => (a.rendaMedia as number) - (b.rendaMedia as number),
  );

  ordenados.forEach((item, indice) => {
    // 1 (menor renda) -> 0 (maior renda). Um único item cai no meio da escala:
    // não há "relativo" a calcular com uma amostra de tamanho 1.
    const indiceAtencao = total > 1 ? 1 - indice / (total - 1) : 0.5;
    const quintil = Math.min(
      FAIXAS_POR_QUINTIL.length - 1,
      Math.floor(indiceAtencao * FAIXAS_POR_QUINTIL.length),
    );

    resultado.set(item.codigo, {
      indiceAtencao,
      faixa: FAIXAS_POR_QUINTIL[quintil],
      posicao: indice + 1,
      total,
    });
  });

  // UFs sem renda válida: sem dado, nunca zero (card RDB-2, item 6).
  for (const item of itens) {
    if (!resultado.has(item.codigo)) {
      resultado.set(item.codigo, { indiceAtencao: null, faixa: null, posicao: null, total });
    }
  }

  return resultado;
}
