/**
 * Utilitários geométricos para posicionamento de rótulos no mapa.
 *
 * -------------------------------------------------------------------------
 * POR QUE NÃO BASTA A MÉDIA DOS VÉRTICES
 * -------------------------------------------------------------------------
 * O jeito ingênuo de posicionar um rótulo é tirar a média das coordenadas.
 * Isso quebra em três situações que o Brasil tem de sobra:
 *
 *   * formas côncavas — o centroide do Amapá, com a foz do Amazonas, cai na
 *     água;
 *   * MultiPolygon com ilhas — a média entre o continente e Fernando de
 *     Noronha coloca o rótulo no meio do Atlântico;
 *   * estados alongados e curvos — o rótulo escorrega para fora do território.
 *
 * A solução usada aqui é o "polo de inacessibilidade": o ponto INTERNO mais
 * distante de qualquer borda. É o mesmo conceito do algoritmo polylabel do
 * Mapbox, numa versão por refinamento de grade — suficiente para rótulo e sem
 * trazer dependência nova.
 */

export type Ponto = [number, number];

interface GeometriaBruta {
  type: string;
  coordinates: unknown;
}

// ---------------------------------------------------------------------------
// Primitivas
// ---------------------------------------------------------------------------

/** Área com sinal do anel (fórmula do shoelace). Negativa = sentido horário. */
function areaAssinada(anel: Ponto[]): number {
  let soma = 0;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i, i += 1) {
    soma += (anel[j][0] - anel[i][0]) * (anel[j][1] + anel[i][1]);
  }
  return soma / 2;
}

/** Ray casting. Conta cruzamentos de uma semirreta horizontal. */
function dentroDoAnel(ponto: Ponto, anel: Ponto[]): boolean {
  const [x, y] = ponto;
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i, i += 1) {
    const [xi, yi] = anel[i];
    const [xj, yj] = anel[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      dentro = !dentro;
    }
  }
  return dentro;
}

/** Um polígono é [anelExterno, buraco1, buraco2, ...]. */
function dentroDoPoligono(ponto: Ponto, poligono: Ponto[][]): boolean {
  if (!dentroDoAnel(ponto, poligono[0])) return false;
  for (let i = 1; i < poligono.length; i += 1) {
    if (dentroDoAnel(ponto, poligono[i])) return false; // caiu num buraco
  }
  return true;
}

/** Distância de um ponto ao segmento AB. */
function distanciaAoSegmento(p: Ponto, a: Ponto, b: Ponto): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const comprimento2 = dx * dx + dy * dy;

  let t = 0;
  if (comprimento2 > 0) {
    t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / comprimento2;
    t = Math.max(0, Math.min(1, t));
  }

  const px = a[0] + t * dx - p[0];
  const py = a[1] + t * dy - p[1];
  return Math.sqrt(px * px + py * py);
}

/** Menor distância do ponto a qualquer borda do polígono (incluindo buracos). */
function distanciaABorda(ponto: Ponto, poligono: Ponto[][]): number {
  let minima = Infinity;
  for (const anel of poligono) {
    for (let i = 0, j = anel.length - 1; i < anel.length; j = i, i += 1) {
      const d = distanciaAoSegmento(ponto, anel[j], anel[i]);
      if (d < minima) minima = d;
    }
  }
  return minima;
}

function bboxDoAnel(anel: Ponto[]): [number, number, number, number] {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
  for (const [x, y] of anel) {
    if (x < xMin) xMin = x;
    if (y < yMin) yMin = y;
    if (x > xMax) xMax = x;
    if (y > yMax) yMax = y;
  }
  return [xMin, yMin, xMax, yMax];
}

/** Centroide de área do anel externo (não é média de vértices). */
function centroideDeArea(anel: Ponto[]): Ponto {
  let x = 0;
  let y = 0;
  let area = 0;

  for (let i = 0, j = anel.length - 1; i < anel.length; j = i, i += 1) {
    const cruzado = anel[j][0] * anel[i][1] - anel[i][0] * anel[j][1];
    x += (anel[j][0] + anel[i][0]) * cruzado;
    y += (anel[j][1] + anel[i][1]) * cruzado;
    area += cruzado;
  }

  if (area === 0) return anel[0];
  return [x / (3 * area), y / (3 * area)];
}

// ---------------------------------------------------------------------------
// Polo de inacessibilidade
// ---------------------------------------------------------------------------

