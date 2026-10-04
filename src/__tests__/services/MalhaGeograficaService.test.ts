import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { ColecaoVulnerabilidadeAPI } from '../../domain/entities/VulnerabilidadeGeoAPI';
import { carregarMalha, limparCacheMalha } from '../../services/MalhaGeograficaService';
import { getMalhaOficialBrasil } from '../../services/VulnerabilidadeService';

jest.mock('../../services/VulnerabilidadeService', () => ({
  getMalhaOficialBrasil: jest.fn(),
}));

/** Polígono com vértices suficientes para passar na guarda de densidade. */
function poligonoDenso() {
  const anel = Array.from({ length: 200 }, (_, i) => {
    const t = (i / 200) * 2 * Math.PI;
    return [-45 + Math.cos(t), -5 + Math.sin(t)] as [number, number];
  });
  anel.push(anel[0]);
  return { type: 'Polygon' as const, coordinates: [anel] };
}

const MALHA: ColecaoVulnerabilidadeAPI = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: poligonoDenso(),
      properties: {
        codigo_ibge: '21',
        nome: 'Maranhão',
        nivel: 'uf',
        populacao: 1,
        score_vulnerabilidade: 0.5,
        faixa: 'media',
        indice_prioridade: 0.5,
        fonte_geometria: 'ibge:malhas/v4',
      },
    },
  ],
};

/** Imita o fetch real: rejeita com AbortError quando o sinal é abortado. */
function respostaLenta() {
  let resolver!: (v: ColecaoVulnerabilidadeAPI) => void;
  jest.mocked(getMalhaOficialBrasil).mockImplementation(
    (sinal?: AbortSignal) =>
      new Promise((ok, falha) => {
        resolver = ok;
        sinal?.addEventListener('abort', () =>
          falha(new DOMException('aborted', 'AbortError')),
        );
      }),
  );
  return () => resolver(MALHA);
}

beforeEach(() => limparCacheMalha());

describe('carregarMalha', () => {
  it('sobrevive ao consumidor que desiste no meio (StrictMode monta o efeito duas vezes)', async () => {
    const entregar = respostaLenta();

    // Exatamente a ordem do StrictMode: monta, desmonta (aborta), remonta —
    // tudo no mesmo tick, antes de a primeira promessa assentar.
    const primeiro = new AbortController();
    const desistiu = carregarMalha(primeiro.signal);
    primeiro.abort();
    const segundo = carregarMalha(new AbortController().signal);

    await expect(desistiu).rejects.toMatchObject({ name: 'AbortError' });
    entregar();
    const malha = await segundo;

    expect(malha?.porCodigo.get('21')?.fonte).toBe('ibge:malhas/v4');
    expect(malha?.origem).toBe('api');
    // Uma única ida à rede: a desistência não reinicia o download compartilhado.
    expect(getMalhaOficialBrasil).toHaveBeenCalledTimes(1);
  });

  it('serve do cache depois da primeira carga', async () => {
    jest.mocked(getMalhaOficialBrasil).mockResolvedValue(MALHA);
    const a = await carregarMalha();
    const b = await carregarMalha();
    expect(b).toBe(a);
    expect(getMalhaOficialBrasil).toHaveBeenCalledTimes(1);
  });

  it('não começa nada com sinal já abortado', async () => {
    const controle = new AbortController();
    controle.abort();
    await expect(carregarMalha(controle.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });
});
