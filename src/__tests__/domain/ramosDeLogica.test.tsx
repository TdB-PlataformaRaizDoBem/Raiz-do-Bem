import { renderHook, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mapDentista } from '../../domain/mappers/DentistaMapper';
import { mapPedido } from '../../domain/mappers/PedidoMapper';
import { toRegiaoViewModel } from '../../domain/mappers/VulnerabilidadeMapper';
import { ordenarRegioes } from '../../domain/tabelaRegioes';
import { dentistaFilterConfig } from '../../hooks/pageFilterConfigs';
import { useCenarioVoluntarios } from '../../hooks/useCenarioVoluntarios';
import { useColaborador } from '../../hooks/useColaboradores';
import { lerCorDoTema, useEscalaVulnerabilidade } from '../../hooks/useEscalaVulnerabilidade';
import { useImpactStats } from '../../hooks/useImpactStats';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import { formatDate } from '../../utils/dateUtils';
import { pontoDeRotulo } from '../../utils/geoUtils';
import { beneficiarioApi, colaboradorApi, dentistaApi, pedidoApi } from '../../test/factories';
import { installFetch, routeFetch } from '../../test/http';
import { feature, propsUF } from '../../test/vulnerabilidadeFixtures';

afterEach(() => vi.unstubAllGlobals());

describe('mappers — valores que o back-end não conhece', () => {
  it('dentista com sexo desconhecido mostra travessão no rótulo', () => {
    expect(mapDentista(dentistaApi({ sexo: 'X' as never })).sexoLabel).toBe('—');
  });

  it('dentista sem sexo informado é tratado como "Outro"', () => {
    expect(mapDentista(dentistaApi({ sexo: undefined as never })).sexoLabel).toBe('Outro');
  });

  it('pedido com sexo desconhecido mostra travessão; sem sexo também', () => {
    expect(mapPedido(pedidoApi({ sexo: 'X' as never })).sexoLabel).toBe('—');
    expect(mapPedido(pedidoApi({ sexo: undefined as never })).sexoLabel).toBe('—');
  });
});

describe('filtro de dentistas por programa', () => {
  const dentista = (programa: string | null) =>
    ({
      disponivel: true,
      programa,
      especialidades: [],
      nomeCompleto: 'Ana',
      croDentista: 'CRO',
      cpf: '1',
      cidade: null,
      estado: null,
    }) as never;

  it('dentista sem programa não casa com um programa escolhido', () => {
    expect(dentistaFilterConfig.predicate(dentista(null), { programa: 'Dentista do Bem' }, '')).toBe(false);
  });

  it('dentista do programa escolhido casa', () => {
    expect(dentistaFilterConfig.predicate(dentista('Dentista do Bem'), { programa: 'Dentista do Bem' }, '')).toBe(true);
  });
});

describe('formatDate', () => {
  it.each([
    ['2020-01-31', '31/01/2020'],
    ['2020--31', '—'],
    ['2020-01-', '—'],
    ['-01-31', '—'],
    ['2020-01', '—'],
    ['', '—'],
    [null, '—'],
  ])('%j -> %s', (entrada, esperado) => {
    expect(formatDate(entrada as string | null)).toBe(esperado);
  });
});

describe('ordenarRegioes — empate entre ausentes', () => {
  it('dois sem valor ficam em ordem de código IBGE, nas duas direções', () => {
    const a = toRegiaoViewModel(feature(propsUF({ codigo_ibge: '35' })));
    const b = toRegiaoViewModel(feature(propsUF({ codigo_ibge: '21' })));
    const semValor = () => null;

    expect(ordenarRegioes([a, b], semValor, 'asc').map((r) => r.codigoIbge)).toEqual(['21', '35']);
    expect(ordenarRegioes([a, b], semValor, 'desc').map((r) => r.codigoIbge)).toEqual(['21', '35']);
  });
});

describe('pontoDeRotulo — MultiPolygon com parte vazia', () => {
  it('ignora a parte sem anéis e usa a que tem área', () => {
    const quadrado = [[0, 20], [10, 20], [10, 30], [0, 30]];

    const ponto = pontoDeRotulo({ type: 'MultiPolygon', coordinates: [[], [quadrado]] });

    expect(ponto).toEqual([25, 5]);
  });
});

describe('hooks de dados', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('useImpactStats: beneficiário sem programa não conta em nenhum programa', async () => {
    const fetchMock = installFetch();
    routeFetch(fetchMock, {
      '/beneficiario': [
        beneficiarioApi({ id: 1, programaSocial: null as never }),
        beneficiarioApi({ id: 2, programaSocial: 'TDB' as never }),
      ],
    });

    const { result } = renderHook(() => useImpactStats());

    await waitFor(() => expect(result.current.total).toBe(2));
    expect(result.current.qtdAdb).toBe(0);
  });

  it('useColaborador: id que não existe na lista devolve null', async () => {
    const fetchMock = installFetch();
    routeFetch(fetchMock, { '/colaborador': [colaboradorApi({ id: 1 })] });

    const { result } = renderHook(() => useColaborador(99));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
  });
});

describe('renderização sem navegador (SSR)', () => {
  it('useCenarioVoluntarios começa vazio sem window', () => {
    vi.stubGlobal('window', undefined);
    function Teste() {
      const { totalEstados } = useCenarioVoluntarios();
      return <p>{totalEstados}</p>;
    }

    expect(renderToString(<Teste />)).toContain('0');
  });

  it('useVoiceSearch informa que não há suporte sem window', () => {
    vi.stubGlobal('window', undefined);
    function Teste() {
      const { isSupported } = useVoiceSearch(() => {});
      return <p>{String(isSupported)}</p>;
    }

    expect(renderToString(<Teste />)).toContain('false');
  });

  it('lerCorDoTema devolve a cor de reserva sem document', () => {
    vi.stubGlobal('document', undefined);

    expect(lerCorDoTema('vuln-5')).toBe('#8b0000');
    expect(lerCorDoTema('inexistente')).toBe('#cccccc');
  });

  it('useEscalaVulnerabilidade monta a escala com as cores de reserva sem document', () => {
    vi.stubGlobal('document', undefined);
    function Teste() {
      const { degraus } = useEscalaVulnerabilidade();
      return <p>{degraus.map((d) => d.cor).join(',')}</p>;
    }

    expect(renderToString(<Teste />)).toContain('#8b0000');
  });
});
