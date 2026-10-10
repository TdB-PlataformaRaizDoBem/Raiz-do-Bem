import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ColecaoVulnerabilidadeAPI,
  FeatureAPI,
  Geometry,
  PolygonGeometry,
} from '../../domain/entities/VulnerabilidadeGeoAPI';
import {
  calcularBbox,
  carregarMalha,
  contarVertices,
  juntarGeometria,
  limparCacheMalha,
  type MalhaCarregada,
} from '../../services/MalhaGeograficaService';
import { getMalhaOficialBrasil } from '../../services/VulnerabilidadeService';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';
import { propsUF } from '../../test/vulnerabilidadeFixtures';

vi.mock('../../services/VulnerabilidadeService', () => ({
  getMalhaOficialBrasil: vi.fn(),
}));

const OFICIAL = 'ibge:malhas/v4 (api)';
const SINTETICO = 'mock:sintetico';

/** Polígono circular com `n` vértices (o primeiro se repete para fechar o anel). */
function poligono(n: number, cx = -45, cy = -5): PolygonGeometry {
  const anel = Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 2 * Math.PI;
    return [cx + Math.cos(t), cy + Math.sin(t)];
  });
  anel.push(anel[0]);
  return { type: 'Polygon', coordinates: [anel] as unknown as PolygonGeometry['coordinates'] };
}
const denso = (cx?: number, cy?: number) => poligono(200, cx, cy); // passa do piso de 150
const ralo = () => poligono(5); // reprovado na guarda de densidade

const feicao = (codigo: string, fonte: string | undefined, geometry: Geometry | null): FeatureAPI => ({
  type: 'Feature',
  geometry,
  properties: propsUF({ codigo_ibge: codigo, fonte_geometria: fonte }),
});
const colecao = (...features: FeatureAPI[]): ColecaoVulnerabilidadeAPI => ({
  type: 'FeatureCollection',
  features,
});
const feicaoIbge = (propriedades: Record<string, unknown>, geometry: Geometry | undefined, id?: string) => ({
  ...(id ? { id } : {}),
  properties: propriedades,
  geometry,
});

let fetchMock: FetchMock;
let avisos: ReturnType<typeof vi.spyOn>;

/** Responde o IBGE por versão: v4 e v3 são URLs distintas. */
function ibgeResponde(v4: unknown, v3: unknown = { features: [] }) {
  fetchMock.mockImplementation(async (url) => {
    const corpo = url.includes('/v4/') ? v4 : v3;
    if (corpo instanceof Error || corpo instanceof DOMException) throw corpo;
    if (typeof corpo === 'number') return fakeResponse({ status: corpo });
    return fakeResponse({ status: 200, body: corpo });
  });
}

