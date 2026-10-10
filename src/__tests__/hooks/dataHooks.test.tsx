import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import type { AuthUser } from '../../domain/types/auth';
import { useBeneficiario, useBeneficiarios } from '../../hooks/useBeneficiarios';
import { useColaborador, useColaboradores } from '../../hooks/useColaboradores';
import { useContactLookup } from '../../hooks/useContactLookup';
import { useCurrentColaboradorId } from '../../hooks/useCurrentColaboradorId';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAtendimentos, useDesignacaoPendentes } from '../../hooks/useDesignacao';
import { useDentista, useDentistas } from '../../hooks/useDentistas';
import { useEspecialidades } from '../../hooks/useEspecialidades';
import { useImpactStats } from '../../hooks/useImpactStats';
import { useOrderStats } from '../../hooks/useOrderState';
import { usePedido, usePedidos, usePedidosAprovadosLivres } from '../../hooks/usePedidos';
import { useProfessionalStats } from '../../hooks/useProfessionalStats';
import { useProgramasSociais } from '../../hooks/useProgramasSociais';
import {
  atendimentoApi,
  beneficiarioApi,
  colaboradorApi,
  dentistaApi,
  pedidoApi,
} from '../../test/factories';
import { fakeResponse, installFetch, routeFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;

beforeEach(() => {
  fetchMock = installFetch();
});

describe('hooks finos de listagem (useAsync + service)', () => {
  it('useBeneficiarios / useBeneficiario', async () => {
    routeFetch(fetchMock, { '/beneficiario': [beneficiarioApi()], '/beneficiario/123': beneficiarioApi({ id: 7 }) });

    const lista = renderHook(() => useBeneficiarios());
    const unico = renderHook(() => useBeneficiario('123'));

    await waitFor(() => expect(lista.result.current.status).toBe('success'));
    await waitFor(() => expect(unico.result.current.status).toBe('success'));
    expect(lista.result.current.data).toHaveLength(1);
    expect(unico.result.current.data?.id).toBe(7);
  });

  it('useDentistas / useDentista', async () => {
    routeFetch(fetchMock, { '/dentista': [dentistaApi()], '/dentista/123': dentistaApi({ id: 4 }) });

    const lista = renderHook(() => useDentistas());
    const unico = renderHook(() => useDentista('123'));

    await waitFor(() => expect(lista.result.current.status).toBe('success'));
    await waitFor(() => expect(unico.result.current.status).toBe('success'));
    expect(lista.result.current.data).toHaveLength(1);
    expect(unico.result.current.data?.id).toBe(4);
  });

  it('useColaboradores / useColaborador', async () => {
    routeFetch(fetchMock, { '/colaborador': [colaboradorApi({ id: 1 }), colaboradorApi({ id: 2 })] });

    const lista = renderHook(() => useColaboradores());
    const unico = renderHook(() => useColaborador(2));

    await waitFor(() => expect(lista.result.current.status).toBe('success'));
    await waitFor(() => expect(unico.result.current.status).toBe('success'));
    expect(lista.result.current.data).toHaveLength(2);
    expect(unico.result.current.data?.id).toBe(2);
  });

  it('usePedidos / usePedido / usePedidosAprovadosLivres', async () => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [pedidoApi({ id: 1, status: 'APROVADO' }), pedidoApi({ id: 2 })],
      '/beneficiario': [],
    });

    const lista = renderHook(() => usePedidos());
    const unico = renderHook(() => usePedido(2));
    const livres = renderHook(() => usePedidosAprovadosLivres());

    await waitFor(() => expect(lista.result.current.status).toBe('success'));
    await waitFor(() => expect(unico.result.current.status).toBe('success'));
    await waitFor(() => expect(livres.result.current.status).toBe('success'));
    expect(lista.result.current.data).toHaveLength(2);
    expect(unico.result.current.data?.id).toBe(2);
    expect(livres.result.current.data?.map((p) => p.id)).toEqual([1]);
  });

  it('useEspecialidades', async () => {
    routeFetch(fetchMock, { '/especialidades': [{ id: 1, descricao: 'Ortodontia' }] });

    const { result } = renderHook(() => useEspecialidades());

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toEqual([{ id: 1, descricao: 'Ortodontia' }]);
  });

  it('useProgramasSociais devolve [] enquanto carrega e a lista depois', async () => {
    routeFetch(fetchMock, { '/programas-sociais': [{ id: 1, programa: 'Dentista do Bem' }] });

    const { result } = renderHook(() => useProgramasSociais());

    expect(result.current.programas).toEqual([]);
    await waitFor(() => expect(result.current.programas).toHaveLength(1));
    expect(result.current.loading).toBe(false);
  });
});

