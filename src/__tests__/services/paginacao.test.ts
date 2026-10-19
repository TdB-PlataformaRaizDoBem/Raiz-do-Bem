import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeResponse } from '../../test/http';
import { buscarPagina, buscarTodos } from '../../services/paginacao';

const fetchMock = vi.fn();

const pagina = (conteudo: number[], numero: number, totalPaginas: number, total: number) =>
  fakeResponse({ body: { conteudo, pagina: numero, tamanho: 2, totalElementos: total, totalPaginas } });

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

describe('buscarPagina', () => {
  it('envia pagina e size e lê conteudo e os totais', async () => {
    fetchMock.mockResolvedValueOnce(pagina([1, 2], 1, 3, 5));

    const resultado = await buscarPagina<number>('/dentista', 1, 2);

    expect(fetchMock.mock.calls[0][0]).toBe('/dentista?pagina=1&size=2');
    expect(resultado).toEqual({ itens: [1, 2], pagina: 1, tamanho: 2, total: 5, totalPaginas: 3 });
  });

  it('usa os valores padrão (página 0, 20 itens)', async () => {
    fetchMock.mockResolvedValueOnce(pagina([], 0, 0, 0));

    await buscarPagina('/dentista');

    expect(fetchMock.mock.calls[0][0]).toBe('/dentista?pagina=0&size=20');
  });

  it('404 e 204 viram página vazia', async () => {
    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 404 }));
    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 204 }));

    expect((await buscarPagina('/x')).itens).toEqual([]);
    expect((await buscarPagina('/x')).total).toBe(0);
  });

  it('aceita array simples (endpoint sem paginação)', async () => {
    fetchMock.mockResolvedValueOnce(fakeResponse({ body: [1, 2, 3] }));

    expect(await buscarPagina<number>('/x')).toMatchObject({ itens: [1, 2, 3], total: 3, totalPaginas: 1 });
  });

  it('corpo vazio ou sem campos não quebra', async () => {
    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, text: '' }));
    fetchMock.mockResolvedValueOnce(fakeResponse({ body: {} }));

    expect((await buscarPagina('/x')).itens).toEqual([]);
    expect(await buscarPagina('/x', 2, 5)).toEqual({ itens: [], pagina: 2, tamanho: 5, total: 0, totalPaginas: 0 });
  });
});

describe('buscarTodos', () => {
  it('percorre todas as páginas em lotes de 100 e junta os itens', async () => {
    fetchMock
      .mockResolvedValueOnce(pagina([1, 2], 0, 3, 5))
      .mockResolvedValueOnce(pagina([3, 4], 1, 3, 5))
      .mockResolvedValueOnce(pagina([5], 2, 3, 5));

    expect(await buscarTodos<number>('/dentista')).toEqual([1, 2, 3, 4, 5]);
    expect(fetchMock.mock.calls.map(([u]) => u)).toEqual([
      '/dentista?pagina=0&size=100',
      '/dentista?pagina=1&size=100',
      '/dentista?pagina=2&size=100',
    ]);
  });

  it('uma única página faz uma única requisição', async () => {
    fetchMock.mockResolvedValueOnce(pagina([1], 0, 1, 1));

    expect(await buscarTodos<number>('/x')).toEqual([1]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
