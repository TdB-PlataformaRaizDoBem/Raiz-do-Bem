import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';
import useFetch from '../../hooks/useFetch';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;
const json = { 'content-type': 'application/json' };

beforeEach(() => {
  fetchMock = installFetch();
});

describe('useFetch', () => {
  it('começa vazio', () => {
    const { result } = renderHook(() => useFetch());

    expect(result.current).toMatchObject({ data: null, error: null, loading: false });
  });

  it('request guarda os dados JSON e devolve response + json', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: { cep: '01001-000' }, headers: json }));
    const { result } = renderHook(() => useFetch<{ cep: string }>());

    let retorno;
    await act(async () => {
      retorno = await result.current.request('https://viacep.com.br/ws/01001000/json/');
    });

    expect(retorno).toMatchObject({ json: { cep: '01001-000' } });
    expect(result.current.data).toEqual({ cep: '01001-000' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loading fica true durante a requisição', async () => {
    let liberar: (r: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((res) => (liberar = res)));
    const { result } = renderHook(() => useFetch());

    act(() => {
      void result.current.request('/x');
    });
    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => liberar(fakeResponse({ status: 204 })));
    expect(result.current.loading).toBe(false);
  });

  it('resposta 204 não tenta ler JSON', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    const { result } = renderHook(() => useFetch());

    let retorno;
    await act(async () => {
      retorno = await result.current.request('/x');
    });

    expect(retorno).toMatchObject({ json: null });
    expect(result.current.data).toBeNull();
  });

  it('resposta que não é JSON não preenche data', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, text: 'oi', headers: { 'content-type': 'text/plain' } }));
    const { result } = renderHook(() => useFetch());

    await act(async () => {
      await result.current.request('/x');
    });

    expect(result.current.data).toBeNull();
  });

  it.each([
    ['message', { message: 'Falha via message' }, 'Falha via message'],
    ['error', { error: 'Falha via error' }, 'Falha via error'],
    ['sem campo conhecido', { x: 1 }, 'Erro na requisição'],
  ])('erro HTTP com corpo (%s) lança e guarda a mensagem', async (_nome, body, mensagem) => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 400, body }));
    const { result } = renderHook(() => useFetch());

    await act(async () => {
      await expect(result.current.request('/x')).rejects.toThrow(mensagem);
    });

    expect(result.current.error).toBe(mensagem);
  });

  it('erro HTTP com corpo que não é JSON usa a mensagem padrão', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    fetchMock.mockResolvedValue(fakeResponse({ status: 500, text: '<html>' }));
    const { result } = renderHook(() => useFetch());

    await act(async () => {
      await expect(result.current.request('/x')).rejects.toThrow('Erro na requisição');
    });

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('AbortError é propagado mas não vira mensagem de erro na tela', async () => {
    const abort = Object.assign(new Error('abortado'), { name: 'AbortError' });
    fetchMock.mockRejectedValue(abort);
    const { result } = renderHook(() => useFetch());

    await act(async () => {
      await expect(result.current.request('/x')).rejects.toThrow('abortado');
    });

    expect(result.current.error).toBeNull();
  });

  it('erro que não é Error (valor solto) é relançado sem guardar mensagem', async () => {
    fetchMock.mockRejectedValue('quebrou');
    const { result } = renderHook(() => useFetch());

    await act(async () => {
      await expect(result.current.request('/x')).rejects.toBe('quebrou');
    });

    expect(result.current.error).toBeNull();
  });

  it('nova requisição aborta a anterior e desmontar aborta a pendente', async () => {
    const signals: AbortSignal[] = [];
    fetchMock.mockImplementation(async (_url, init) => {
      signals.push(init?.signal as AbortSignal);
      return fakeResponse({ status: 204 });
    });
    const { result, unmount } = renderHook(() => useFetch());

    await act(async () => {
      await result.current.request('/1');
      await result.current.request('/2');
    });
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);

    unmount();
    expect(signals[1].aborted).toBe(true);
  });
});
