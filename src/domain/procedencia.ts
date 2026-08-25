/**
 * Procedência do dado exibido no mapa.
 *
 * -------------------------------------------------------------------------
 * A REGRA DO PREFIXO
 * -------------------------------------------------------------------------
 * O back-end carimba `fonte_geometria` e `fonte_indicadores` em TODA feição, e
 * o contrato é o prefixo da string:
 *
 *     "ibge:..."   dado oficial
 *     "mock:..."   estimado (contorno sintético ou indicador de referência)
 *
 * Um prefixo, e não texto livre, porque a interface precisa decidir em tempo de
 * render se mostra o selo — e interpretar frase é a forma mais confiável de
 * errar essa decisão em silêncio.
 *
 * -------------------------------------------------------------------------
 * POR QUE UM ÚNICO ESTADO ESTIMADO ACENDE O SELO DA COLEÇÃO INTEIRA
 * -------------------------------------------------------------------------
 * O painel existe para comparar estados entre si — "vamos ao Maranhão antes de
 * ir a Santa Catarina". Se 26 estados são oficiais e um é estimado, a
 * comparação continua contaminada, porque o número estimado disputa o ranking
 * com os oficiais em pé de igualdade. Sinalizar só a feição afetada deixaria a
 * conclusão errada de pé.
 *
 * -------------------------------------------------------------------------
 * MÓDULO SEM REACT, DE PROPÓSITO
 * -------------------------------------------------------------------------
 * Esta é a regra que decide se o usuário é avisado de que está olhando para um
 * número inventado. Mantê-la fora do componente permite testá-la diretamente,
 * sem montar árvore nem depender de jsdom.
 */

import type { FeatureAPI } from "./entities/VulnerabilidadeGeoAPI";

export const PREFIXO_OFICIAL = "ibge:";
export const PREFIXO_ESTIMADO = "mock:";

export type NivelProcedencia = "oficial" | "parcial" | "estimado";

export interface Procedencia {
  nivel: NivelProcedencia;
  /** Verdadeiro sempre que houver ao menos um dado estimado na coleção. */
  mostrarSelo: boolean;
  total: number;
  /** Siglas das UFs cujo CONTORNO é sintético. */
  ufsGeometriaEstimada: string[];
  /** Siglas das UFs cujos INDICADORES não têm origem oficial. */
  ufsIndicadoresEstimados: string[];
  titulo: string;
  detalhe: string;
}

/** Uma fonte é oficial quando declara o prefixo `ibge:`. */
export function ehOficial(fonte: string | null | undefined): boolean {
  return (
    typeof fonte === "string" &&
    fonte.trim().toLowerCase().startsWith(PREFIXO_OFICIAL)
  );
}

/**
 * O contorno DESENHADO desta feição é oficial?
 *
 * Exige as duas coisas: a declaração de origem E a geometria presente. A
 * segunda condição cobre um estado silencioso e traiçoeiro — o servidor tem a
 * malha oficial e diz isso nas `properties`, mas a requisição que traria os
 * polígonos falhou. A feição então afirma `ibge:` e não desenha nada: o estado
 * some do mapa, ninguém é avisado, e a comparação visual passa a ser feita
 * entre 26 estados como se fossem 27.
 */
function contornoOficialPresente(feicao: FeatureAPI): boolean {
  return Boolean(feicao.geometry) && ehOficial(feicao.properties.fonte_geometria);
}

function siglaDa(feicao: FeatureAPI): string {
  return (
    feicao.properties.uf_sigla ??
    feicao.properties.codigo_ibge ??
    feicao.properties.nome
  );
}

function listar(siglas: string[], limite = 4): string {
  if (siglas.length <= limite) return siglas.join(", ");
  return `${siglas.slice(0, limite).join(", ")} e mais ${siglas.length - limite}`;
}

/**
 * Classifica a procedência de uma coleção inteira.
 *
 * Coleção vazia é tratada como `estimado` com selo LIGADO. É o comportamento
 * seguro: sem feição não há como afirmar que o dado é oficial, e o padrão
 * diante da dúvida tem que ser avisar, nunca calar.
 */
export function avaliarProcedencia(features: FeatureAPI[]): Procedencia {
  const total = features.length;

  if (total === 0) {
    return {
      nivel: "estimado",
      mostrarSelo: true,
      total: 0,
      ufsGeometriaEstimada: [],
      ufsIndicadoresEstimados: [],
      titulo: "Sem dados para exibir",
      detalhe:
        "Nenhuma unidade da federação foi retornada. Não há como atestar a origem do que está na tela.",
    };
  }

  const ufsGeometriaEstimada = features
    .filter((f) => !contornoOficialPresente(f))
    .map(siglaDa);

  const ufsIndicadoresEstimados = features
    .filter((f) => !ehOficial(f.properties.fonte_indicadores))
    .map(siglaDa);

  const geometriaOk = ufsGeometriaEstimada.length === 0;
  const indicadoresOk = ufsIndicadoresEstimados.length === 0;

  if (geometriaOk && indicadoresOk) {
    return {
      nivel: "oficial",
      mostrarSelo: false,
      total,
      ufsGeometriaEstimada,
      ufsIndicadoresEstimados,
      titulo: "Dados oficiais do IBGE",
      detalhe: `Contornos e indicadores das ${total} unidades vêm das APIs do IBGE.`,
    };
  }

  const tudoEstimado =
    ufsGeometriaEstimada.length === total && ufsIndicadoresEstimados.length === total;

  // As UFs sem NENHUMA geometria recebem frase própria: dizer "aproximado"
  // sobre um estado que não está desenhado no mapa seria descrever errado o que
  // a pessoa está vendo — e ela procuraria o contorno grosseiro que não existe.
  const semContorno = features.filter((f) => !f.geometry).map(siglaDa);

  const partes: string[] = [];
  if (semContorno.length > 0) {
    partes.push(
      semContorno.length === total
        ? "nenhum contorno foi carregado — o mapa está sem desenho"
        : `${listar(semContorno)} não ${semContorno.length === 1 ? "aparece" : "aparecem"} no mapa: contorno não carregado`,
    );
  }

  const aproximadas = ufsGeometriaEstimada.filter((s) => !semContorno.includes(s));
  if (aproximadas.length > 0) {
    partes.push(
      aproximadas.length === total
        ? "os contornos do mapa são aproximados"
        : `o contorno de ${listar(aproximadas)} é aproximado`,
    );
  }
  if (!indicadoresOk) {
    partes.push(
      ufsIndicadoresEstimados.length === total
        ? "os indicadores socioeconômicos são valores de referência, não extração oficial"
        : `os indicadores de ${listar(ufsIndicadoresEstimados)} são valores de referência`,
    );
  }

  return {
    nivel: tudoEstimado ? "estimado" : "parcial",
    mostrarSelo: true,
    total,
    ufsGeometriaEstimada,
    ufsIndicadoresEstimados,
    titulo: tudoEstimado ? "Dados estimados" : "Dados parcialmente estimados",
    detalhe: `${capitalizar(partes.join("; "))}. Não use estes números como dado oficial em relatório.`,
  };
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
