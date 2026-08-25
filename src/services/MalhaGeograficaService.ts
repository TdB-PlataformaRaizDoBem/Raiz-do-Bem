/**
 * Malha cartográfica oficial das 27 UFs.
 *
 * -------------------------------------------------------------------------
 * POR QUE A GEOMETRIA VEM SEPARADA DOS INDICADORES
 * -------------------------------------------------------------------------
 *   Geometria   → estática, pesada (MB), muda a cada revisão censitária.
 *                 Cacheia no browser, baixa uma vez.
 *   Indicadores → dinâmicos, leves (KB), mudam a cada simulação de voluntários.
 *                 Vêm da API a cada consulta.
 *
 * O encontro é um JOIN por código IBGE, em memória. Efeitos: as fronteiras são
 * sempre as oficiais independentemente do estado da simulação; a API não trafega
 * megabytes de coordenadas a cada dentista digitado no simulador; e nenhuma
 * simplificação é necessária.
 *
 * -------------------------------------------------------------------------
 * A ORDEM DAS FONTES MUDOU (card RDB-2, passo 7)
 * -------------------------------------------------------------------------
 * Antes o navegador buscava a malha direto no IBGE. Agora a PRIMEIRA fonte é o
 * próprio `vulnerabilidade-api`:
 *
 *   1. vulnerabilidade-api   `/brasil?incluir_geometria=true`
 *   2. IBGE, direto          v4 e v3, como rede de segurança
 *
 * Três razões para a inversão:
 *
 *   a) PROCEDÊNCIA AUDITÁVEL. Só o servidor sabe se a malha passou na guarda de
 *      densidade e em que qualidade foi baixada, e é ele que carimba
 *      `fonte_geometria`. Quando o navegador buscava por conta própria, a
 *      procedência que chegava à tela era escrita pelo próprio front — ou seja,
 *      o front atestava a si mesmo.
 *   b) UMA DEPENDÊNCIA EXTERNA A MENOS no cliente. O IBGE fora do ar deixava o
 *      mapa sem contorno mesmo com a API respondendo normalmente.
 *   c) CACHE REAPROVEITADO. O servidor já mantém a malha em disco; cada
 *      navegador baixá-la de novo do IBGE é trabalho repetido.
 *
 * O caminho direto ao IBGE continua existindo porque ele resolve o caso em que
 * a API subiu sem `data/cache/` — aí o contorno oficial ainda chega à tela, e a
 * feição continua declarando honestamente de onde veio.
 *
 * -------------------------------------------------------------------------
 * A ARMADILHA DO PARÂMETRO `qualidade`
 * -------------------------------------------------------------------------
 * A API de Malhas aceita `minima | intermediaria | maxima`, e o PADRÃO É
 * `minima`. Um valor inválido pode fazer o servidor cair no padrão em vez de
 * retornar erro: o download "funciona", responde 200, e entrega a malha
 * grosseira — reintroduzindo o bug dos contornos em bloco sem nenhum sintoma.
 *
 * Por isso toda malha passa por uma guarda de densidade de vértices, dos dois
 * lados: aqui e em `app/data/geometrias.py`, com o mesmo piso. Silêncio é pior
 * que falha.
 */

import type {
  ColecaoVulnerabilidadeAPI,
  FeatureAPI,
  Geometry,
} from "../domain/entities/VulnerabilidadeGeoAPI";
import { ehOficial } from "../domain/procedencia";
import { getMalhaOficialBrasil } from "./VulnerabilidadeService";

const FORMATO = encodeURIComponent("application/vnd.geo+json");
const QUALIDADE = "maxima";

/** Média mínima de vértices por UF. Sergipe e Alagoas, os menores estados,
 *  passam de 300 em qualidade máxima; 150 rejeita a malha mínima com folga.
 *  MESMO valor de `VULN_MALHA_PISO_VERTICES` no back-end. */
const PISO_VERTICES = 150;

/** De onde vieram os contornos OFICIAIS. "nenhuma" = só há reserva sintética. */
export type OrigemMalha = "api" | "ibge" | "nenhuma";

export interface EntradaMalha {
  geometria: Geometry;
  /** Procedência DESTA geometria, no contrato `ibge:` / `mock:`. */
  fonte: string;
}

export interface MalhaCarregada {
  /**
   * Código IBGE da UF (2 dígitos) -> geometria e procedência.
   *
   * Guarda oficiais E sintéticas de propósito. Guardar só as oficiais faria a
   * UF cujo polígono o IBGE não entregou sumir do mapa — e um estado invisível
   * é pior que um estado desenhado com contorno aproximado e marcado como tal:
   * o primeiro não é comparado com nada, o segundo é comparado com ressalva.
   */
  porCodigo: Map<string, EntradaMalha>;
  /** Média de vértices das feições OFICIAIS — é sobre elas que o piso incide. */
  mediaVertices: number;
  origem: OrigemMalha;
  totalOficiais: number;
}

