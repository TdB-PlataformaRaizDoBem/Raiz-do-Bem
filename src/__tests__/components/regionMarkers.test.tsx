import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import L from 'leaflet';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegionMarkers } from '../../components/vulnerabilityMap/RegionMarkers';
import type { Geometry } from '../../domain/entities/VulnerabilidadeGeoAPI';
import { toRegiaoViewModel, type RegiaoViewModel } from '../../domain/mappers/VulnerabilidadeMapper';
import { useEscalaVulnerabilidade } from '../../hooks/useEscalaVulnerabilidade';
import { feature, propsUF } from '../../test/vulnerabilidadeFixtures';

/** Mapa e Marker falsos: a lógica sob teste é a de posicionamento e supressão, não a do Leaflet. */
const { mapa, eventoLeaflet, ultimosIcones } = vi.hoisted(() => ({
  mapa: {
    getBounds: vi.fn(),
    getZoom: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    latLngToLayerPoint: vi.fn(),
  },
  eventoLeaflet: { preventDefault: vi.fn(), stopPropagation: vi.fn() },
  ultimosIcones: [] as unknown[],
}));

vi.mock('react-leaflet', () => ({
  useMap: () => mapa,
  Marker: ({
    position,
    icon,
    zIndexOffset,
    eventHandlers,
  }: {
    position: [number, number];
    icon: L.DivIcon;
    zIndexOffset: number;
    eventHandlers: { click: (e: unknown) => void };
  }) => {
    ultimosIcones.push(icon);
    return (
      <button
        data-testid="marcador"
        data-lat={position[0]}
        data-lng={position[1]}
        data-z={zIndexOffset}
        data-html={icon.options.html as string}
        onClick={() => eventHandlers.click(eventoLeaflet)}
      />
    );
  },
}));

const escala = renderHook(() => useEscalaVulnerabilidade()).result.current;

/** Brasil inteiro; 10 px de tela por grau, então a distância mínima de 58 px = 5,8°. */
const BRASIL = () => L.latLngBounds([-34, -74], [6, -34]);

let contador = 0;
/** Região com código único (o cache de ícones é global ao módulo). */
function regiao(o: {
  nome?: string;
  prioridade: number;
  centroide: [number, number] | null;
  ufSigla?: string | null;
  simulado?: boolean;
}): RegiaoViewModel {
  contador += 1;
  const base = toRegiaoViewModel(
    feature(
      propsUF({
        codigo_ibge: `9${contador}`,
        nome: o.nome ?? `Região ${contador}`,
        indice_prioridade: o.prioridade,
        simulacao: { ...propsUF().simulacao!, simulado: o.simulado ?? false },
      }),
    ),
  );
  return { ...base, centroide: o.centroide, ufSigla: o.ufSigla === undefined ? 'MA' : o.ufSigla };
}

const poligono = (lon0: number, lat0: number, lon1: number, lat1: number): Geometry => ({
  type: 'Polygon',
  coordinates: [[[lon0, lat0], [lon1, lat0], [lon1, lat1], [lon0, lat1]]],
});

const marcadores = () => screen.getAllByTestId('marcador');
const posicoes = () => screen.queryAllByTestId('marcador').map((m) => [Number(m.dataset.lat), Number(m.dataset.lng)]);

function renderMarcadores(
  regioes: RegiaoViewModel[],
  o: Partial<React.ComponentProps<typeof RegionMarkers>> = {},
) {
  const props = {
    regioes,
    geometriaPorCodigo: new Map<string, Geometry | null>(),
    escala,
    limite: 27,
    codigoSelecionado: null,
    onSelecionar: vi.fn(),
    ...o,
  };
  const resultado = render(<RegionMarkers {...props} />);
  return { ...props, ...resultado };
}

beforeEach(() => {
  ultimosIcones.length = 0;
  mapa.getBounds.mockReset().mockImplementation(BRASIL);
  mapa.getZoom.mockReset().mockReturnValue(4);
  mapa.on.mockReset();
  mapa.off.mockReset();
  mapa.latLngToLayerPoint.mockReset().mockImplementation((ll: L.LatLng) => L.point(ll.lng * 10, ll.lat * 10));
  eventoLeaflet.preventDefault.mockReset();
  eventoLeaflet.stopPropagation.mockReset();
});

