import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAsync } from '../../hooks/useAsync';

describe('useAsync', () => {
  it('executa ao montar: loading → success com os dados', async () => {
    const fn = jest.fn(async () => ['a', 'b']);

    const { result } = renderHook(() => useAsync(fn));

    expect(result.current.status).toBe('loading');
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toEqual(['a', 'b']);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('guarda a mensagem do erro lançado', async () => {
    const { result } = renderHook(() =>
      useAsync(async () => {
        throw new Error('Falhou feio');
      }),
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Falhou feio');
    expect(result.current.data).toBeNull();
  });

  it('usa mensagem genérica quando o erro não é uma instância de Error', async () => {
    const { result } = renderHook(() =>
      useAsync(async () => {
        throw 'texto solto';
      }),
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Erro desconhecido');
  });

  it('refetch executa de novo', async () => {
    const fn = jest.fn(async () => Date.now());
    const { result } = renderHook(() => useAsync(fn));
    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('reexecuta quando as dependências mudam', async () => {
    const fn = jest.fn(async () => 'x');
    const { result, rerender } = renderHook(({ dep }) => useAsync(fn, [dep]), {
      initialProps: { dep: 1 },
    });
    await waitFor(() => expect(result.current.status).toBe('success'));

    rerender({ dep: 2 });
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(2));
  });

  it('não atualiza o estado depois de desmontar (resultado)', async () => {
    let resolver: (v: string) => void = () => {};
    const fn = () => new Promise<string>((res) => (resolver = res));
    const { result, unmount } = renderHook(() => useAsync(fn));
    expect(result.current.status).toBe('loading');

    unmount();
    await act(async () => resolver('tarde'));

    expect(result.current.status).toBe('loading');
  });

  it('não atualiza o estado depois de desmontar (erro)', async () => {
    let rejeitar: (e: Error) => void = () => {};
    const fn = () => new Promise<string>((_res, rej) => (rejeitar = rej));
    const { result, unmount } = renderHook(() => useAsync(fn));

    unmount();
    await act(async () => rejeitar(new Error('tarde')));

    expect(result.current.status).toBe('loading');
  });
});
