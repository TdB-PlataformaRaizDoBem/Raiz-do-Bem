import { describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { DEFAULT_PAGE_SIZE, usePagination } from '../../hooks/usePagination';

const lista = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe('usePagination', () => {
  it('usa 12 itens por página por padrão', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(12);

    const { result } = renderHook(() => usePagination(lista(30)));

    expect(result.current.pageItems).toHaveLength(12);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalItems).toBe(30);
    expect([result.current.from, result.current.to]).toEqual([1, 12]);
  });

  it('navega entre páginas', () => {
    const { result } = renderHook(() => usePagination(lista(30), 10));

    act(() => result.current.setPage(2));
    expect(result.current.pageItems).toEqual(lista(30).slice(10, 20));
    expect([result.current.from, result.current.to]).toEqual([11, 20]);

    act(() => result.current.setPage(3));
    expect(result.current.pageItems).toEqual(lista(30).slice(20, 30));
  });

  it('última página parcial calcula "to" pelo total', () => {
    const { result } = renderHook(() => usePagination(lista(25), 10));

    act(() => result.current.setPage(3));

    expect(result.current.pageItems).toHaveLength(5);
    expect([result.current.from, result.current.to]).toEqual([21, 25]);
  });

  it('lista vazia: 1 página, from/to zerados', () => {
    const { result } = renderHook(() => usePagination([]));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.pageItems).toEqual([]);
    expect([result.current.from, result.current.to]).toEqual([0, 0]);
  });

  it('lista menor que a página cabe em uma página só', () => {
    const { result } = renderHook(() => usePagination(lista(5), 12));

    expect(result.current.totalPages).toBe(1);
    expect([result.current.from, result.current.to]).toEqual([1, 5]);
  });

  it('nunca passa da última página quando a lista encolhe (ex.: exclusão)', () => {
    const { result, rerender } = renderHook(({ items }) => usePagination(items, 10), {
      initialProps: { items: lista(30) },
    });
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    rerender({ items: lista(12) });

    expect(result.current.page).toBe(2);
    expect(result.current.pageItems).toEqual([11, 12]);
  });

  it('volta para a página 1 quando a resetKey muda (busca/filtros)', () => {
    const { result, rerender } = renderHook(
      ({ key }) => usePagination(lista(30), 10, key),
      { initialProps: { key: 'a' } },
    );
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    rerender({ key: 'b' });

    expect(result.current.page).toBe(1);
  });

  it('mantém a página quando a resetKey não muda', () => {
    const { result, rerender } = renderHook(
      ({ key }) => usePagination(lista(30), 10, key),
      { initialProps: { key: 'a' } },
    );
    act(() => result.current.setPage(2));

    rerender({ key: 'a' });

    expect(result.current.page).toBe(2);
  });
});
