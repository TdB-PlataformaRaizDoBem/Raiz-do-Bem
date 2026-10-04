/**
 * Serviço da API geográfica (FastAPI).
 *
 * Um único nível: as 27 UFs. Municípios e setores censitários foram removidos —
 * a base municipal cobria 1,1% dos 5.570 municípios do país, e agregar a partir
 * de uma amostra dessas subestimaria todos os estados.
 *
 * Segue o padrão dos demais services do projeto (safeFetch + handleResponse),
 * com duas diferenças justificadas:
 *
 * 1. BASE URL PRÓPRIA. Este back-end é um microsserviço analítico separado da
 *    API principal (Java, :8080). Por isso `VITE_GEO_API_URL`. Como `safeFetch`
 *    só prefixa quando o path não começa com "http", passar a URL absoluta
 *    funciona sem alterar o httpClient.
 *
 * 2. CACHE EM MEMÓRIA por cenário de simulação. O usuário monta o cenário
 *    estado a estado e volta atrás para comparar; sem cache, cada ida-e-volta
 *    seria uma requisição nova.
 *
 * -------------------------------------------------------------------------
 * DUAS CHAMADAS, DE PROPÓSITO
 * -------------------------------------------------------------------------
 *   getMalhaOficialBrasil()      UMA vez por sessão. Traz a geometria e a
 *                                procedência declarada pelo servidor. Pesada
 *                                (megabytes), estática, cacheada.
 *
 *   getVulnerabilidadeBrasil()   A CADA mudança no simulador, com
 *                                `incluir_geometria=false`. Leve (KB).
 *
 * Pedir geometria junto com os indicadores baixaria a malha inteira a cada
 * dentista digitado no simulador. A separação é a mesma que já existia quando a
 * malha vinha do IBGE pelo navegador — o que mudou é a ORIGEM preferencial, que
 * passou a ser esta API (ver MalhaGeograficaService).
 */

import type {
  ColecaoVulnerabilidadeAPI,
  ConsultaGeoParams,
} from "../domain/entities/VulnerabilidadeGeoAPI";
import { handleResponse, safeFetch } from "./httpClient";

const GEO_BASE_URL =
  import.meta.env.VITE_GEO_API_URL ?? "http://localhost:8000";

/**
 * Segmento do recurso na API. Trocar para "demanda" — caso as rotas do FastAPI
 * sejam renomeadas — é uma linha, e nenhum outro arquivo do front muda.
 */
const RECURSO = "vulnerabilidade";
const ENDPOINT = `${GEO_BASE_URL}/api/v1/${RECURSO}`;

const cache = new Map<string, ColecaoVulnerabilidadeAPI>();

export function limparCacheGeo(): void {
  cache.clear();
}

function montarQuery(params: ConsultaGeoParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null) query.set(chave, String(valor));
  });
  const texto = query.toString();
  return texto ? `?${texto}` : "";
}

/**
 * Busca a coleção. Sem laço de paginação: são 27 UFs e o back-end devolve o
 * conjunto inteiro — paginar aqui só criaria a chance de desenhar um Brasil
 * incompleto.
 */
async function buscarColecao(
  caminho: string,
  params: ConsultaGeoParams = {},
  sinal?: AbortSignal,
): Promise<ColecaoVulnerabilidadeAPI> {
  const chaveCache = `${caminho}${montarQuery(params)}`;
  const emCache = cache.get(chaveCache);
  if (emCache) return emCache;

  const res = await safeFetch(`${ENDPOINT}${caminho}${montarQuery(params)}`, {
    signal: sinal,
  });
  const dados = await handleResponse<ColecaoVulnerabilidadeAPI>(res);
  const resultado = dados ?? { type: "FeatureCollection" as const, features: [] };

  cache.set(chaveCache, resultado);
  return resultado;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /brasil — indicadores das 27 UFs, SEM geometria.
 *
 * `cenarioVoluntarios` no formato `MA:900,SP:4200`. Estados ausentes não são
 * simulados: mantêm a vulnerabilidade real. A string entra na chave de cache,
 * então voltar a um cenário já consultado é instantâneo — o que importa quando
 * o usuário está montando o cenário estado a estado e comparando.
 *
 * `incluir_geometria=false` mantém esta resposta em poucos KB. As `properties`
 * continuam trazendo `fonte_geometria`: o veredito do servidor sobre a
 * procedência do contorno viaja mesmo sem o contorno, e é ele que decide o selo.
 */
export function getVulnerabilidadeBrasil(
  cenarioVoluntarios = "",
): Promise<ColecaoVulnerabilidadeAPI> {
  const params: ConsultaGeoParams = { incluir_geometria: false };
  if (cenarioVoluntarios) params.voluntarios_por_uf = cenarioVoluntarios;
  return buscarColecao("/brasil", params);
}

/**
 * GET /brasil — a malha oficial servida pela própria API, uma vez por sessão.
 *
 * `tolerancia: 0` porque a geometria já chega na resolução escolhida no seed
 * (`VULN_IBGE_QUALIDADE_MALHA`): simplificar de novo só destruiria as curvas
 * reais das fronteiras. `incluir_indicadores=false` corta o que esta chamada
 * não usa — quem traz número é a chamada por cenário.
 */
export function getMalhaOficialBrasil(
  sinal?: AbortSignal,
): Promise<ColecaoVulnerabilidadeAPI> {
  return buscarColecao(
    "/brasil",
    { incluir_geometria: true, incluir_indicadores: false, tolerancia: 0 },
    sinal,
  );
}

/**
 * GET /api/v1/health — distingue "API fora do ar" de "modelo de ML
 * indisponível". Sem isso o usuário vê "—" e não sabe se é bug ou ausência.
 */
export interface SaudeGeoAPI {
  status: string;
  versao: string;
  fonte_dados: string;
  modelo: { carregado: boolean; tipo: string | null; erro: string | null };
  malha?: {
    oficial: boolean;
    origem: string | null;
    qualidade: string;
    media_vertices: number | null;
    piso_vertices: number;
  } | null;
}

export async function getSaudeGeoApi(): Promise<SaudeGeoAPI> {
  const res = await safeFetch(`${GEO_BASE_URL}/api/v1/health`);
  return handleResponse<SaudeGeoAPI>(res);
}
