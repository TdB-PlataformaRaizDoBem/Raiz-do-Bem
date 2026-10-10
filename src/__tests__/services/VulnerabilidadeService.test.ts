import { beforeEach, describe, expect, it } from 'vitest';
import {
  getMalhaOficialBrasil,
  getSaudeGeoApi,
  getVulnerabilidadeBrasil,
  limparCacheGeo,
} from '../../services/VulnerabilidadeService';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

const BASE = 'http://localhost:8000/api/v1/vulnerabilidade/brasil';
const COLECAO = { type: 'FeatureCollection', features: [{ type: 'Feature' }] };

let fetchMock: FetchMock;

beforeEach(() => {
  limparCacheGeo();
  fetchMock = installFetch();
  fetchMock.mockImplementation(async () => fakeResponse({ status: 200, body: COLECAO }));
});

describe('getVulnerabilidadeBrasil', () => {
  it('pede os indicadores das UFs sem geometria', async () => {
    const colecao = await getVulnerabilidadeBrasil();

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}?incluir_geometria=false`);
    expect(colecao).toEqual(COLECAO);
  });

  it('envia o cenário de voluntários na query (formato UF:qtd,UF:qtd)', async () => {
    await getVulnerabilidadeBrasil('MA:900,SP:4200');

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${BASE}?incluir_geometria=false&voluntarios_por_uf=MA%3A900%2CSP%3A4200`,
    );
  });

  it('cacheia por cenário: repetir a consulta não refaz a requisição', async () => {
    await getVulnerabilidadeBrasil('MA:900');
    await getVulnerabilidadeBrasil('MA:900');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await getVulnerabilidadeBrasil('SP:10'); // outro cenário
    await getVulnerabilidadeBrasil(); // sem cenário
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('limparCacheGeo força uma nova requisição', async () => {
    await getVulnerabilidadeBrasil();
    limparCacheGeo();
    await getVulnerabilidadeBrasil();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('corpo vazio vira uma coleção vazia', async () => {
    fetchMock.mockImplementation(async () => fakeResponse({ status: 200, text: '' }));

    await expect(getVulnerabilidadeBrasil()).resolves.toEqual({
      type: 'FeatureCollection',
      features: [],
    });
  });

  it('propaga o erro da API e não guarda a falha no cache', async () => {
    fetchMock.mockImplementationOnce(async () =>
      fakeResponse({ status: 500, body: { detail: 'API fora do ar' } }),
    );

    await expect(getVulnerabilidadeBrasil()).rejects.toThrow();

    await expect(getVulnerabilidadeBrasil()).resolves.toEqual(COLECAO);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('getMalhaOficialBrasil', () => {
  it('pede só a geometria, sem indicadores e sem simplificar', async () => {
    await getMalhaOficialBrasil();

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${BASE}?incluir_geometria=true&incluir_indicadores=false&tolerancia=0`,
    );
  });

  it('repassa o AbortSignal ao fetch', async () => {
    const controller = new AbortController();

    await getMalhaOficialBrasil(controller.signal);

    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
  });

  it('cacheia a malha: é baixada uma vez por sessão', async () => {
    await getMalhaOficialBrasil();
    await getMalhaOficialBrasil();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('getSaudeGeoApi', () => {
  it('consulta o health da API geográfica', async () => {
    const saude = { status: 'ok', versao: '1.0', fonte_dados: 'ibge', modelo: { carregado: true, tipo: 'rf', erro: null } };
    fetchMock.mockImplementation(async () => fakeResponse({ status: 200, body: saude }));

    await expect(getSaudeGeoApi()).resolves.toEqual(saude);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/api/v1/health');
  });

  it('propaga a falha', async () => {
    fetchMock.mockImplementation(async () => fakeResponse({ status: 503, body: { detail: 'fora' } }));

    await expect(getSaudeGeoApi()).rejects.toThrow();
  });
});
