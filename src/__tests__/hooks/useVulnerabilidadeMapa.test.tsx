import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ColecaoVulnerabilidadeAPI } from '../../domain/entities/VulnerabilidadeGeoAPI';
import { useVulnerabilidadeMapa } from '../../hooks/useVulnerabilidadeMapa';
import { carregarMalha, type MalhaCarregada } from '../../services/MalhaGeograficaService';
import { getVulnerabilidadeBrasil } from '../../services/VulnerabilidadeService';
import { feature, propsUF } from '../../test/vulnerabilidadeFixtures';

vi.mock('../../services/VulnerabilidadeService', () => ({ getVulnerabilidadeBrasil: vi.fn() }));
vi.mock('../../services/MalhaGeograficaService', async () => ({
  ...(await vi.importActual<object>('../../services/MalhaGeograficaService')),
  carregarMalha: vi.fn(),
}));

const consulta = vi.mocked(getVulnerabilidadeBrasil);
const malha = vi.mocked(carregarMalha);

const colecao = (...codigos: string[]): ColecaoVulnerabilidadeAPI => ({
  type: 'FeatureCollection',
  features: (codigos.length ? codigos : ['21']).map((c) => feature(propsUF({ codigo_ibge: c, nome: `UF ${c}` }))),
});

const malhaOficial = (): MalhaCarregada => ({
  porCodigo: new Map(),
  mediaVertices: 200,
  origem: 'api',
  totalOficiais: 0,
});

function adiado<T>() {
  let resolver!: (v: T) => void;
  let rejeitar!: (e: unknown) => void;
  const promessa = new Promise<T>((ok, falha) => {
    resolver = ok;
    rejeitar = falha;
  });
  return { promessa, resolver, rejeitar };
}

const montar = (cenario = '') =>
  renderHook(({ cenario }) => useVulnerabilidadeMapa(cenario), { initialProps: { cenario } });

beforeEach(() => {
  consulta.mockReset().mockImplementation(async () => colecao());
  malha.mockReset().mockResolvedValue(malhaOficial());
});

describe('carga', () => {
  it('começa carregando e termina com a coleção e a origem do contorno', async () => {
    const { result } = montar();

    expect(result.current).toMatchObject({ loading: true, colecao: null, error: null });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.colecao?.regioes).toHaveLength(1);
    expect(result.current.origemGeometria).toBe('api');
    expect(result.current.error).toBeNull();
  });

  it('pede os indicadores do cenário informado', async () => {
    const { result } = montar('MA:900');

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(consulta).toHaveBeenCalledWith('MA:900');
  });

  it('se a malha falhar, o mapa carrega mesmo assim, sem contorno', async () => {
    malha.mockRejectedValue(new Error('sem malha'));

    const { result } = montar();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.colecao).not.toBeNull();
    expect(result.current.origemGeometria).toBe('nenhuma');
  });

  it('trocar de cenário volta a carregar sem apagar o que está na tela', async () => {
    const { result, rerender } = montar('');
    await waitFor(() => expect(result.current.loading).toBe(false));
    const lento = adiado<ColecaoVulnerabilidadeAPI>();
    consulta.mockReturnValueOnce(lento.promessa);

    rerender({ cenario: 'SP:10' });

    expect(result.current.loading).toBe(true);
    expect(result.current.colecao).not.toBeNull();

    lento.resolver(colecao('21', '35'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.colecao?.regioes).toHaveLength(2);
  });
});

describe('falhas', () => {
  it('erro da API vira mensagem e a tela segue sem coleção', async () => {
    consulta.mockRejectedValue(new Error('API fora do ar'));

    const { result } = montar();

    await waitFor(() => expect(result.current.error).toBe('API fora do ar'));
    expect(result.current.colecao).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('falha que não é um Error usa a mensagem padrão', async () => {
    consulta.mockRejectedValue('quebrou');

    const { result } = montar();

    await waitFor(() => expect(result.current.error).toBe('Falha ao carregar o mapa'));
  });

  it('uma falha depois de uma carga boa preserva a coleção anterior', async () => {
    const { result, rerender } = montar('');
    await waitFor(() => expect(result.current.loading).toBe(false));
    consulta.mockRejectedValueOnce(new Error('timeout'));

    rerender({ cenario: 'SP:10' });

    await waitFor(() => expect(result.current.error).toBe('timeout'));
    expect(result.current.colecao?.regioes).toHaveLength(1);
  });

  it('refetch tenta de novo e limpa o erro', async () => {
    consulta.mockRejectedValueOnce(new Error('timeout'));
    const { result } = montar();
    await waitFor(() => expect(result.current.error).toBe('timeout'));

    act(() => result.current.refetch());

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.colecao).not.toBeNull();
    expect(consulta).toHaveBeenCalledTimes(2);
  });
});

describe('cancelamento', () => {
  it('resposta que chega depois de desmontar é descartada', async () => {
    const lento = adiado<ColecaoVulnerabilidadeAPI>();
    consulta.mockReturnValue(lento.promessa);
    const { result, unmount } = montar();

    unmount();
    lento.resolver(colecao());
    await Promise.resolve();

    expect(result.current.colecao).toBeNull();
  });

  it('falha que chega depois de desmontar também é descartada', async () => {
    const lento = adiado<ColecaoVulnerabilidadeAPI>();
    consulta.mockReturnValue(lento.promessa);
    const { result, unmount } = montar();

    unmount();
    lento.rejeitar(new Error('tarde demais'));
    await Promise.resolve();

    expect(result.current.error).toBeNull();
  });

  it('avisa o serviço da malha quando a carga é abandonada', async () => {
    const lento = adiado<ColecaoVulnerabilidadeAPI>();
    consulta.mockReturnValue(lento.promessa);
    const { unmount } = montar();
    const sinal = malha.mock.calls[0][0] as AbortSignal;

    unmount();

    expect(sinal.aborted).toBe(true);
  });
});

describe('seleção', () => {
  const props = (codigo: string) => propsUF({ codigo_ibge: codigo });

  it('começa sem seleção; selecionar acha a região pelo código', async () => {
    consulta.mockImplementation(async () => colecao('21', '35'));
    const { result } = montar();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.selecionada).toBeNull();

    act(() => result.current.selecionar(props('35')));

    expect(result.current.selecionada?.codigoIbge).toBe('35');
  });

  it('selecionar(null) limpa a seleção', async () => {
    const { result } = montar();
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.selecionar(props('21')));

    act(() => result.current.selecionar(null));

    expect(result.current.selecionada).toBeNull();
  });

  it('código que não está na coleção em tela não seleciona nada', async () => {
    const { result } = montar();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.selecionar(props('99')));

    expect(result.current.selecionada).toBeNull();
  });

  it('a seleção acompanha o novo cenário (mostra os números atuais, não os do clique)', async () => {
    const { result, rerender } = montar('');
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.selecionar(props('21')));
    const antes = result.current.selecionada;
    consulta.mockImplementation(async () => ({
      type: 'FeatureCollection',
      features: [feature(propsUF({ codigo_ibge: '21', indice_prioridade: 0.1 }))],
    }));

    rerender({ cenario: 'MA:900' });

    await waitFor(() => expect(result.current.selecionada?.indicePrioridade).toBe(0.1));
    expect(result.current.selecionada).not.toBe(antes);
  });
});
