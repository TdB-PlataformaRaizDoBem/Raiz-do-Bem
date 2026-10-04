/**
 * Formatadores numéricos em pt-BR.
 *
 * Separados de `formatUtils.ts` (máscaras de documento) por responsabilidade:
 * aqui é apresentação de grandeza.
 *
 * Regra de produto adotada em todo o painel de vulnerabilidade: número grande
 * nunca aparece com todos os dígitos. "12.362.934" ocupa a atenção do leitor
 * com precisão que ele não vai usar; "12,4 mi" comunica a ordem de grandeza,
 * que é a informação que sustenta a decisão. O valor exato continua acessível
 * no tooltip.
 */

const NUMERO = new Intl.NumberFormat("pt-BR");
const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatNumero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return NUMERO.format(valor);
}

export function formatMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return MOEDA.format(valor);
}

export function formatPercent(
  valor: number | null | undefined,
  casas = 1,
): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return `${valor.toFixed(casas).replace(".", ",")}%`;
}

/** Score 0–1 apresentado como percentual inteiro: 0.304 -> "30%". */
export function formatPercentualIndice(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return `${Math.round(valor * 100)}%`;
}

/** Score com 2 casas — mantido para tooltips e exportações técnicas. */
export function formatScore(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return valor.toFixed(2).replace(".", ",");
}

/** 11.451.245 -> "11,5 mi" · 418.375 -> "418 mil" */
export function formatCompacto(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) {
    return `${(valor / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  }
  if (abs >= 10_000) {
    return `${Math.round(valor / 1_000)} mil`;
  }
  if (abs >= 1_000) {
    return `${(valor / 1_000).toFixed(1).replace(".", ",")} mil`;
  }
  return NUMERO.format(valor);
}

/**
 * Versão em duas partes, para exibir a unidade num tamanho tipográfico menor
 * ao lado do número — evita que "Milhões" compita com o dígito.
 */
export function partirCompacto(
  valor: number | null | undefined,
): { valor: string; unidade: string } {
  if (valor === null || valor === undefined || Number.isNaN(valor)) {
    return { valor: "—", unidade: "" };
  }
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) {
    return {
      valor: (valor / 1_000_000).toFixed(1).replace(".", ","),
      unidade: "milhões",
    };
  }
  if (abs >= 1_000) {
    return { valor: Math.round(valor / 1_000).toString(), unidade: "mil" };
  }
  return { valor: NUMERO.format(valor), unidade: "" };
}
