/**
 * Tabela estática das 27 Unidades da Federação.
 *
 * Existe por dois motivos operacionais:
 *
 * 1. NAVEGAÇÃO SEM DEPENDER DE CARGA. O seletor de UF do painel de filtros
 *    precisa estar populado mesmo quando o usuário já desceu para o nível de
 *    município e a coleção do Brasil não está mais em tela.
 *
 * 2. RÓTULO ANTES DA MALHA. Enquanto o GeoJSON oficial (vários MB) está a
 *    caminho, os badges de urgência já podem ser ancorados nestes centroides.
 *    O usuário vê os percentuais imediatamente; os contornos chegam depois e
 *    os badges se reposicionam sozinhos para o polo de inacessibilidade real.
 *
 * `centroide` está em [latitude, longitude] — ordem do Leaflet, não do GeoJSON.
 * São centros geográficos aproximados, adequados para ancorar rótulo; não use
 * para cálculo de distância ou análise espacial.
 */

export interface UnidadeFederativa {
  sigla: string;
  nome: string;
  /** Código IBGE de 2 dígitos — chave do JOIN com a malha e com a API. */
  codigo: string;
  regiao: "Norte" | "Nordeste" | "Sudeste" | "Sul" | "Centro-Oeste";
  centroide: [number, number];
}

export const UFS: UnidadeFederativa[] = [
  { sigla: "AC", nome: "Acre",                codigo: "12", regiao: "Norte",        centroide: [-9.03, -70.30] },
  { sigla: "AL", nome: "Alagoas",             codigo: "27", regiao: "Nordeste",     centroide: [-9.62, -36.60] },
  { sigla: "AP", nome: "Amapá",               codigo: "16", regiao: "Norte",        centroide: [1.41, -51.77] },
  { sigla: "AM", nome: "Amazonas",            codigo: "13", regiao: "Norte",        centroide: [-3.96, -63.14] },
  { sigla: "BA", nome: "Bahia",               codigo: "29", regiao: "Nordeste",     centroide: [-12.47, -41.71] },
  { sigla: "CE", nome: "Ceará",               codigo: "23", regiao: "Nordeste",     centroide: [-5.32, -39.62] },
  { sigla: "DF", nome: "Distrito Federal",    codigo: "53", regiao: "Centro-Oeste", centroide: [-15.78, -47.80] },
  { sigla: "ES", nome: "Espírito Santo",      codigo: "32", regiao: "Sudeste",      centroide: [-19.57, -40.66] },
  { sigla: "GO", nome: "Goiás",               codigo: "52", regiao: "Centro-Oeste", centroide: [-15.85, -49.66] },
  { sigla: "MA", nome: "Maranhão",            codigo: "21", regiao: "Nordeste",     centroide: [-5.08, -45.28] },
  { sigla: "MT", nome: "Mato Grosso",         codigo: "51", regiao: "Centro-Oeste", centroide: [-12.68, -55.92] },
  { sigla: "MS", nome: "Mato Grosso do Sul",  codigo: "50", regiao: "Centro-Oeste", centroide: [-20.51, -54.54] },
  { sigla: "MG", nome: "Minas Gerais",        codigo: "31", regiao: "Sudeste",      centroide: [-18.57, -44.55] },
  { sigla: "PA", nome: "Pará",                codigo: "15", regiao: "Norte",        centroide: [-3.79, -52.48] },
  { sigla: "PB", nome: "Paraíba",             codigo: "25", regiao: "Nordeste",     centroide: [-7.28, -36.72] },
  { sigla: "PR", nome: "Paraná",              codigo: "41", regiao: "Sul",          centroide: [-24.61, -51.62] },
  { sigla: "PE", nome: "Pernambuco",          codigo: "26", regiao: "Nordeste",     centroide: [-8.38, -37.86] },
  { sigla: "PI", nome: "Piauí",               codigo: "22", regiao: "Nordeste",     centroide: [-7.13, -42.73] },
  { sigla: "RJ", nome: "Rio de Janeiro",      codigo: "33", regiao: "Sudeste",      centroide: [-22.25, -42.66] },
  { sigla: "RN", nome: "Rio Grande do Norte", codigo: "24", regiao: "Nordeste",     centroide: [-5.81, -36.59] },
  { sigla: "RS", nome: "Rio Grande do Sul",   codigo: "43", regiao: "Sul",          centroide: [-29.70, -53.20] },
  { sigla: "RO", nome: "Rondônia",            codigo: "11", regiao: "Norte",        centroide: [-10.83, -63.34] },
  { sigla: "RR", nome: "Roraima",             codigo: "14", regiao: "Norte",        centroide: [1.99, -61.33] },
  { sigla: "SC", nome: "Santa Catarina",      codigo: "42", regiao: "Sul",          centroide: [-27.45, -50.51] },
  { sigla: "SP", nome: "São Paulo",           codigo: "35", regiao: "Sudeste",      centroide: [-22.19, -48.62] },
  { sigla: "SE", nome: "Sergipe",             codigo: "28", regiao: "Nordeste",     centroide: [-10.57, -37.45] },
  { sigla: "TO", nome: "Tocantins",           codigo: "17", regiao: "Norte",        centroide: [-10.17, -48.30] },
];

export const UF_POR_SIGLA = new Map(UFS.map((uf) => [uf.sigla, uf]));
export const UF_POR_CODIGO = new Map(UFS.map((uf) => [uf.codigo, uf]));

/** Centroide de fallback para ancorar rótulo antes de a malha chegar. */
export function centroideDaUf(sigla: string): [number, number] | null {
  return UF_POR_SIGLA.get(sigla.toUpperCase())?.centroide ?? null;
}
