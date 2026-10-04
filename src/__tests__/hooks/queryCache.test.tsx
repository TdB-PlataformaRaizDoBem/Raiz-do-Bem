import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, render, renderHook, screen, waitFor } from '../../test/rtl';
import { createQueryClient, queryClient as clienteDoApp } from '../../lib/queryClient';
import { useBeneficiarios } from '../../hooks/useBeneficiarios';
import { useColaborador, useColaboradores } from '../../hooks/useColaboradores';
import { useContactLookup } from '../../hooks/useContactLookup';
import { useAtendimentos, useDesignacaoPendentes } from '../../hooks/useDesignacao';
import { useDentistas } from '../../hooks/useDentistas';
import { useImpactStats } from '../../hooks/useImpactStats';
import { useOrderStats } from '../../hooks/useOrderState';
import { usePedido, usePedidos, usePedidosAprovadosLivres } from '../../hooks/usePedidos';
import { useProfessionalStats } from '../../hooks/useProfessionalStats';
import { safeFetch } from '../../services/httpClient';
import Dashboard from '../../pages/dashboard/Dashboard';
import { atendimentoApi, beneficiarioApi, colaboradorApi, dentistaApi, pedidoApi } from '../../test/factories';
import { fakeResponse, installFetch, routeFetch, type FetchMock } from '../../test/http';
import { createTestQueryClient } from '../../test/queryClient';

let fetchMock: FetchMock;

const vezes = (url: string) => fetchMock.mock.calls.filter(([u]) => u === url).length;
const esperar = (ms = 20) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

beforeEach(() => {
  fetchMock = installFetch();
});

describe('configuração do cache', () => {
  it('usa 30s de staleTime, sem retry e sem refetch ao focar a janela', () => {
    const defaults = createQueryClient().getDefaultOptions().queries;

    expect(defaults).toMatchObject({ staleTime: 30_000, retry: false, refetchOnWindowFocus: false });
  });

  it('cada createQueryClient() tem um cache independente', () => {
    expect(createQueryClient()).not.toBe(createQueryClient());
    expect(clienteDoApp).toBeDefined();
  });
});