beforeEach(() => {
  limparCacheMalha();
  fetchMock = installFetch();
  vi.mocked(getMalhaOficialBrasil).mockReset();
  avisos = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('contarVertices', () => {
  it('não-array vale 0', () => {
    expect(contarVertices(null)).toBe(0);
    expect(contarVertices('x')).toBe(0);
  });

  it('um par [lon, lat] é 1 vértice', () => {
    expect(contarVertices([-45, -5])).toBe(1);
  });

  it('soma os vértices dos anéis e das partes', () => {
    expect(contarVertices(denso().coordinates)).toBe(201);
    expect(contarVertices([[[[0, 0], [1, 1]]], [[[2, 2]]]])).toBe(3);
  });
});

describe('calcularBbox', () => {
  it('sem feições, ou sem geometria, devolve null', () => {
    expect(calcularBbox([])).toBeNull();
    expect(calcularBbox([feicao('21', OFICIAL, null)])).toBeNull();
  });

  it('coordenadas que não são lista são ignoradas', () => {
    const quebrada = { type: 'Point', coordinates: null } as unknown as Geometry;
    expect(calcularBbox([feicao('21', OFICIAL, quebrada)])).toBeNull();
  });

  it('devolve [lonMin, latMin, lonMax, latMax] de todas as partes', () => {
    const multi: Geometry = {
      type: 'MultiPolygon',
      coordinates: [[[[-50, -10], [-40, -10], [-40, 0], [-50, 0]]], [[[-30, 5], [-20, 5], [-20, 8]]]],
    };

    expect(calcularBbox([feicao('21', OFICIAL, multi)])).toEqual([-50, -10, -20, 8]);
  });
});

describe('juntarGeometria', () => {
  const malha = (origem: MalhaCarregada['origem']): MalhaCarregada => ({
    porCodigo: new Map([['21', { geometria: denso(), fonte: OFICIAL }]]),
    mediaVertices: 201,
    origem,
    totalOficiais: 1,
  });

  it('sem malha devolve os dados como estão, com origem "nenhuma"', () => {
    const dados = colecao(feicao('21', SINTETICO, null));

    expect(juntarGeometria(dados, null)).toEqual({ colecao: dados, origem: 'nenhuma' });
  });

  it('troca a geometria e a procedência só da feição que recebeu contorno', () => {
    const dados = colecao(feicao('21', SINTETICO, null), feicao('35', SINTETICO, null));

    const { colecao: junta, origem } = juntarGeometria(dados, malha('ibge'));

    expect(origem).toBe('ibge');
    const [ma, sp] = junta.features;
    expect(ma.geometry).toEqual(denso());
    expect(ma.properties.fonte_geometria).toBe(OFICIAL);
    expect(ma.bbox).toBeNull();
    // Sem entrada na malha, a feição segue exatamente como o servidor mandou.
    expect(sp).toBe(dados.features[1]);
    expect(sp.properties.fonte_geometria).toBe(SINTETICO);
  });

  it('recalcula o bbox da coleção depois do join', () => {
    const { colecao: junta } = juntarGeometria(colecao(feicao('21', SINTETICO, null)), malha('api'));

    expect(junta.bbox).toEqual(calcularBbox(junta.features));
    expect(junta.bbox).not.toBeNull();
  });
});

describe('carregarMalha — vulnerabilidade-api', () => {
  it('malha oficial densa da API: usa a API e não toca o IBGE', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(colecao(feicao('21', OFICIAL, denso())));

    const malha = await carregarMalha();

    expect(malha).toMatchObject({ origem: 'api', totalOficiais: 1, mediaVertices: 201 });
    expect(malha?.porCodigo.get('21')?.fonte).toBe(OFICIAL);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('feição da API sem geometria é ignorada', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(
      colecao(feicao('21', OFICIAL, denso()), feicao('35', OFICIAL, null)),
    );

    const malha = await carregarMalha();

    expect([...malha!.porCodigo.keys()]).toEqual(['21']);
  });

  it('feição sem fonte declarada entra como sintética', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(colecao(feicao('21', undefined, denso())));
    ibgeResponde({ features: [] });

    const malha = await carregarMalha();

    expect(malha?.porCodigo.get('21')?.fonte).toBe(SINTETICO);
    expect(malha).toMatchObject({ origem: 'nenhuma', totalOficiais: 0 });
  });

  it('malha rala (abaixo do piso): rebaixa as oficiais para estimadas e avisa', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(colecao(feicao('21', OFICIAL, ralo())));
    ibgeResponde({ features: [] });

    const malha = await carregarMalha();

    expect(malha?.porCodigo.get('21')?.fonte).toBe(SINTETICO);
    expect(malha).toMatchObject({ origem: 'nenhuma', totalOficiais: 0, mediaVertices: 6 });
    expect(avisos).toHaveBeenCalledWith(expect.stringContaining('abaixo do piso'));
  });

  it('rebaixar não mexe nas feições que já eram estimadas', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(
      colecao(feicao('21', OFICIAL, ralo()), feicao('35', SINTETICO, denso())),
    );
    ibgeResponde({ features: [] });

    const malha = await carregarMalha();

    expect(malha?.porCodigo.get('35')?.fonte).toBe(SINTETICO);
  });

  it('API fora do ar: avisa e cai para o IBGE', async () => {
    vi.mocked(getMalhaOficialBrasil).mockRejectedValue(new Error('HTTP 503'));
    ibgeResponde({ features: [feicaoIbge({ codarea: '21' }, denso())] });

    const malha = await carregarMalha();

    expect(malha?.origem).toBe('ibge');
    expect(avisos).toHaveBeenCalledWith(expect.stringContaining('vulnerabilidade-api'), expect.any(Error));
  });

  it('coleção vazia da API também cai para o IBGE', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(colecao());
    ibgeResponde({ features: [feicaoIbge({ codarea: '21' }, denso())] });

    expect((await carregarMalha())?.origem).toBe('ibge');
  });

  it('coleção da API sem a lista de feições é tratada como vazia', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue({ type: 'FeatureCollection' } as ColecaoVulnerabilidadeAPI);
    ibgeResponde({ features: [feicaoIbge({ codarea: '21' }, denso())] });

    expect((await carregarMalha())?.origem).toBe('ibge');
  });
});

