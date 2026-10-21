import { render, renderHook } from '@testing-library/react';
import type { Feature, GeoJsonObject } from 'geojson';
import L from 'leaflet';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AjustarVisao,
  ChoroplethLayer,
  ObservarTamanho,
  VoarPara,
  type AlvoVoo,
} from '../../components/vulnerabilityMap/ChoroplethLayer';
import type {
  IndicadoresOficiaisAPI,
} from '../../domain/entities/VulnerabilidadeGeoAPI';
import type { VulnerabilidadePropertiesComAtencao } from '../../domain/mappers/VulnerabilidadeMapper';
import { useEscalaVulnerabilidade } from '../../hooks/useEscalaVulnerabilidade';
import { propsUF } from '../../test/vulnerabilidadeFixtures';

type SobrescreverFeicao = Partial<Omit<VulnerabilidadePropertiesComAtencao, 'indicadores'>> & {
  indicadores?: Partial<IndicadoresOficiaisAPI> | null;
};

const { mapa, geojson, montagens } = vi.hoisted(() => ({
  mapa: {
    fitBounds: vi.fn(),
    flyToBounds: vi.fn(),
    setView: vi.fn(),
    flyTo: vi.fn(),
    getContainer: vi.fn(),
    invalidateSize: vi.fn(),
  },
  geojson: { props: null as null | Record<string, unknown> },
  montagens: { total: 0 },
}));

vi.mock('react-leaflet', () => ({
  useMap: () => mapa,
  GeoJSON: function GeoJSONFalso(props: Record<string, unknown>) {
    geojson.props = props;
    useEffect(() => {
      montagens.total += 1;
    }, []);
    return <div data-testid="geojson" />;
  },
}));

const escala = renderHook(() => useEscalaVulnerabilidade()).result.current;

// ---------------------------------------------------------------------------
// Câmera
// ---------------------------------------------------------------------------

const BBOX: [number, number, number, number] = [-74, -34, -34, 6]; // [lonMin, latMin, lonMax, latMax]

/** Simula "prefers-reduced-motion". */
const reduzirMovimento = (reduzir: boolean) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) => ({ matches: reduzir, media: query }) as MediaQueryList,
  );

beforeEach(() => {
  Object.values(mapa).forEach((fn) => fn.mockReset());
  geojson.props = null;
  montagens.total = 0;
});

afterEach(() => vi.restoreAllMocks());