describe('requisições compartilhadas entre hooks', () => {
  it('vários hooks que leem beneficiários fazem UMA requisição', async () => {
    routeFetch(fetchMock, { '/beneficiario': [beneficiarioApi()], '/dentista': [dentistaApi()] });

    const { result } = renderHook(() => ({
      lista: useBeneficiarios(),
      impacto: useImpactStats(),
      contato: useContactLookup('+5511987654321'),
    }));

    await waitFor(() => expect(result.current.lista.status).toBe('success'));
    expect(result.current.impacto.total).toBe(1);
    await waitFor(() => expect(result.current.contato.loadingContact).toBe(false));
    expect(vezes('/beneficiario')).toBe(1);
    expect(vezes('/dentista')).toBe(1);
  });

  it('o dashboard inteiro busca cada endpoint uma única vez (antes: pedidos 3x, beneficiários 2x)', async () => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [pedidoApi({ status: 'PENDENTE' })],
      '/beneficiario': [beneficiarioApi()],
      '/dentista': [dentistaApi()],
    });

    render(<Dashboard />);

    await waitFor(() => expect(screen.getByText('6h')).toBeInTheDocument());
    await esperar();
    expect(vezes('/pedido-ajuda')).toBe(1);
    expect(vezes('/beneficiario')).toBe(1);
    expect(vezes('/dentista')).toBe(1);
  });

  it('estatísticas de pedidos e profissionais reaproveitam as listas completas', async () => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [pedidoApi({ id: 1, status: 'PENDENTE' }), pedidoApi({ id: 2, status: 'APROVADO' })],
      '/dentista': [dentistaApi({ disponivel: 'S' })],
    });

    const { result } = renderHook(() => ({
      pedidos: usePedidos(),
      stats: useOrderStats(),
      dentistas: useDentistas(),
      pros: useProfessionalStats(),
    }));

    await waitFor(() => expect(result.current.stats.total).toBe(2));
    await waitFor(() => expect(result.current.pros.totalDentistas).toBe(1));
    expect(vezes('/pedido-ajuda')).toBe(1);
    expect(vezes('/dentista')).toBe(1);
  });

  it('colaborador e pedido por id leem da lista em cache (sem GET por id)', async () => {
    routeFetch(fetchMock, {
      '/colaborador': [colaboradorApi({ id: 1 }), colaboradorApi({ id: 2, nomeCompleto: 'Bia' })],
      '/pedido-ajuda': [pedidoApi({ id: 1 }), pedidoApi({ id: 2, nomeCompleto: 'Joana' })],
    });

    const { result } = renderHook(() => ({
      colabs: useColaboradores(),
      colab: useColaborador(2),
      pedidos: usePedidos(),
      pedido: usePedido(2),
      semPedido: usePedido(99),
    }));

    await waitFor(() => expect(result.current.colab.status).toBe('success'));
    await waitFor(() => expect(result.current.pedido.status).toBe('success'));
    expect(result.current.colab.data?.nomeCompleto).toBe('Bia');
    expect(result.current.pedido.data?.nomeCompleto).toBe('Joana');
    expect(result.current.semPedido.data).toBeNull();
    expect(vezes('/colaborador')).toBe(1);
    expect(vezes('/pedido-ajuda')).toBe(1);
  });

  it('as três abas de atendimento leem a mesma lista: trocar de aba não refaz a requisição', async () => {
    routeFetch(fetchMock, {
      '/atendimento': [atendimentoApi({ id: 1, dataFim: 'NÃO FINALIZADO' }), atendimentoApi({ id: 2, dataFim: '2026-04-01' })],
      '/beneficiario': [],
    });

    const { result, rerender } = renderHook(({ aba }) => useAtendimentos(aba), {
      initialProps: { aba: 'TODOS' as 'TODOS' | 'EM_ATENDIMENTO' | 'CONCLUIDO' },
    });
    await waitFor(() => expect(result.current.atendimentos).toHaveLength(2));

    rerender({ aba: 'EM_ATENDIMENTO' });
    expect(result.current.atendimentos.map((a) => a.id)).toEqual([1]);
    rerender({ aba: 'CONCLUIDO' });
    expect(result.current.atendimentos.map((a) => a.id)).toEqual([2]);

    await esperar();
    expect(vezes('/atendimento')).toBe(1);
  });

  it('pendentes de designação e a lista de atendimentos dividem as mesmas requisições', async () => {
    routeFetch(fetchMock, {
      '/beneficiario': [beneficiarioApi({ id: 1, nomeCompleto: 'Maria' }), beneficiarioApi({ id: 2, nomeCompleto: 'José' })],
      '/atendimento': [atendimentoApi({ beneficiario: 'José' })],
    });

    const { result } = renderHook(() => ({ pend: useDesignacaoPendentes(), atend: useAtendimentos('TODOS'), lista: useBeneficiarios() }));

    await waitFor(() => expect(result.current.pend.pendentes.map((b) => b.nomeCompleto)).toEqual(['Maria']));
    expect(vezes('/beneficiario')).toBe(1);
    expect(vezes('/atendimento')).toBe(1);
  });
});

describe('reaproveitamento ao voltar para uma tela (navegação)', () => {
  it('dentro do staleTime, remontar mostra os dados na hora e não refaz a requisição', async () => {
    routeFetch(fetchMock, { '/beneficiario': [beneficiarioApi()] });
    const cliente = createTestQueryClient();

    const primeira = renderHook(() => useBeneficiarios(), { queryClient: cliente });
    await waitFor(() => expect(primeira.result.current.status).toBe('success'));
    primeira.unmount();

    const segunda = renderHook(() => useBeneficiarios(), { queryClient: cliente });

    expect(segunda.result.current.loading).toBe(false); // sem "Carregando..."
    expect(segunda.result.current.data).toHaveLength(1);
    await esperar();
    expect(vezes('/beneficiario')).toBe(1);
  });

  it('fora do staleTime, mostra o cache na hora e atualiza em segundo plano', async () => {
    routeFetch(fetchMock, { '/beneficiario': [beneficiarioApi({ id: 1 })] });
    const cliente = createTestQueryClient();
    cliente.setDefaultOptions({ queries: { staleTime: 0, gcTime: Infinity, retry: false } });

    const primeira = renderHook(() => useBeneficiarios(), { queryClient: cliente });
    await waitFor(() => expect(primeira.result.current.status).toBe('success'));
    primeira.unmount();
    routeFetch(fetchMock, { '/beneficiario': [beneficiarioApi({ id: 1 }), beneficiarioApi({ id: 2 })] });

    const segunda = renderHook(() => useBeneficiarios(), { queryClient: cliente });

    expect(segunda.result.current.data).toHaveLength(1); // cache antigo, instantâneo
    expect(segunda.result.current.loading).toBe(false);
    await waitFor(() => expect(segunda.result.current.data).toHaveLength(2)); // atualizado depois
  });

  it('cada render de teste começa com cache limpo (sem vazamento entre testes)', async () => {
    routeFetch(fetchMock, { '/beneficiario': [] });

    const { result } = renderHook(() => useBeneficiarios());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.status).toBe('success'));
  });
});