/** Densidade da grade de busca. 18×18 é o ponto de equilíbrio entre
 *  precisão do rótulo e custo — acima disso o ganho visual é imperceptível. */
const RESOLUCAO_GRADE = 18;

/**
 * Ponto interno adequado para ancorar um rótulo.
 *
 * Estratégia em dois passos, deliberadamente barata:
 *   1. tenta o centroide de área — resolve a maioria dos casos (formas
 *      convexas ou quase) sem varrer nada;
 *   2. se ele cair fora do território, varre uma grade e escolhe o ponto
 *      interno mais distante das bordas.
 *
 * O passo 2 só roda quando necessário, o que mantém o custo baixo mesmo com
 * polígonos de milhares de vértices.
 */
export function poloDeInacessibilidade(poligono: Ponto[][]): Ponto {
  const externo = poligono[0];
  if (!externo || externo.length < 3) return externo?.[0] ?? [0, 0];

  const centroide = centroideDeArea(externo);
  if (dentroDoPoligono(centroide, poligono)) return centroide;

  const [xMin, yMin, xMax, yMax] = bboxDoAnel(externo);
  const passoX = (xMax - xMin) / (RESOLUCAO_GRADE + 1);
  const passoY = (yMax - yMin) / (RESOLUCAO_GRADE + 1);

  let melhor: Ponto = centroide;
  let melhorDistancia = -1;

  for (let i = 1; i <= RESOLUCAO_GRADE; i += 1) {
    for (let j = 1; j <= RESOLUCAO_GRADE; j += 1) {
      const candidato: Ponto = [xMin + passoX * i, yMin + passoY * j];
      if (!dentroDoPoligono(candidato, poligono)) continue;

      const distancia = distanciaABorda(candidato, poligono);
      if (distancia > melhorDistancia) {
        melhorDistancia = distancia;
        melhor = candidato;
      }
    }
  }

  return melhor;
}

// ---------------------------------------------------------------------------
// Entrada GeoJSON
// ---------------------------------------------------------------------------

function areaAbsolutaDoPoligono(poligono: Ponto[][]): number {
  return Math.abs(areaAssinada(poligono[0] ?? []));
}

/**
 * Ponto de rótulo de uma geometria GeoJSON.
 *
 * Em MultiPolygon usa a MAIOR parte, não a média. Sem isso, o rótulo de um
 * estado litorâneo com ilhas oceânicas seria puxado para o mar.
 *
 * Retorna no formato do Leaflet — [lat, lon] —, invertido em relação ao
 * GeoJSON, que é [lon, lat]. A conversão acontece aqui, num lugar só.
 */
export function pontoDeRotulo(geometria: GeometriaBruta | null): Ponto | null {
  if (!geometria) return null;

  if (geometria.type === "Point") {
    const [lon, lat] = geometria.coordinates as Ponto;
    return [lat, lon];
  }

  let escolhido: Ponto[][] | null = null;

  if (geometria.type === "Polygon") {
    escolhido = geometria.coordinates as Ponto[][];
  } else if (geometria.type === "MultiPolygon") {
    const partes = geometria.coordinates as Ponto[][][];
    for (const parte of partes) {
      if (
        !escolhido ||
        areaAbsolutaDoPoligono(parte) > areaAbsolutaDoPoligono(escolhido)
      ) {
        escolhido = parte;
      }
    }
  }

  if (!escolhido || escolhido.length === 0) return null;

  const [lon, lat] = poloDeInacessibilidade(escolhido);
  return [lat, lon];
}

/**
 * Cache por código IBGE.
 *
 * O cálculo é determinístico e a geometria de uma UF não muda entre renders.
 * A chave inclui a referência da geometria, então trocar a malha de reserva
 * pela oficial invalida a entrada automaticamente.
 */
const cacheRotulo = new WeakMap<object, Ponto | null>();

export function pontoDeRotuloCacheado(
  geometria: GeometriaBruta | null,
): Ponto | null {
  if (!geometria) return null;
  const existente = cacheRotulo.get(geometria);
  if (existente !== undefined) return existente;

  const ponto = pontoDeRotulo(geometria);
  cacheRotulo.set(geometria, ponto);
  return ponto;
}

/** Normaliza texto para busca: sem acento, sem caixa, sem espaço extra. */
export function normalizarBusca(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    // Faixa dos diacríticos combinantes, escrita em escape Unicode para não
    // depender da codificação do arquivo-fonte.
    .replace(/[\u0300-\u036f]/g, "");
}