describe('AjustarVisao', () => {
  it('sem bbox não mexe na câmera', () => {
    render(<AjustarVisao bbox={null} chave="brasil" />);

    expect(mapa.fitBounds).not.toHaveBeenCalled();
    expect(mapa.flyToBounds).not.toHaveBeenCalled();
  });

  it('na primeira vez enquadra direto, convertendo [lon, lat] do GeoJSON em [lat, lon] do Leaflet', () => {
    render(<AjustarVisao bbox={BBOX} chave="brasil" />);

    expect(mapa.fitBounds).toHaveBeenCalledTimes(1);
    const [bounds, opcoes] = mapa.fitBounds.mock.calls[0];
    expect((bounds as L.LatLngBounds).getSouthWest()).toMatchObject({ lat: -34, lng: -74 });
    expect((bounds as L.LatLngBounds).getNorthEast()).toMatchObject({ lat: 6, lng: -34 });
    expect(opcoes).toEqual({ padding: [32, 32] });
    expect(mapa.flyToBounds).not.toHaveBeenCalled();
  });

  it('a mesma chave não reenquadra', () => {
    const { rerender } = render(<AjustarVisao bbox={BBOX} chave="brasil" />);

    rerender(<AjustarVisao bbox={[...BBOX]} chave="brasil" />);

    expect(mapa.fitBounds).toHaveBeenCalledTimes(1);
  });

  it('uma chave nova voa até o novo recorte, com animação', () => {
    const { rerender } = render(<AjustarVisao bbox={BBOX} chave="brasil" />);

    rerender(<AjustarVisao bbox={[-50, -10, -40, 0]} chave="outro" />);

    expect(mapa.flyToBounds).toHaveBeenCalledTimes(1);
    expect(mapa.flyToBounds.mock.calls[0][1]).toEqual({ padding: [32, 32], duration: 0.9, easeLinearity: 0.25 });
  });

  it('quem pediu menos movimento recebe o enquadramento sem animação', () => {
    reduzirMovimento(true);
    const { rerender } = render(<AjustarVisao bbox={BBOX} chave="brasil" />);

    rerender(<AjustarVisao bbox={[-50, -10, -40, 0]} chave="outro" />);

    expect(mapa.fitBounds).toHaveBeenCalledTimes(2);
    expect(mapa.flyToBounds).not.toHaveBeenCalled();
  });

  it('navegador sem matchMedia: trata como "pode animar"', () => {
    const original = window.matchMedia;
    Object.assign(window, { matchMedia: undefined });
    try {
      const { rerender } = render(<AjustarVisao bbox={BBOX} chave="brasil" />);
      rerender(<AjustarVisao bbox={[-50, -10, -40, 0]} chave="outro" />);

      expect(mapa.flyToBounds).toHaveBeenCalledTimes(1);
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('ObservarTamanho', () => {
  class ObservadorFalso {
    static instancias: ObservadorFalso[] = [];
    observe = vi.fn();
    disconnect = vi.fn();
    aoMudar: () => void;
    constructor(aoMudar: () => void) {
      this.aoMudar = aoMudar;
      ObservadorFalso.instancias.push(this);
    }
  }

  beforeEach(() => {
    ObservadorFalso.instancias = [];
    vi.stubGlobal('ResizeObserver', ObservadorFalso);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('observa o contêiner do mapa e revalida o tamanho quando ele muda, sem mover a câmera', () => {
    const container = document.createElement('div');
    mapa.getContainer.mockReturnValue(container);
    render(<ObservarTamanho />);

    const [observador] = ObservadorFalso.instancias;
    expect(observador.observe).toHaveBeenCalledWith(container);

    observador.aoMudar();

    expect(mapa.invalidateSize).toHaveBeenCalledWith({ pan: false });
  });

  it('para de observar ao desmontar', () => {
    mapa.getContainer.mockReturnValue(document.createElement('div'));
    const { unmount } = render(<ObservarTamanho />);

    unmount();

    expect(ObservadorFalso.instancias[0].disconnect).toHaveBeenCalled();
  });
});

describe('VoarPara', () => {
  const ALVO: AlvoVoo = { posicao: [-5, -45], zoom: 6, chave: 'a' };

  it('sem alvo não faz nada', () => {
    render(<VoarPara alvo={null} />);

    expect(mapa.flyTo).not.toHaveBeenCalled();
  });

  it('voa até o alvo, uma vez por chave', () => {
    const { rerender } = render(<VoarPara alvo={ALVO} />);
    rerender(<VoarPara alvo={{ ...ALVO }} />);

    expect(mapa.flyTo).toHaveBeenCalledTimes(1);
    expect(mapa.flyTo).toHaveBeenCalledWith([-5, -45], 6, { duration: 1, easeLinearity: 0.25 });
  });

  it('chave nova, novo voo', () => {
    const { rerender } = render(<VoarPara alvo={ALVO} />);

    rerender(<VoarPara alvo={{ ...ALVO, chave: 'b', posicao: [-20, -50] }} />);

    expect(mapa.flyTo).toHaveBeenCalledTimes(2);
  });

  it('com movimento reduzido, salta direto para o alvo', () => {
    reduzirMovimento(true);

    render(<VoarPara alvo={ALVO} />);

    expect(mapa.setView).toHaveBeenCalledWith([-5, -45], 6);
    expect(mapa.flyTo).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Camada coroplética
// ---------------------------------------------------------------------------

const GEOJSON = { type: 'FeatureCollection', features: [] } as GeoJsonObject;

const feicao = (props: SobrescreverFeicao = {}): Feature => {
  const { faixa_atencao = 'alta', indice_atencao = 0.62, ...resto } = props;
  return {
    type: 'Feature',
    geometry: null,
    properties: { ...propsUF(resto), faixa_atencao, indice_atencao },
  } as unknown as Feature;
};

type Estilo = (f?: Feature) => L.PathOptions;
type PorFeicao = (f: Feature, layer: L.Layer) => void;

function renderCamada(o: Partial<React.ComponentProps<typeof ChoroplethLayer>> = {}) {
  const props = {
    geojson: GEOJSON,
    chave: 'api-27',
    degrauPorFaixa: escala.degrauPorFaixa,
    corNeutra: '#eeeeee',
    faixaDestacada: null,
    codigoSelecionado: null,
    onSelecionar: vi.fn(),
    onAprofundar: vi.fn(),
    permiteAprofundar: false,
    ...o,
  };
  const resultado = render(<ChoroplethLayer {...props} />);
  return {
    ...props,
    ...resultado,
    estilo: geojson.props!.style as Estilo,
    aoCriar: geojson.props!.onEachFeature as PorFeicao,
  };
}

/** Camada Leaflet falsa que registra o que o componente liga a ela. */
function camadaFalsa() {
  const handlers: Record<string, (e?: unknown) => void> = {};
  const camada = {
    bindTooltip: vi.fn(),
    bindPopup: vi.fn(),
    on: vi.fn((h: typeof handlers) => Object.assign(handlers, h)),
    setStyle: vi.fn(),
    bringToFront: vi.fn(),
  };
  return { camada, handlers };
}

const elementoDe = (mock: ReturnType<typeof vi.fn>) => mock.mock.calls[0][0] as HTMLElement;
const evento = (extra: object = {}) => ({ preventDefault: vi.fn(), stopPropagation: vi.fn(), ...extra });

describe('ChoroplethLayer — a camada', () => {
  it('entrega o GeoJSON ao Leaflet exatamente como veio, sem bolhas de evento', () => {
    renderCamada();

    expect(geojson.props).toMatchObject({ data: GEOJSON, interactive: true, bubblingMouseEvents: false });
  });

  it('recria a camada quando a chave muda (nova malha), e não quando só o resto muda', () => {
    const { rerender, ...props } = renderCamada();
    expect(montagens.total).toBe(1);

    rerender(<ChoroplethLayer {...props} codigoSelecionado="21" />);
    expect(montagens.total).toBe(1);

    rerender(<ChoroplethLayer {...props} chave="ibge-27" />);
    expect(montagens.total).toBe(2);
  });
});

describe('ChoroplethLayer — estilo', () => {
  it.each([
    ['feição ausente', undefined],
    ['sem propriedades', { type: 'Feature', geometry: null, properties: null } as unknown as Feature],
    ['sem código IBGE', { type: 'Feature', geometry: null, properties: { nome: 'x' } } as unknown as Feature],
    ['código que não é texto', { type: 'Feature', geometry: null, properties: { codigo_ibge: 21 } } as unknown as Feature],
  ])('%s: pinta com a cor neutra', (_nome, f) => {
    const { estilo } = renderCamada();

    expect(estilo(f)).toEqual({ fillColor: '#eeeeee', fillOpacity: 0.3, color: '#ffffff', weight: 1 });
  });

  it('feição normal: cor da faixa, semitransparente, linha branca fina e juntas arredondadas', () => {
    const { estilo } = renderCamada();

    expect(estilo(feicao({ faixa_atencao: 'alta' }))).toEqual({
      fillColor: escala.degrauPorFaixa('alta').cor,
      fillOpacity: 0.55,
      color: '#ffffff',
      weight: 1.5,
      opacity: 1,
      lineJoin: 'round',
      lineCap: 'round',
      bubblingMouseEvents: false,
    });
  });

  it('UF sem renda válida (faixa_atencao null) é desenhada em cinza, nunca na cor do pior quintil', () => {
    const { estilo } = renderCamada();

    expect(estilo(feicao({ codigo_ibge: '21', faixa_atencao: null }))).toEqual({
      fillColor: '#eeeeee',
      fillOpacity: 0.3,
      color: '#ffffff',
      weight: 1,
    });
  });

  it('a região selecionada ganha contorno escuro e mais grosso', () => {
    const { estilo } = renderCamada({ codigoSelecionado: '21' });

    expect(estilo(feicao({ codigo_ibge: '21' }))).toMatchObject({ color: '#1c2634', weight: 2.5 });
    expect(estilo(feicao({ codigo_ibge: '35' }))).toMatchObject({ color: '#ffffff', weight: 1.5 });
  });

  it('com uma faixa destacada, as outras esmaecem', () => {
    const { estilo } = renderCamada({ faixaDestacada: 'alta' });

    expect(estilo(feicao({ faixa_atencao: 'baixa' }))).toMatchObject({ fillOpacity: 0.12, opacity: 0.25 });
    expect(estilo(feicao({ faixa_atencao: 'alta' }))).toMatchObject({ fillOpacity: 0.55, opacity: 1 });
  });
});

describe('ChoroplethLayer — tooltip', () => {
  const montar = (props: SobrescreverFeicao = {}, permiteAprofundar = false) => {
    const { aoCriar } = renderCamada({ permiteAprofundar });
    const { camada } = camadaFalsa();
    aoCriar(feicao(props), camada as unknown as L.Layer);
    return { camada, tooltip: elementoDe(camada.bindTooltip) };
  };

  it('mostra nome, renda com a faixa e moradores — nunca score nem demanda', () => {
    const { tooltip } = montar({
      nome_qualificado: 'Maranhão (MA)',
      populacao: 6_776_699,
      indicadores: { renda_media: 872 },
      faixa_atencao: 'alta',
    });

    expect(tooltip.textContent).toContain('Maranhão (MA)');
    expect(tooltip.textContent).toMatch(/Renda per capita R\$\s*872.*Atenção alta/);
    expect(tooltip.textContent).toContain('6,8 mi moradores');
    expect(tooltip.textContent).toContain('IBGE 21 · cor por ranking relativo de renda — menor renda, maior atenção');
  });

  it('sem nome qualificado usa o nome', () => {
    const { tooltip } = montar({ nome_qualificado: undefined, nome: 'Maranhão' });

    expect(tooltip.querySelector('strong')?.textContent).toBe('Maranhão');
  });

  it('sem população oficial avisa que está indisponível, em vez de mostrar zero', () => {
    const { tooltip } = montar({ populacao: undefined });

    expect(tooltip.textContent).toContain('População indisponível nesta consulta');
    expect(tooltip.textContent).not.toContain('0 moradores');
  });

  it('sem renda oficial (indicadores ausentes) avisa em vez de inventar um valor', () => {
    const { tooltip } = montar({ indicadores: null, faixa_atencao: null });

    expect(tooltip.textContent).toContain('Sem renda oficial disponível');
  });

  it('a dica muda conforme o clique navega ou abre o detalhe', () => {
    expect(montar({}, true).tooltip.textContent).toContain('Clique para abrir esta região');
    expect(montar({}, false).tooltip.textContent).toContain('Clique para ver o detalhe completo ao lado');
  });

  it('nome vindo da API é texto, nunca HTML (sem injeção)', () => {
    const { tooltip } = montar({ nome_qualificado: '<img src=x onerror=alert(1)>' });

    expect(tooltip.querySelector('img')).toBeNull();
    expect(tooltip.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('é fixo ao cursor, acima da feição', () => {
    const { camada } = montar();

    expect(camada.bindTooltip.mock.calls[0][1]).toMatchObject({ sticky: true, direction: 'top', opacity: 1 });
  });

  it('feição sem código IBGE não recebe nada', () => {
    const { aoCriar } = renderCamada();
    const { camada } = camadaFalsa();

    aoCriar({ type: 'Feature', geometry: null, properties: { nome: 'x' } } as unknown as Feature, camada as unknown as L.Layer);

    expect(camada.bindTooltip).not.toHaveBeenCalled();
    expect(camada.on).not.toHaveBeenCalled();
  });
});

describe('ChoroplethLayer — popup', () => {
  const montar = (props: SobrescreverFeicao = {}, permiteAprofundar = false) => {
    const { aoCriar } = renderCamada({ permiteAprofundar });
    const { camada } = camadaFalsa();
    aoCriar(feicao(props), camada as unknown as L.Layer);
    return camada;
  };

  it('no último nível o clique abre um popup com renda, fonte, ano e população', () => {
    const camada = montar({
      nome_qualificado: 'Maranhão (MA)',
      populacao: 6_776_699,
      indicadores: { renda_media: 872, renda_media_ano: 2024 },
      faixa_atencao: 'alta',
    });

    const popup = elementoDe(camada.bindPopup);
    expect(popup.textContent).toContain('Maranhão (MA)');
    expect(popup.textContent).toContain('Código IBGE 21');
    expect(popup.textContent).toMatch(/R\$\s*872/);
    expect(popup.textContent).toContain('Atenção alta');
    expect(popup.textContent).toContain('ibge:pnad-continua-2024-rendimento-domiciliar-per-capita (2024)');
    expect(popup.textContent).toContain('6,8 mi moradores');
    expect(camada.bindPopup.mock.calls[0][1]).toMatchObject({ closeButton: true, maxWidth: 280, autoPan: true });
  });

  it('sem nome qualificado usa o nome, e sem população oficial avisa em vez de mostrar zero', () => {
    const camada = montar({ nome_qualificado: undefined, nome: 'Maranhão', populacao: undefined });

    const popup = elementoDe(camada.bindPopup);
    expect(popup.querySelector('strong')?.textContent).toBe('Maranhão');
    expect(popup.textContent).toContain('População indisponível nesta consulta');
  });

  it('quando o clique navega para o nível de baixo não há popup (disputaria o gesto)', () => {
    expect(montar({}, true).bindPopup).not.toHaveBeenCalled();
  });
});

describe('ChoroplethLayer — interação', () => {
  const ligar = (o: Partial<React.ComponentProps<typeof ChoroplethLayer>> = {}, props: SobrescreverFeicao = {}) => {
    const resultado = renderCamada(o);
    const f = feicao(props);
    const { camada, handlers } = camadaFalsa();
    resultado.aoCriar(f, camada as unknown as L.Layer);
    return { ...resultado, camada, handlers, f };
  };

  it('passar o mouse destaca o contorno e traz a feição para a frente', () => {
    const { camada, handlers } = ligar();

    handlers.mouseover();

    expect(camada.setStyle).toHaveBeenCalledWith({ fillOpacity: 0.8, weight: 2.5, color: '#1c2634' });
    expect(camada.bringToFront).toHaveBeenCalled();
  });

  it('tirar o mouse volta ao estilo calculado (e não a um fixo)', () => {
    const { camada, handlers } = ligar({ codigoSelecionado: '21', faixaDestacada: 'baixa' }, { codigo_ibge: '21', faixa_atencao: 'alta' });

    handlers.mouseout();

    expect(camada.setStyle).toHaveBeenCalledWith(
      expect.objectContaining({ color: '#1c2634', weight: 2.5, fillOpacity: 0.12 }),
    );
  });

  it('clicar seleciona; no último nível não aprofunda', () => {
    const { handlers, onSelecionar, onAprofundar, f } = ligar({ permiteAprofundar: false });
    const e = evento();

    handlers.click(e);

    expect(onSelecionar).toHaveBeenCalledWith(f.properties);
    expect(onAprofundar).not.toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalled();
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it('clicar também aprofunda quando existe um nível abaixo', () => {
    const { handlers, onSelecionar, onAprofundar, f } = ligar({ permiteAprofundar: true });

    handlers.click(evento());

    expect(onSelecionar).toHaveBeenCalledWith(f.properties);
    expect(onAprofundar).toHaveBeenCalledWith(f.properties);
  });

  it.each([['Enter'], [' ']])('a tecla "%s" aciona a feição (acessibilidade por teclado)', (tecla) => {
    const { handlers, onSelecionar } = ligar();
    const e = evento({ originalEvent: { key: tecla } });

    handlers.keydown(e);

    expect(onSelecionar).toHaveBeenCalledTimes(1);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('outras teclas, ou evento sem teclado, não fazem nada', () => {
    const { handlers, onSelecionar } = ligar();

    handlers.keydown(evento({ originalEvent: { key: 'a' } }));
    handlers.keydown(evento({ originalEvent: undefined }));

    expect(onSelecionar).not.toHaveBeenCalled();
  });
});