describe('invalidação automática ao gravar', () => {
  const montar = async () => {
    routeFetch(fetchMock, { '/beneficiario': [beneficiarioApi()], '/dentista': [dentistaApi()] });
    const cliente = createTestQueryClient();
    const hook = renderHook(() => ({ b: useBeneficiarios(), d: useDentistas() }), { queryClient: cliente });
    await waitFor(() => expect(hook.result.current.b.status).toBe('success'));
    await waitFor(() => expect(hook.result.current.d.status).toBe('success'));
    return { hook, cliente };
  };

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('%s com sucesso refaz as listas abertas', async (metodo) => {
    await montar();
    fetchMock.mockImplementation(async (_url, init) =>
      init?.method === metodo ? fakeResponse({ status: 200, body: {} }) : fakeResponse({ status: 200, body: [] }),
    );

    await act(async () => {
      await safeFetch('/beneficiario/123', { method: metodo });
    });

    await waitFor(() => expect(vezes('/beneficiario')).toBe(2));
    expect(vezes('/dentista')).toBe(2); // qualquer escrita invalida o cache de domínio inteiro
  });

  it('o beneficiário criado aparece na lista sem ninguém chamar refetch', async () => {
    const { hook } = await montar();
    fetchMock.mockImplementation(async (url, init) => {
      if (init?.method === 'POST') return fakeResponse({ status: 201, body: {} });
      if (url === '/beneficiario') return fakeResponse({ status: 200, body: [beneficiarioApi({ id: 1 }), beneficiarioApi({ id: 2 })] });
      return fakeResponse({ status: 200, body: [] });
    });

    await act(async () => {
      await safeFetch('/beneficiario', { method: 'POST', body: '{}' });
    });

    await waitFor(() => expect(hook.result.current.b.data).toHaveLength(2));
  });

  it('GET não invalida', async () => {
    await montar();

    await act(async () => {
      await safeFetch('/beneficiario');
    });
    await esperar();

    expect(vezes('/beneficiario')).toBe(2); // 1 do hook + 1 do GET manual, sem refetch extra
    expect(vezes('/dentista')).toBe(1);
  });

  it.each([
    ['/chat/read/%2B5511', 'PUT'],
    ['http://localhost:8000/chat/send', 'POST'],
    ['/auth/refreshToken', 'POST'],
  ])('%s (%s) não invalida o cache de domínio', async (url, metodo) => {
    await montar();

    await act(async () => {
      await safeFetch(url, { method: metodo });
    });
    await esperar();

    expect(vezes('/beneficiario')).toBe(1);
    expect(vezes('/dentista')).toBe(1);
  });

  it('escrita que falha (erro do back) não invalida', async () => {
    await montar();
    fetchMock.mockImplementation(async (_url, init) =>
      init?.method === 'DELETE' ? fakeResponse({ status: 409, body: { mensagem: 'em uso' } }) : fakeResponse({ status: 200, body: [] }),
    );

    await act(async () => {
      await safeFetch('/beneficiario/1', { method: 'DELETE' });
    });
    await esperar();

    expect(vezes('/beneficiario')).toBe(1);
  });

  it('telas fechadas ficam desatualizadas e buscam de novo ao reabrir', async () => {
    const { hook, cliente } = await montar();
    hook.unmount();
    fetchMock.mockImplementation(async (url, init) =>
      init?.method === 'DELETE'
        ? fakeResponse({ status: 204 })
        : fakeResponse({ status: 200, body: url === '/beneficiario' ? [] : [dentistaApi()] }),
    );

    await act(async () => {
      await safeFetch('/beneficiario/1', { method: 'DELETE' });
    });
    await esperar();
    expect(vezes('/beneficiario')).toBe(1); // ninguém observando: não refaz agora

    const reaberta = renderHook(() => useBeneficiarios(), { queryClient: cliente });

    await waitFor(() => expect(reaberta.result.current.data).toEqual([])); // refaz ao reabrir
    expect(vezes('/beneficiario')).toBe(2);
  });

  it('refetch manual logo após a escrita reaproveita a busca em andamento (sem requisição duplicada)', async () => {
    const { hook } = await montar();
    fetchMock.mockImplementation(async (_url, init) => {
      if (init?.method === 'PUT') return fakeResponse({ status: 200, body: {} });
      await new Promise((r) => setTimeout(r, 10));
      return fakeResponse({ status: 200, body: [] });
    });

    await act(async () => {
      await safeFetch('/beneficiario/1', { method: 'PUT' }); // dispara a invalidação
      await hook.result.current.b.refetch(); // a tela também chama refetch, como antes
    });

    await waitFor(() => expect(hook.result.current.b.loading).toBe(false));
    expect(vezes('/beneficiario')).toBe(2); // 1 inicial + 1 compartilhada (e não 3)
  });
});

