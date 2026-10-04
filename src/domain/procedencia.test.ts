/**
 * Testes da regra que decide se o usuário é avisado de que está olhando para um
 * número estimado.
 *
 * É o teste mais barato e mais importante deste card: se ele falhar, o painel
 * volta a apresentar contorno sintético e indicador de referência com a mesma
 * aparência de dado oficial — e a decisão de onde alocar mutirão passa a ser
 * tomada sobre um número inventado, sem nada na tela dizendo isso.
 */

import { describe, expect, it } from "vitest";

import type {
  FeatureAPI,
  PolygonGeometry,
} from "./entities/VulnerabilidadeGeoAPI";
import { avaliarProcedencia, ehOficial } from "./procedencia";

const OFICIAL_GEO = "ibge:malhas/v4 qualidade=intermediaria (cache em disco, 4218 vértices/UF)";
const OFICIAL_IND =
  "ibge:sidra/4709-v93 (população residente, Censo 2022) + mock:referencia (IDHM, pobreza e acesso à saúde)";
const MOCK_GEO = "mock:sintetico";
const MOCK_IND = "mock:referencia (IDHM 2021, PNAD Contínua, CFO)";

/** Polígono mínimo válido. O CONTEÚDO não importa aqui; a PRESENÇA importa. */
const GEOMETRIA: PolygonGeometry = {
  type: "Polygon",
  coordinates: [
    [
      [-46.6, -23.5],
      [-46.5, -23.5],
      [-46.5, -23.4],
      [-46.6, -23.5],
    ],
  ],
};

function feicao(
  sigla: string,
  fonteGeometria = OFICIAL_GEO,
  fonteIndicadores = OFICIAL_IND,
  geometria: FeatureAPI["geometry"] = GEOMETRIA,
): FeatureAPI {
  return {
    type: "Feature",
    id: sigla,
    geometry: geometria,
    properties: {
      codigo_ibge: sigla,
      nome: sigla,
      nivel: "uf",
      uf_sigla: sigla,
      populacao: 1_000_000,
      score_vulnerabilidade: 0.5,
      faixa: "media",
      indice_prioridade: 0.5,
      fonte_geometria: fonteGeometria,
      fonte_indicadores: fonteIndicadores,
    },
  };
}

const TODAS_OFICIAIS = ["MA", "SP", "BA"].map((s) => feicao(s));

// ---------------------------------------------------------------------------
// A regra do prefixo
// ---------------------------------------------------------------------------

describe("ehOficial", () => {
  it("aceita o prefixo ibge:", () => {
    expect(ehOficial(OFICIAL_GEO)).toBe(true);
    expect(ehOficial("IBGE:malhas/v4")).toBe(true);
    expect(ehOficial("  ibge:malhas/v4  ")).toBe(true);
  });

  it("recusa o prefixo mock:", () => {
    expect(ehOficial(MOCK_GEO)).toBe(false);
    expect(ehOficial(MOCK_IND)).toBe(false);
  });

  it("recusa ausência de declaração", () => {
    expect(ehOficial(undefined)).toBe(false);
    expect(ehOficial(null)).toBe(false);
    expect(ehOficial("")).toBe(false);
    expect(ehOficial("desconhecida")).toBe(false);
  });

  it("recusa string que só MENCIONA o IBGE sem declarar o prefixo", () => {
    // Regressão do bug real: o join no navegador carimbava
    // "IBGE — malha oficial (qualidade máxima)", que parece oficial para um
    // humano e não é reconhecido pela regra. Ou a string segue o contrato, ou
    // o dado conta como não declarado.
    expect(ehOficial("IBGE — malha oficial (qualidade máxima)")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// O selo
// ---------------------------------------------------------------------------

describe("avaliarProcedencia", () => {
  it("NÃO mostra o selo quando toda a coleção é oficial", () => {
    const p = avaliarProcedencia(TODAS_OFICIAIS);

    expect(p.mostrarSelo).toBe(false);
    expect(p.nivel).toBe("oficial");
    expect(p.ufsGeometriaEstimada).toEqual([]);
    expect(p.ufsIndicadoresEstimados).toEqual([]);
  });

  it("mostra o selo quando UMA ÚNICA feição tem geometria estimada", () => {
    const p = avaliarProcedencia([
      feicao("MA", MOCK_GEO),
      feicao("SP"),
      feicao("BA"),
    ]);

    expect(p.mostrarSelo).toBe(true);
    expect(p.nivel).toBe("parcial");
    expect(p.ufsGeometriaEstimada).toEqual(["MA"]);
    expect(p.detalhe).toContain("MA");
  });

  it("mostra o selo quando UMA ÚNICA feição tem indicadores estimados", () => {
    const p = avaliarProcedencia([
      feicao("MA"),
      feicao("SP", OFICIAL_GEO, MOCK_IND),
    ]);

    expect(p.mostrarSelo).toBe(true);
    expect(p.nivel).toBe("parcial");
    expect(p.ufsIndicadoresEstimados).toEqual(["SP"]);
  });

  it("classifica como estimado quando geometria E indicadores são mock em todas", () => {
    const p = avaliarProcedencia(
      ["MA", "SP", "BA"].map((s) => feicao(s, MOCK_GEO, MOCK_IND)),
    );

    expect(p.mostrarSelo).toBe(true);
    expect(p.nivel).toBe("estimado");
    expect(p.titulo).toBe("Dados estimados");
  });

  it("classifica como parcial quando só os indicadores são estimados", () => {
    const p = avaliarProcedencia(
      ["MA", "SP"].map((s) => feicao(s, OFICIAL_GEO, MOCK_IND)),
    );

    expect(p.nivel).toBe("parcial");
    expect(p.detalhe).toContain("valores de referência");
  });

  it("avisa diante de coleção vazia, em vez de calar", () => {
    const p = avaliarProcedencia([]);

    expect(p.mostrarSelo).toBe(true);
    expect(p.nivel).toBe("estimado");
    expect(p.total).toBe(0);
  });

  it("trata feição SEM contorno como estimada, mesmo declarando ibge:", () => {
    // O estado silencioso: o servidor tem a malha oficial e diz isso, mas a
    // requisição que traria os polígonos falhou. Sem esta regra, a UF sumiria
    // do mapa sem nenhum aviso na tela.
    const p = avaliarProcedencia([
      feicao("MA", OFICIAL_GEO, OFICIAL_IND, null),
      feicao("SP"),
    ]);

    expect(p.mostrarSelo).toBe(true);
    expect(p.ufsGeometriaEstimada).toEqual(["MA"]);
  });

  it("trata fonte ausente como estimada", () => {
    const feicaoSemDeclaracao = feicao("MA");
    delete feicaoSemDeclaracao.properties.fonte_geometria;
    delete feicaoSemDeclaracao.properties.fonte_indicadores;

    const p = avaliarProcedencia([feicaoSemDeclaracao]);
    expect(p.mostrarSelo).toBe(true);
  });

  it("resume a lista quando muitas UFs estão estimadas", () => {
    const siglas = ["AC", "AL", "AP", "AM", "BA", "CE"];
    const p = avaliarProcedencia(siglas.map((s) => feicao(s, MOCK_GEO)));

    expect(p.ufsGeometriaEstimada).toHaveLength(6);
    // 6 de 6 estimadas: a frase fala do conjunto, não enumera.
    expect(p.detalhe).toContain("contornos do mapa são aproximados");
  });

  it("nunca sugere usar número estimado como oficial", () => {
    const p = avaliarProcedencia([feicao("MA", MOCK_GEO)]);
    expect(p.detalhe).toContain("Não use estes números como dado oficial");
  });
});