/** v4 primeiro, v3 como reserva de versão. */
const FONTES_IBGE = [4, 3].map(
  (versao) =>
    `https://servicodados.ibge.gov.br/api/v${versao}/malhas/paises/BR` +
    `?formato=${FORMATO}&qualidade=${QUALIDADE}&intrarregiao=UF`,
);

let cache: MalhaCarregada | null = null;
let emVoo: Promise<MalhaCarregada | null> | null = null;

export function limparCacheMalha(): void {
  cache = null;
  emVoo = null;
}

export function contarVertices(coords: unknown): number {
  if (!Array.isArray(coords)) return 0;
  if (typeof coords[0] === "number") return 1;
  let total = 0;
  for (const item of coords) total += contarVertices(item);
  return total;
}

/**
 * Indexa por código IBGE. A API do IBGE identifica a feição em
 * `properties.codarea`; aceitamos variações comuns para que trocar a fonte não
 * exija mexer no código.
 */
function indexarIbge(bruto: unknown, fonte: string): Map<string, EntradaMalha> {
  const indice = new Map<string, EntradaMalha>();
  const colecao = bruto as { features?: Array<Record<string, unknown>> };

  for (const feicao of colecao?.features ?? []) {
    const props = (feicao.properties ?? {}) as Record<string, unknown>;
    const codigo = props.codarea ?? props.cod_ibge ?? props.CD_UF ?? feicao.id;
    const geometria = feicao.geometry as Geometry | undefined;
    if (codigo == null || !geometria) continue;
    indice.set(String(codigo).trim(), { geometria, fonte });
  }
  return indice;
}

/**
 * Indexa a resposta do vulnerabilidade-api preservando a procedência declarada
 * feição a feição.
 *
 * A feição com `fonte_geometria: "mock:sintetico"` entra no índice, mas entra
 * carregando esse rótulo. É o que permite desenhá-la — para o estado não sumir
 * do mapa — sem que ela seja confundida com contorno oficial em nenhum ponto
 * do caminho até a tela.
 */
function indexarApi(colecao: ColecaoVulnerabilidadeAPI): Map<string, EntradaMalha> {
  const indice = new Map<string, EntradaMalha>();
  for (const feicao of colecao.features ?? []) {
    if (!feicao.geometry) continue;
    indice.set(String(feicao.properties.codigo_ibge).trim(), {
      geometria: feicao.geometry,
      fonte: feicao.properties.fonte_geometria ?? "mock:sintetico",
    });
  }
  return indice;
}

function oficiaisDe(indice: Map<string, EntradaMalha>): EntradaMalha[] {
  return [...indice.values()].filter((e) => ehOficial(e.fonte));
}

/**
 * Aplica a guarda de densidade às feições oficiais.
 *
 * Reprovar não descarta a malha inteira: REBAIXA as feições oficiais para
 * `mock:sintetico`. O contorno continua desenhado (o estado não some), mas
 * deixa de ser apresentado como oficial — que é exatamente o resultado correto
 * quando a densidade diz que aquilo não é a fronteira real.
 */
function aplicarGuarda(
  indice: Map<string, EntradaMalha>,
  origem: OrigemMalha,
  rotuloOrigem: string,
): MalhaCarregada | null {
  if (indice.size === 0) return null;

  const oficiais = oficiaisDe(indice);
  if (oficiais.length === 0) {
    return { porCodigo: indice, mediaVertices: 0, origem: "nenhuma", totalOficiais: 0 };
  }

  const media = Math.round(
    oficiais.reduce((acc, e) => acc + contarVertices(e.geometria.coordinates), 0) /
      oficiais.length,
  );

  if (media < PISO_VERTICES) {
    console.warn(
      `[malha] ${rotuloOrigem}: média de ${media} vértices por UF, abaixo do piso ` +
        `de ${PISO_VERTICES}. Provável malha simplificada — rebaixando para estimada.`,
    );
    for (const [codigo, entrada] of indice) {
      if (ehOficial(entrada.fonte)) {
        indice.set(codigo, { ...entrada, fonte: "mock:sintetico" });
      }
    }
    return { porCodigo: indice, mediaVertices: media, origem: "nenhuma", totalOficiais: 0 };
  }

  return { porCodigo: indice, mediaVertices: media, origem, totalOficiais: oficiais.length };
}

/** Contornos do IBGE têm precedência; o que ele não cobrir mantém a reserva. */
function mesclar(
  base: MalhaCarregada | null,
  preferida: MalhaCarregada,
): MalhaCarregada {
  if (!base) return preferida;
  const porCodigo = new Map(base.porCodigo);
  for (const [codigo, entrada] of preferida.porCodigo) porCodigo.set(codigo, entrada);
  return { ...preferida, porCodigo, totalOficiais: oficiaisDe(porCodigo).length };
}

/**
 * `fetch` cru, sem os headers do httpClient.
 *
 * Deliberado: `safeFetch` injeta `Authorization`, o que num GET cross-origin
 * dispara um preflight OPTIONS que o servidor do IBGE não responde — a malha
 * nunca chegaria. Aqui não há nada a autenticar: é dado público e estático.
 */
