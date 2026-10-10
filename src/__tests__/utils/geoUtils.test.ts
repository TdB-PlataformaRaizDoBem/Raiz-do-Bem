import { describe, expect, it } from 'vitest';
import {
  normalizarBusca,
  poloDeInacessibilidade,
  pontoDeRotulo,
  pontoDeRotuloCacheado,
  type Ponto,
} from '../../utils/geoUtils';

/** Anel quadrado [x0..x1] × [y0..y1], no formato GeoJSON ([x, y] = [lon, lat]). */
const quadrado = (x0: number, y0: number, x1: number, y1: number): Ponto[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** "U": o centroide de área (5; 4,42) cai no vão entre os braços, fora do território. */
const U: Ponto[] = [
  [0, 0], [10, 0], [10, 10], [7, 10], [7, 3], [3, 3], [3, 10], [0, 10],
];

const noVao = ([x, y]: Ponto) => x > 3 && x < 7 && y > 3;
const dentroDoU = ([x, y]: Ponto) => x >= 0 && x <= 10 && y >= 0 && y <= 10 && !noVao([x, y]);

describe('poloDeInacessibilidade', () => {
  it('forma convexa: devolve o centroide de área', () => {
    expect(poloDeInacessibilidade([quadrado(0, 0, 10, 10)])).toEqual([5, 5]);
  });

  it('o centroide é de ÁREA, não a média dos vértices (retângulo com vértice extra)', () => {
    // 5 vértices, 4 deles na base: a média dos vértices puxaria o ponto para baixo.
    const anel: Ponto[] = [[0, 0], [5, 0], [10, 0], [10, 10], [0, 10]];
    const [x, y] = poloDeInacessibilidade([anel]);
    expect(x).toBeCloseTo(5);
    expect(y).toBeCloseTo(5);
  });

  it('forma côncava: quando o centroide cai fora, escolhe um ponto interno', () => {
    const ponto = poloDeInacessibilidade([U]);

    expect(noVao(ponto)).toBe(false);
    expect(dentroDoU(ponto)).toBe(true);
  });

  it('o ponto escolhido é o mais afastado das bordas (na barra larga do U, não no braço fino)', () => {
    const [, y] = poloDeInacessibilidade([U]);

    // A barra inferior tem 3 de altura: o melhor ponto fica nela, longe das duas bordas.
    expect(y).toBeLessThan(3);
  });

  it('polígono com buraco no meio: o ponto fica fora do buraco', () => {
    const [x, y] = poloDeInacessibilidade([quadrado(0, 0, 10, 10), quadrado(3, 3, 7, 7)]);

    expect(x > 3 && x < 7 && y > 3 && y < 7).toBe(false);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(10);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(10);
  });

  it('sem anel externo devolve a origem', () => {
    expect(poloDeInacessibilidade([])).toEqual([0, 0]);
  });

  it('anel com menos de 3 pontos devolve o primeiro ponto', () => {
    expect(poloDeInacessibilidade([[[1, 2], [3, 4]]])).toEqual([1, 2]);
  });

  it('anel degenerado (pontos alinhados, área zero) não quebra', () => {
    expect(poloDeInacessibilidade([[[0, 0], [1, 1], [2, 2]]])).toEqual([0, 0]);
  });
});

describe('pontoDeRotulo', () => {
  it('sem geometria devolve null', () => {
    expect(pontoDeRotulo(null)).toBeNull();
  });

  it('Point: converte [lon, lat] do GeoJSON para [lat, lon] do Leaflet', () => {
    expect(pontoDeRotulo({ type: 'Point', coordinates: [-44.3, -2.5] })).toEqual([-2.5, -44.3]);
  });

  it('Polygon: devolve o ponto interno já em [lat, lon]', () => {
    const geometria = { type: 'Polygon', coordinates: [quadrado(0, 20, 10, 30)] };

    expect(pontoDeRotulo(geometria)).toEqual([25, 5]);
  });

  it.each([
    ['maior parte primeiro', [quadrado(0, 20, 10, 30), quadrado(50, 50, 52, 52)]],
    ['maior parte depois', [quadrado(50, 50, 52, 52), quadrado(0, 20, 10, 30)]],
  ])('MultiPolygon (%s): usa a MAIOR parte, não a média com as ilhas', (_nome, partes) => {
    const geometria = { type: 'MultiPolygon', coordinates: partes.map((anel) => [anel]) };

    expect(pontoDeRotulo(geometria)).toEqual([25, 5]);
  });

  it.each([
    ['tipo sem rótulo (LineString)', { type: 'LineString', coordinates: [[0, 0], [1, 1]] }],
    ['Polygon sem coordenadas', { type: 'Polygon', coordinates: [] }],
    ['MultiPolygon vazio', { type: 'MultiPolygon', coordinates: [] }],
  ])('%s devolve null', (_nome, geometria) => {
    expect(pontoDeRotulo(geometria)).toBeNull();
  });
});

describe('pontoDeRotuloCacheado', () => {
  it('sem geometria devolve null', () => {
    expect(pontoDeRotuloCacheado(null)).toBeNull();
  });

  it('calcula uma vez por referência de geometria', () => {
    const coordinates = [quadrado(0, 20, 10, 30)];
    const geometria = { type: 'Polygon', coordinates };

    const primeira = pontoDeRotuloCacheado(geometria);
    coordinates[0] = quadrado(100, 100, 110, 110); // se recalculasse, o ponto mudaria
    const segunda = pontoDeRotuloCacheado(geometria);

    expect(primeira).toEqual([25, 5]);
    expect(segunda).toBe(primeira);
  });

  it('uma geometria nova (malha oficial no lugar da de reserva) é recalculada', () => {
    const reserva = { type: 'Polygon', coordinates: [quadrado(0, 20, 10, 30)] };
    const oficial = { type: 'Polygon', coordinates: [quadrado(0, 40, 10, 50)] };

    expect(pontoDeRotuloCacheado(reserva)).toEqual([25, 5]);
    expect(pontoDeRotuloCacheado(oficial)).toEqual([45, 5]);
  });

  it('também guarda o resultado null', () => {
    const geometria = { type: 'LineString', coordinates: [[0, 0]] as unknown };

    expect(pontoDeRotuloCacheado(geometria)).toBeNull();
    expect(pontoDeRotuloCacheado(geometria)).toBeNull();
  });
});

describe('normalizarBusca', () => {
  it.each([
    ['  São Paulo  ', 'sao paulo'],
    ['ÁÉÍÓÚ ãõ ç', 'aeiou ao c'],
    ['MARANHÃO', 'maranhao'],
    ['', ''],
  ])('"%s" vira "%s"', (entrada, esperado) => {
    expect(normalizarBusca(entrada)).toBe(esperado);
  });
});