describe('useDesignacao', () => {
  it('pendentes: beneficiários cujo nome ainda não aparece em nenhum atendimento', async () => {
    routeFetch(fetchMock, {
      '/beneficiario': [
        beneficiarioApi({ id: 1, nomeCompleto: 'Maria Silva' }),
        beneficiarioApi({ id: 2, nomeCompleto: 'José Souza' }),
        beneficiarioApi({ id: 3, nomeCompleto: 'Ana Lima' }),
      ],
      '/atendimento': [
        atendimentoApi({ beneficiario: '  maria SILVA ' }), // normalização: trim + caixa
        atendimentoApi({ id: 2, beneficiario: 'N/A' }), // ignorado
        atendimentoApi({ id: 3, beneficiario: null }), // ignorado
      ],
    });

    const { result } = renderHook(() => useDesignacaoPendentes());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pendentes.map((b) => b.id)).toEqual([2, 3]);
    expect(result.current.error).toBeNull();
  });

  it('pendentes: se a lista de atendimentos falhar, todos os beneficiários ficam pendentes', async () => {
    routeFetch(fetchMock, {
      '/beneficiario': [beneficiarioApi({ id: 1 }), beneficiarioApi({ id: 2 })],
      '/atendimento': fakeResponse({ status: 500, body: { mensagem: 'erro' } }),
    });

    const { result } = renderHook(() => useDesignacaoPendentes());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pendentes).toHaveLength(2);
  });

  it('pendentes: devolve [] e o erro quando os beneficiários falham', async () => {
    routeFetch(fetchMock, {
      '/beneficiario': fakeResponse({ status: 500, body: { mensagem: 'Banco fora do ar' } }),
      '/atendimento': [],
    });

    const { result } = renderHook(() => useDesignacaoPendentes());

    await waitFor(() => expect(result.current.error).toBe('Banco fora do ar'));
    expect(result.current.pendentes).toEqual([]);
  });

  describe('atendimentos por aba', () => {
    const lista = [
      atendimentoApi({ id: 1, dataFim: 'NÃO FINALIZADO' }),
      atendimentoApi({ id: 2, dataFim: '2026-04-01' }),
      atendimentoApi({ id: 3, dataFim: 'NÃO FINALIZADO' }),
    ];

    it.each([
      ['TODOS', [1, 2, 3]],
      ['EM_ATENDIMENTO', [1, 3]],
      ['CONCLUIDO', [2]],
    ] as const)('aba %s', async (aba, ids) => {
      routeFetch(fetchMock, { '/atendimento': lista });

      const { result } = renderHook(() => useAtendimentos(aba));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.atendimentos.map((a) => a.id)).toEqual(ids);
    });

    it('troca a lista ao mudar de aba', async () => {
      routeFetch(fetchMock, { '/atendimento': lista });

      const { result, rerender } = renderHook(({ aba }) => useAtendimentos(aba), {
        initialProps: { aba: 'TODOS' as 'TODOS' | 'CONCLUIDO' },
      });
      await waitFor(() => expect(result.current.atendimentos).toHaveLength(3));

      rerender({ aba: 'CONCLUIDO' });

      await waitFor(() => expect(result.current.atendimentos).toHaveLength(1));
    });
  });
});