async function baixarDoIbge(url: string, sinal?: AbortSignal): Promise<unknown> {
  const resposta = await fetch(url, { signal: sinal, credentials: "omit" });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.json();
}

async function tentarApi(sinal?: AbortSignal): Promise<MalhaCarregada | null> {
  try {
    const colecao = await getMalhaOficialBrasil(sinal);
    return aplicarGuarda(indexarApi(colecao), "api", "vulnerabilidade-api");
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    console.warn("[malha] vulnerabilidade-api não serviu contorno:", erro);
    return null;
  }
}

async function tentarIbge(sinal?: AbortSignal): Promise<MalhaCarregada | null> {
  const fonte = `ibge:malhas/v4 qualidade=${QUALIDADE} (navegador)`;

  for (const url of FONTES_IBGE) {
    try {
      const aprovada = aplicarGuarda(
        indexarIbge(await baixarDoIbge(url, sinal), fonte),
        "ibge",
        url,
      );
      if (aprovada && aprovada.totalOficiais > 0) return aprovada;
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    }
  }
  return null;
}

/**
 * Carrega a malha das UFs.
 *
 * Ordem: vulnerabilidade-api primeiro; o IBGE direto só entra quando a API não
 * trouxe NENHUM contorno oficial. Se a API trouxe parte deles, os que faltaram
 * ficam com a reserva sintética e continuam marcados como estimados — buscar no
 * IBGE só aquela minoria trocaria uma volta de rede inteira por alguns
 * polígonos, e a coleção já acionaria o selo de qualquer forma.
 *
 * `null` só quando não há geometria nenhuma a desenhar.
 */
export async function carregarMalha(
  sinal?: AbortSignal,
): Promise<MalhaCarregada | null> {
  if (cache) return cache;
  if (emVoo) return emVoo;

  emVoo = (async () => {
    const daApi = await tentarApi(sinal);

    if (!daApi || daApi.totalOficiais === 0) {
      const doIbge = await tentarIbge(sinal);
      if (doIbge) {
        cache = mesclar(daApi, doIbge);
        return cache;
      }
    }

    cache = daApi;
    return cache;
  })().finally(() => {
    emVoo = null;
  });

  return emVoo;
}

// ---------------------------------------------------------------------------
// Join
// ---------------------------------------------------------------------------

export interface ResultadoJoin {
  colecao: ColecaoVulnerabilidadeAPI;
  origem: OrigemMalha;
}

/**
 * Substitui a geometria de cada feição pela oficial, casando por código IBGE.
 *
 * As `properties` — índices, simulação, hierarquia — são preservadas
 * integralmente. `fonte_geometria` só é reescrita para a feição que REALMENTE
 * recebeu contorno oficial, e com a string declarada pela fonte que o entregou.
 *
 * A versão anterior carimbava "IBGE — malha oficial" em toda feição, tivesse
 * ela recebido geometria ou não. O efeito era apagar o aviso do servidor: um
 * estado que o back-end marcou como `mock:sintetico` chegava à tela parecendo
 * oficial, e o selo de dados estimados nunca acendia.
 */
export function juntarGeometria(
  dados: ColecaoVulnerabilidadeAPI,
  malha: MalhaCarregada | null,
): ResultadoJoin {
  if (!malha) return { colecao: dados, origem: "nenhuma" };

  const features: FeatureAPI[] = dados.features.map((feicao) => {
    const entrada = malha.porCodigo.get(feicao.properties.codigo_ibge);
    if (!entrada) return feicao;
    return {
      ...feicao,
      geometry: entrada.geometria,
      bbox: null,
      properties: {
        ...feicao.properties,
        // A procedência acompanha a geometria que foi de fato colocada aqui.
        fonte_geometria: entrada.fonte,
      },
    };
  });

  return {
    colecao: { ...dados, features, bbox: calcularBbox(features) },
    origem: malha.origem,
  };
}

// ---------------------------------------------------------------------------
// bbox
// ---------------------------------------------------------------------------

function percorrer(coords: unknown, visitar: (lon: number, lat: number) => void) {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === "number" && typeof coords[1] === "number") {
    visitar(coords[0] as number, coords[1] as number);
    return;
  }
  for (const item of coords) percorrer(item, visitar);
}

/**
 * bbox do conjunto: [lonMin, latMin, lonMax, latMax].
 * Recalculado depois do join — o enquadramento se apoia nele, e o bbox da
 * geometria de reserva não corresponde ao território real.
 */
export function calcularBbox(
  features: FeatureAPI[],
): [number, number, number, number] | null {
  let lonMin = Infinity;
  let latMin = Infinity;
  let lonMax = -Infinity;
  let latMax = -Infinity;

  for (const feicao of features) {
    if (!feicao.geometry) continue;
    percorrer(feicao.geometry.coordinates, (lon, lat) => {
      if (lon < lonMin) lonMin = lon;
      if (lat < latMin) latMin = lat;
      if (lon > lonMax) lonMax = lon;
      if (lat > latMax) latMax = lat;
    });
  }

  return Number.isFinite(lonMin) ? [lonMin, latMin, lonMax, latMax] : null;
}
