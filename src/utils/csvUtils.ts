/**
 * Exportação CSV para planilhas em pt-BR.
 *
 * Três decisões que não são detalhe:
 *
 * 1. SEPARADOR `;` E VÍRGULA DECIMAL. É o que o Excel em pt-BR abre direto em
 *    colunas. Com `,` como separador, "0,47" quebraria em duas células.
 *
 * 2. BOM UTF-8. Sem ele o Excel lê "Maranhão" como "MaranhÃ£o".
 *
 * 3. NEUTRALIZAÇÃO DE FÓRMULA (CSV injection, OWASP). Texto que começa com
 *    `= + - @` é executado como fórmula ao abrir a planilha. Os nomes vêm de
 *    uma API externa: um texto como `=HYPERLINK(...)` não pode virar link
 *    clicável no computador do gestor. Números NÃO são neutralizados — o "-" de
 *    um desvio negativo é dado, e é formatado aqui, nunca vem de fora.
 */

export type ValorCelula = string | number | null | undefined;

export interface ColunaCsv<T> {
  cabecalho: string;
  valor: (linha: T) => ValorCelula;
}

const SEPARADOR = ";";
const INICIO_DE_FORMULA = /^[=+\-@\t\r]/;

export function escaparCelula(valor: ValorCelula): string {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? String(valor).replace(".", ",") : "";
  }
  let texto = valor;
  if (INICIO_DE_FORMULA.test(texto)) texto = `'${texto}`;
  if (/[";\n\r]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

export function gerarCsv<T>(linhas: T[], colunas: ColunaCsv<T>[]): string {
  const cabecalho = colunas.map((c) => escaparCelula(c.cabecalho)).join(SEPARADOR);
  const corpo = linhas.map((linha) =>
    colunas.map((c) => escaparCelula(c.valor(linha))).join(SEPARADOR),
  );
  return [cabecalho, ...corpo].join("\r\n");
}

export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob(["﻿", conteudo], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  // Adiado: revogar no mesmo tick cancela o download em alguns navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