describe('useOrderStats', () => {
  it('conta por status e devolve os 10 pendentes mais antigos', async () => {
    const pendentes = Array.from({ length: 12 }, (_, i) =>
      pedidoApi({ id: i + 1, status: 'PENDENTE', dataPedido: `2026-03-${String(12 - i).padStart(2, '0')}` }),
    );
    routeFetch(fetchMock, {
      '/pedido-ajuda': [
        ...pendentes,
        pedidoApi({ id: 100, status: 'APROVADO' }),
        pedidoApi({ id: 101, status: 'APROVADO' }),
        pedidoApi({ id: 102, status: 'REJEITADO' }),
      ],
    });

    const { result } = renderHook(() => useOrderStats());

    await waitFor(() => expect(result.current.total).toBe(15));
    expect(result.current).toMatchObject({ pendentes: 12, aprovados: 2, negados: 1 });
    expect(result.current.pedidosCriticos).toHaveLength(10);
    expect(result.current.pedidosCriticos[0].dataPedidoISO).toBe('2026-03-01'); // mais antigo primeiro
  });

  it('em caso de erro volta ao estado vazio', async () => {
    routeFetch(fetchMock, { '/pedido-ajuda': fakeResponse({ status: 500 }) });

    const { result } = renderHook(() => useOrderStats());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current).toEqual({ pendentes: 0, aprovados: 0, negados: 0, total: 0, pedidosCriticos: [] });
  });
});

describe('useImpactStats', () => {
  it('calcula totais por programa, horas e ranking por estado', async () => {
    const comEstado = (id: number, programa: string, estado: string) =>
      beneficiarioApi({
        id,
        programaSocial: programa,
        endereco: { id, logradouro: 'x', cep: '1', numero: '1', cidade: 'c', estado },
      });
    routeFetch(fetchMock, {
      '/beneficiario': [
        comEstado(1, 'DENTISTA_DO_BEM', 'SP'),
        comEstado(2, 'DENTISTA_DO_BEM', 'SP'),
        comEstado(3, 'APOLONIAS_DO_BEM', 'RJ'),
        beneficiarioApi({ id: 4, programaSocial: 'OUTRO', endereco: null }),
      ],
    });

    const { result } = renderHook(() => useImpactStats());

    await waitFor(() => expect(result.current.total).toBe(4));
    expect(result.current.qtdTdb).toBe(2);
    expect(result.current.qtdAdb).toBe(1);
    expect(result.current.totalHoras).toBe(2 * 6 + 1 * 20);
    expect(result.current.rankingEstado[0]).toEqual({ uf: 'SP', qtd: 2, percent: 50 });
    expect(result.current.rankingEstado.map((r) => r.uf)).toContain('Não informado');
  });

  it('o ranking mostra no máximo 5 estados', async () => {
    const ufs = ['SP', 'RJ', 'MG', 'BA', 'PR', 'SC', 'RS'];
    routeFetch(fetchMock, {
      '/beneficiario': ufs.map((uf, i) =>
        beneficiarioApi({
          id: i + 1,
          endereco: { id: i, logradouro: 'x', cep: '1', numero: '1', cidade: 'c', estado: uf },
        }),
      ),
    });

    const { result } = renderHook(() => useImpactStats());

    await waitFor(() => expect(result.current.rankingEstado).toHaveLength(5));
  });

  it('lista vazia: zeros', async () => {
    routeFetch(fetchMock, { '/beneficiario': [] });

    const { result } = renderHook(() => useImpactStats());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current).toMatchObject({ total: 0, qtdTdb: 0, qtdAdb: 0, totalHoras: 0, rankingEstado: [] });
  });

  it('erro volta ao estado vazio', async () => {
    routeFetch(fetchMock, { '/beneficiario': fakeResponse({ status: 500 }) });

    const { result } = renderHook(() => useImpactStats());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current.total).toBe(0);
  });
});

describe('useProfessionalStats', () => {
  it('conta dentistas disponíveis e total', async () => {
    routeFetch(fetchMock, {
      '/dentista': [dentistaApi({ id: 1, disponivel: 'S' }), dentistaApi({ id: 2, disponivel: 'N' }), dentistaApi({ id: 3, disponivel: 'S' })],
    });

    const { result } = renderHook(() => useProfessionalStats());

    await waitFor(() => expect(result.current.totalDentistas).toBe(3));
    expect(result.current.dentistasDisponiveis).toBe(2);
  });

  it('erro mantém zeros', async () => {
    routeFetch(fetchMock, { '/dentista': fakeResponse({ status: 500 }) });

    const { result } = renderHook(() => useProfessionalStats());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current).toEqual({ dentistasDisponiveis: 0, totalDentistas: 0 });
  });
});

describe('useDashboardData', () => {
  it('reúne pedidos, impacto e profissionais', async () => {
    routeFetch(fetchMock, {
      '/pedido-ajuda': [pedidoApi({ status: 'PENDENTE' })],
      '/beneficiario': [beneficiarioApi()],
      '/dentista': [dentistaApi()],
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.orders.total).toBe(1);
      expect(result.current.impact.total).toBe(1);
      expect(result.current.pros.totalDentistas).toBe(1);
    });
  });
});