describe('carregarMalha — IBGE direto', () => {
  beforeEach(() => {
    vi.mocked(getMalhaOficialBrasil).mockRejectedValue(new Error('sem cache no servidor'));
  });

  it('pede a v4 do IBGE sem credenciais, em qualidade máxima', async () => {
    ibgeResponde({ features: [feicaoIbge({ codarea: '21' }, denso())] });

    await carregarMalha();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR' +
        '?formato=application%2Fvnd.geo%2Bjson&qualidade=maxima&intrarregiao=UF',
    );
    expect(init?.credentials).toBe('omit');
  });

  it('carimba a procedência do navegador nas feições do IBGE', async () => {
    ibgeResponde({ features: [feicaoIbge({ codarea: '21' }, denso())] });

    const malha = await carregarMalha();

    expect(malha?.porCodigo.get('21')?.fonte).toBe('ibge:malhas/v4 qualidade=maxima (navegador)');
    expect(malha).toMatchObject({ origem: 'ibge', totalOficiais: 1 });
  });

  it('aceita o código da UF em codarea, cod_ibge, CD_UF ou no id, e apara espaços', async () => {
    ibgeResponde({
      features: [
        feicaoIbge({ codarea: ' 21 ' }, denso()),
        feicaoIbge({ cod_ibge: 35 }, denso()),
        feicaoIbge({ CD_UF: '33' }, denso()),
        feicaoIbge({}, denso(), '41'),
      ],
    });

    const malha = await carregarMalha();

    expect([...malha!.porCodigo.keys()].sort()).toEqual(['21', '33', '35', '41']);
  });

  it('feição sem código, sem geometria ou sem propriedades é descartada', async () => {
    ibgeResponde({
      features: [
        feicaoIbge({}, denso()), // sem código
        feicaoIbge({ codarea: '21' }, undefined), // sem geometria
        { id: '35', geometry: denso() }, // sem `properties`, mas o id serve de código
      ],
    });

    const malha = await carregarMalha();

    expect([...malha!.porCodigo.keys()]).toEqual(['35']);
  });

  it('resposta do IBGE sem lista de feições não gera malha', async () => {
    ibgeResponde({});

    expect(await carregarMalha()).toBeNull();
  });

  it('v4 com erro HTTP: usa a v3 de reserva', async () => {
    ibgeResponde(500, { features: [feicaoIbge({ codarea: '21' }, denso())] });

    const malha = await carregarMalha();

    expect(malha?.origem).toBe('ibge');
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      expect.stringContaining('/v4/'),
      expect.stringContaining('/v3/'),
    ]);
  });

  it('v4 com falha de rede: usa a v3 de reserva', async () => {
    ibgeResponde(new Error('rede caiu'), { features: [feicaoIbge({ codarea: '21' }, denso())] });

    expect((await carregarMalha())?.origem).toBe('ibge');
  });

  it('v4 rala (reprovada na guarda): tenta a v3', async () => {
    ibgeResponde(
      { features: [feicaoIbge({ codarea: '21' }, ralo())] },
      { features: [feicaoIbge({ codarea: '21' }, denso())] },
    );

    const malha = await carregarMalha();

    expect(malha).toMatchObject({ origem: 'ibge', totalOficiais: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('nenhuma fonte serve contorno: devolve null e não guarda no cache', async () => {
    ibgeResponde(503, 503);

    expect(await carregarMalha()).toBeNull();

    ibgeResponde({ features: [feicaoIbge({ codarea: '21' }, denso())] });
    expect((await carregarMalha())?.origem).toBe('ibge');
  });
});

describe('carregarMalha — API parcial + IBGE', () => {
  it('só estimadas na API: o IBGE entra por cima e o que ele não cobre continua estimado', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(
      colecao(feicao('21', SINTETICO, denso(-45, -5)), feicao('35', SINTETICO, denso(-48, -22))),
    );
    ibgeResponde({ features: [feicaoIbge({ codarea: '21' }, denso(-44, -4))] });

    const malha = await carregarMalha();

    expect(malha?.origem).toBe('ibge');
    expect(malha?.totalOficiais).toBe(1);
    expect(malha?.porCodigo.get('21')?.fonte).toContain('ibge:');
    expect(malha?.porCodigo.get('35')?.fonte).toBe(SINTETICO);
  });

  it('IBGE também sem contorno: fica com a reserva sintética da API', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(colecao(feicao('21', SINTETICO, denso())));
    ibgeResponde(503, 503);

    const malha = await carregarMalha();

    expect(malha).toMatchObject({ origem: 'nenhuma', totalOficiais: 0 });
    expect(malha?.porCodigo.get('21')?.fonte).toBe(SINTETICO);
  });

  it('com contorno oficial na API não vai ao IBGE para completar o resto', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(
      colecao(feicao('21', OFICIAL, denso()), feicao('35', SINTETICO, denso())),
    );

    const malha = await carregarMalha();

    expect(malha?.origem).toBe('api');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('carregarMalha — cancelamento', () => {
  it('AbortError vindo da API é repassado e o download não fica preso', async () => {
    vi.mocked(getMalhaOficialBrasil).mockRejectedValueOnce(new DOMException('abort', 'AbortError'));

    await expect(carregarMalha()).rejects.toMatchObject({ name: 'AbortError' });

    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(colecao(feicao('21', OFICIAL, denso())));
    expect((await carregarMalha())?.origem).toBe('api');
  });

  it('AbortError vindo do IBGE é repassado', async () => {
    vi.mocked(getMalhaOficialBrasil).mockRejectedValue(new Error('API fora'));
    ibgeResponde(new DOMException('abort', 'AbortError'));

    await expect(carregarMalha()).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('o consumidor que espera e não desiste recebe a malha e perde o ouvinte do sinal', async () => {
    vi.mocked(getMalhaOficialBrasil).mockResolvedValue(colecao(feicao('21', OFICIAL, denso())));
    const controle = new AbortController();
    const remover = vi.spyOn(controle.signal, 'removeEventListener');

    const malha = await carregarMalha(controle.signal);

    expect(malha?.origem).toBe('api');
    await vi.waitFor(() => expect(remover).toHaveBeenCalledWith('abort', expect.any(Function)));
  });
});