describe('RegionMarkers — âncora do rótulo', () => {
  it('prefere o polo de inacessibilidade do contorno oficial', () => {
    const r = regiao({ prioridade: 0.5, centroide: [-10, -60] });

    renderMarcadores([r], { geometriaPorCodigo: new Map([[r.codigoIbge, poligono(-46, -6, -44, -4)]]) });

    expect(posicoes()).toEqual([[-5, -45]]);
  });

  it('sem contorno usa o centroide da API', () => {
    const r = regiao({ prioridade: 0.5, centroide: [-10, -60] });

    renderMarcadores([r]);

    expect(posicoes()).toEqual([[-10, -60]]);
  });

  it('sem contorno nem centroide cai no centroide estático da UF', () => {
    renderMarcadores([regiao({ prioridade: 0.5, centroide: null, ufSigla: 'RS' })]);

    expect(posicoes()).toEqual([[-29.7, -53.2]]);
  });

  it('sem nenhuma âncora (nem UF) a região não ganha rótulo', () => {
    renderMarcadores([regiao({ prioridade: 0.5, centroide: null, ufSigla: null })]);

    expect(screen.queryAllByTestId('marcador')).toHaveLength(0);
  });

  it('contorno presente mas sem rótulo calculável (geometria nula) cai para o centroide', () => {
    const r = regiao({ prioridade: 0.5, centroide: [-12, -50] });

    renderMarcadores([r], { geometriaPorCodigo: new Map([[r.codigoIbge, null]]) });

    expect(posicoes()).toEqual([[-12, -50]]);
  });
});

describe('RegionMarkers — quais rótulos aparecem', () => {
  it('ignora quem está fora da área visível', () => {
    renderMarcadores([
      regiao({ prioridade: 0.9, centroide: [-10, -50] }),
      regiao({ prioridade: 0.8, centroide: [40, 10] }), // Europa
    ]);

    expect(posicoes()).toEqual([[-10, -50]]);
  });

  it('a área visível tem 10% de folga além da tela', () => {
    // Borda leste da tela = -34; com 10% de folga (4° em 40° de largura) vai até -30.
    renderMarcadores([regiao({ prioridade: 0.9, centroide: [-10, -31] })]);

    expect(marcadores()).toHaveLength(1);
  });

  it('mais urgente primeiro: ordena por prioridade', () => {
    renderMarcadores([
      regiao({ prioridade: 0.2, centroide: [-30, -50] }),
      regiao({ prioridade: 0.9, centroide: [-10, -70] }),
      regiao({ prioridade: 0.5, centroide: [-20, -40] }),
    ]);

    expect(posicoes()).toEqual([[-10, -70], [-20, -40], [-30, -50]]);
  });

  it('respeita o limite de rótulos', () => {
    renderMarcadores(
      [
        regiao({ prioridade: 0.9, centroide: [-10, -70] }),
        regiao({ prioridade: 0.8, centroide: [-20, -40] }),
        regiao({ prioridade: 0.7, centroide: [-30, -50] }),
      ],
      { limite: 2 },
    );

    expect(marcadores()).toHaveLength(2);
  });

  it('suprime o menos crítico quando dois rótulos ficam a menos de 58 px', () => {
    renderMarcadores([
      regiao({ nome: 'Crítica', prioridade: 0.9, centroide: [-5, -45] }),
      regiao({ nome: 'Vizinha', prioridade: 0.5, centroide: [-5.2, -45.3] }), // ~3,6 px
      regiao({ nome: 'Distante', prioridade: 0.4, centroide: [-25, -60] }),
    ]);

    expect(marcadores().map((m) => m.dataset.html)).toEqual([
      expect.stringContaining('90%'),
      expect.stringContaining('40%'),
    ]);
    expect(marcadores()).toHaveLength(2);
  });

  it('a região selecionada nunca é suprimida e fica por cima', () => {
    const critica = regiao({ prioridade: 0.9, centroide: [-5, -45] });
    const selecionada = regiao({ prioridade: 0.5, centroide: [-5.2, -45.3] });

    renderMarcadores([critica, selecionada], { codigoSelecionado: selecionada.codigoIbge });

    expect(marcadores()).toHaveLength(2);
    expect(marcadores().map((m) => m.dataset.z)).toEqual(['0', '1000']);
  });
});