describe('useContactLookup', () => {
  const rotas = () => ({
    '/beneficiario': [beneficiarioApi({ nomeCompleto: 'Maria Beneficiária', telefone: '11987654321' })],
    '/dentista': [dentistaApi({ nomeCompleto: 'Dr. Contato', telefone: '(21) 91234-5678' })],
  });

  it('encontra um beneficiário pelo telefone do chat (+55...)', async () => {
    routeFetch(fetchMock, rotas());

    const { result } = renderHook(() => useContactLookup('+5511987654321'));

    expect(result.current.loadingContact).toBe(true);
    await waitFor(() => expect(result.current.loadingContact).toBe(false));
    expect(result.current.contact).toEqual({ nome: 'Maria Beneficiária', tipo: 'beneficiario' });
  });

  it('encontra um dentista quando não há beneficiário com o número', async () => {
    routeFetch(fetchMock, rotas());

    const { result } = renderHook(() => useContactLookup('+5521912345678'));

    await waitFor(() => expect(result.current.contact).not.toBeNull());
    expect(result.current.contact).toEqual({ nome: 'Dr. Contato', tipo: 'dentista' });
  });

  it('número desconhecido: contact null', async () => {
    routeFetch(fetchMock, rotas());

    const { result } = renderHook(() => useContactLookup('+5599000000000'));

    await waitFor(() => expect(result.current.loadingContact).toBe(false));
    expect(result.current.contact).toBeNull();
  });

  it('telefone vazio: não consulta e encerra o loading', async () => {
    const { result } = renderHook(() => useContactLookup(''));

    await waitFor(() => expect(result.current.loadingContact).toBe(false));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.contact).toBeNull();
  });

  it('erro na busca: contact null e loading encerrado', async () => {
    routeFetch(fetchMock, { '/beneficiario': fakeResponse({ status: 500 }), '/dentista': [] });

    const { result } = renderHook(() => useContactLookup('+5511987654321'));

    await waitFor(() => expect(result.current.loadingContact).toBe(false));
    expect(result.current.contact).toBeNull();
  });

  it('ignora a resposta se o componente desmontar antes', async () => {
    routeFetch(fetchMock, rotas());

    const { result, unmount } = renderHook(() => useContactLookup('+5511987654321'));
    unmount();

    await new Promise((r) => setTimeout(r, 20));
    expect(result.current.contact).toBeNull();
  });
});

describe('useCurrentColaboradorId', () => {
  const wrapper = (user: AuthUser | null) =>
    function Wrapper({ children }: { children: ReactNode }) {
      const value: AuthContextValue = {
        user,
        isLoading: false,
        isAuthenticated: !!user,
        login: async () => {},
        logout: () => {},
      };
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };
  const usuario = (email: string): AuthUser => ({ email, nome: 'U', role: 'ADMIN', exp: 9999999999 });

  it('resolve o id comparando o e-mail do usuário logado', async () => {
    routeFetch(fetchMock, {
      '/colaborador': [colaboradorApi({ id: 1, email: 'a@x.com' }), colaboradorApi({ id: 2, email: 'b@x.com' })],
    });

    const { result } = renderHook(() => useCurrentColaboradorId(), { wrapper: wrapper(usuario('b@x.com')) });

    await waitFor(() => expect(result.current).toBe(2));
  });

  it('e-mail não encontrado: null', async () => {
    routeFetch(fetchMock, { '/colaborador': [colaboradorApi({ email: 'a@x.com' })] });

    const { result } = renderHook(() => useCurrentColaboradorId(), { wrapper: wrapper(usuario('zzz@x.com')) });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it('sem usuário logado: não consulta', () => {
    const { result } = renderHook(() => useCurrentColaboradorId(), { wrapper: wrapper(null) });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toBeNull();
  });

  it('erro na busca: null', async () => {
    routeFetch(fetchMock, { '/colaborador': fakeResponse({ status: 500, body: { mensagem: 'x' } }) });

    const { result } = renderHook(() => useCurrentColaboradorId(), { wrapper: wrapper(usuario('a@x.com')) });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });
});