describe('erros', () => {
  it('sem dados em cache, o erro aparece', async () => {
    routeFetch(fetchMock, { '/beneficiario': fakeResponse({ status: 500, body: { mensagem: 'Banco fora do ar' } }) });

    const { result } = renderHook(() => useBeneficiarios());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Banco fora do ar');
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('falha ao atualizar com dados em cache mantém a tela com os dados antigos', async () => {
    routeFetch(fetchMock, { '/beneficiario': [beneficiarioApi()] });
    const { result } = renderHook(() => useBeneficiarios());
    await waitFor(() => expect(result.current.status).toBe('success'));
    routeFetch(fetchMock, { '/beneficiario': fakeResponse({ status: 500, body: { mensagem: 'instável' } }) });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('success');
  });

  it('erros são tentados uma vez só (retry desligado): um erro = uma requisição', async () => {
    routeFetch(fetchMock, { '/dentista': fakeResponse({ status: 500, body: { mensagem: 'x' } }) });

    const { result } = renderHook(() => useDentistas());

    await waitFor(() => expect(result.current.status).toBe('error'));
    await esperar();
    expect(vezes('/dentista')).toBe(1);
  });
});

describe('usePedidosAprovadosLivres', () => {
  it('só devolve APROVADOS que ainda não viraram beneficiário', async () => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [
        pedidoApi({ id: 1, status: 'APROVADO' }),
        pedidoApi({ id: 2, status: 'APROVADO' }),
        pedidoApi({ id: 3, status: 'PENDENTE' }),
        pedidoApi({ id: 4, status: 'REJEITADO' }),
      ],
      '/beneficiario': [beneficiarioApi({ pedido: { id: 2, dentistaResponsavel: 'Dr. X' } })],
    });

    const { result } = renderHook(() => usePedidosAprovadosLivres());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data?.map((p) => p.id)).toEqual([1]);
  });

  it('se os beneficiários não carregarem, devolve todos os aprovados', async () => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [pedidoApi({ id: 1, status: 'APROVADO' }), pedidoApi({ id: 3, status: 'PENDENTE' })],
      '/beneficiario': fakeResponse({ status: 500, body: { mensagem: 'x' } }),
    });

    const { result } = renderHook(() => usePedidosAprovadosLivres());

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data?.map((p) => p.id)).toEqual([1]);
  });

  it('erro nos pedidos é propagado', async () => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': fakeResponse({ status: 500, body: { mensagem: 'Pedidos fora do ar' } }),
      '/beneficiario': [],
    });

    const { result } = renderHook(() => usePedidosAprovadosLivres());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Pedidos fora do ar');
  });

  it('reutiliza o cache de pedidos e beneficiários já carregados pelas outras telas', async () => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [pedidoApi({ id: 1, status: 'APROVADO' })],
      '/beneficiario': [],
    });

    const { result } = renderHook(() => ({ livres: usePedidosAprovadosLivres(), pedidos: usePedidos(), benef: useBeneficiarios() }));

    await waitFor(() => expect(result.current.livres.status).toBe('success'));
    expect(vezes('/pedido-ajuda')).toBe(1);
    expect(vezes('/beneficiario')).toBe(1);
  });

  it('refetch atualiza as duas listas', async () => {
    routeFetch(fetchMock, { '/pedido-ajuda': [pedidoApi({ id: 1, status: 'APROVADO' })], '/beneficiario': [] });
    const { result } = renderHook(() => usePedidosAprovadosLivres());
    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(vezes('/pedido-ajuda')).toBe(2);
    expect(vezes('/beneficiario')).toBe(2);
  });
});