describe('RegionMarkers — aparência do rótulo', () => {
  const html = (r: RegiaoViewModel, o: Partial<React.ComponentProps<typeof RegionMarkers>> = {}) => {
    renderMarcadores([r], o);
    return marcadores()[0].dataset.html!;
  };

  it('mostra a sigla da UF e a prioridade em percentual', () => {
    const conteudo = html(regiao({ prioridade: 0.624, centroide: [-10, -50], ufSigla: 'MA' }));

    expect(conteudo).toContain('mapa-badge__nome">MA<');
    expect(conteudo).toContain('mapa-badge__valor">62%<');
  });

  it('sem sigla usa o nome, escapando HTML (o nome vem da API)', () => {
    const conteudo = html(
      regiao({ nome: `<img src=x onerror="a">&'`, prioridade: 0.5, centroide: [-10, -50], ufSigla: null }),
    );

    expect(conteudo).toContain('&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;');
    expect(conteudo).not.toContain('<img');
  });

  it('marca o rótulo da região selecionada', () => {
    const r = regiao({ prioridade: 0.5, centroide: [-10, -50] });

    expect(html(r, { codigoSelecionado: r.codigoIbge })).toContain('mapa-badge mapa-badge--ativo');
  });

  it('rótulo comum não tem a classe de ativo', () => {
    expect(html(regiao({ prioridade: 0.5, centroide: [-10, -50] }))).not.toContain('mapa-badge--ativo');
  });

  it('um ponto marca o estado com cenário simulado', () => {
    expect(html(regiao({ prioridade: 0.5, centroide: [-10, -50], simulado: true }))).toContain('mapa-badge__marca');
  });

  it('estado sem cenário não tem o ponto', () => {
    expect(html(regiao({ prioridade: 0.5, centroide: [-11, -51], simulado: false }))).not.toContain('mapa-badge__marca');
  });

  it('usa a cor da escala para o índice da região', () => {
    const r = regiao({ prioridade: 0.9, centroide: [-10, -50] });

    expect(html(r)).toContain(`--badge-cor: ${escala.corPorScore(0.9)}`);
  });

  it('reaproveita o ícone enquanto nada que o afeta mudar (cache)', () => {
    const r = regiao({ prioridade: 0.5, centroide: [-10, -50] });
    const { rerender, ...props } = renderMarcadores([r]);

    rerender(<RegionMarkers {...props} onSelecionar={vi.fn()} />);

    expect(ultimosIcones.length).toBeGreaterThanOrEqual(2);
    expect(new Set(ultimosIcones).size).toBe(1);
  });

  it('gera outro ícone quando a seleção muda', () => {
    const r = regiao({ prioridade: 0.5, centroide: [-10, -50] });
    const { rerender, ...props } = renderMarcadores([r]);

    rerender(<RegionMarkers {...props} codigoSelecionado={r.codigoIbge} />);

    expect(new Set(ultimosIcones).size).toBe(2);
  });
});

describe('RegionMarkers — interação e viewport', () => {
  it('clicar no rótulo seleciona a região e não deixa o clique chegar ao mapa', async () => {
    const r = regiao({ prioridade: 0.5, centroide: [-10, -50] });
    const { onSelecionar } = renderMarcadores([r]);

    await userEvent.click(marcadores()[0]);

    expect(onSelecionar).toHaveBeenCalledWith(r);
    expect(eventoLeaflet.preventDefault).toHaveBeenCalled();
    expect(eventoLeaflet.stopPropagation).toHaveBeenCalled();
  });

  it('só reavalia os rótulos ao FIM do gesto (moveend e zoomend)', () => {
    renderMarcadores([regiao({ prioridade: 0.5, centroide: [-10, -50] })]);

    expect(mapa.on.mock.calls.map(([evento]) => evento).sort()).toEqual(['moveend', 'zoomend']);
  });

  it('quando o mapa se move, passa a mostrar o que entrou na tela', () => {
    const fora = regiao({ prioridade: 0.5, centroide: [40, 10] });
    renderMarcadores([fora]);
    expect(screen.queryAllByTestId('marcador')).toHaveLength(0);

    mapa.getBounds.mockImplementation(() => L.latLngBounds([30, 0], [50, 20]));
    act(() => mapa.on.mock.calls.find(([evento]) => evento === 'moveend')![1]());

    expect(posicoes()).toEqual([[40, 10]]);
  });

  it('o zoomend também atualiza o viewport', () => {
    const fora = regiao({ prioridade: 0.5, centroide: [40, 10] });
    renderMarcadores([fora]);

    mapa.getBounds.mockImplementation(() => L.latLngBounds([30, 0], [50, 20]));
    act(() => mapa.on.mock.calls.find(([evento]) => evento === 'zoomend')![1]());

    expect(marcadores()).toHaveLength(1);
  });

  it('ao desmontar, para de escutar o mapa (mesmos handlers)', () => {
    const { unmount } = renderMarcadores([regiao({ prioridade: 0.5, centroide: [-10, -50] })]);
    const registrados = mapa.on.mock.calls.map(([evento, fn]) => [evento, fn]);

    unmount();

    expect(mapa.off.mock.calls.map(([evento, fn]) => [evento, fn])).toEqual(registrados);
  });
});
