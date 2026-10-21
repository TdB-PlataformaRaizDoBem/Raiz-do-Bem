import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegionInsightPanel } from '../../components/vulnerabilityMap/RegionInsightPanel';
import { toColecaoViewModel } from '../../domain/mappers/VulnerabilidadeMapper';
import { useEscalaVulnerabilidade } from '../../hooks/useEscalaVulnerabilidade';
import { feature, propsUF } from '../../test/vulnerabilidadeFixtures';

const escala = renderHook(() => useEscalaVulnerabilidade()).result.current;

const regiaoDe = (features: ReturnType<typeof feature>[], codigo = '21') =>
  toColecaoViewModel({ type: 'FeatureCollection', features }).regioes.find((r) => r.codigoIbge === codigo)!;

describe('RegionInsightPanel', () => {
  it('mostra a renda com a fonte e o ano, e a população com a fonte', () => {
    const regiao = regiaoDe([
      feature(
        propsUF({
          codigo_ibge: '21',
          nome: 'Maranhão',
          populacao: 6_776_699,
          indicadores: {
            renda_media: 872,
            renda_media_fonte: 'ibge:pnad-continua-2024-rendimento-domiciliar-per-capita',
            renda_media_ano: 2024,
            populacao_fonte: 'ibge:sidra/4709-v93',
            populacao_periodo: '2022',
          },
        }),
      ),
    ]);

    const { container } = render(<RegionInsightPanel regiao={regiao} escala={escala} onFechar={vi.fn()} />);
    const texto = container.textContent ?? '';

    expect(texto).toMatch(/R\$\s*872/);
    expect(texto).toContain('PNAD Contínua 2024');
    expect(texto).toContain('fonte ibge:pnad-continua-2024-rendimento-domiciliar-per-capita (2024)');
    expect(texto).toContain('6.776.699');
    expect(texto).toContain('Censo oficial, 2022');
  });

  it('sem população oficial, mostra "indisponível" — nunca zero', () => {
    const regiao = regiaoDe([
      feature(propsUF({ codigo_ibge: '21', populacao: undefined, indicadores: { populacao: undefined, populacao_fonte: undefined } })),
    ]);

    render(<RegionInsightPanel regiao={regiao} escala={escala} onFechar={vi.fn()} />);

    expect(screen.getByText('indisponível')).toBeInTheDocument();
    expect(screen.getByText(/IBGE indisponível nesta consulta/)).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('mostra a posição no ranking de renda entre as UFs da coleção', () => {
    const regiao = regiaoDe([
      feature(propsUF({ codigo_ibge: '21', indicadores: { renda_media: 900 } })),
      feature(propsUF({ codigo_ibge: '35', indicadores: { renda_media: 2600 } })),
      feature(propsUF({ codigo_ibge: '12', indicadores: { renda_media: 1500 } })),
    ]);

    const { container } = render(<RegionInsightPanel regiao={regiao} escala={escala} onFechar={vi.fn()} />);

    expect(container.textContent).toContain('1º de 3');
    expect(screen.getByText('(1º = menor renda)')).toBeInTheDocument();
  });

  it('UF sem renda válida não mostra posição no ranking', () => {
    const regiao = regiaoDe([feature(propsUF({ codigo_ibge: '21', indicadores: { renda_media: -1 } }))]);

    render(<RegionInsightPanel regiao={regiao} escala={escala} onFechar={vi.fn()} />);

    expect(screen.getByText('Sem renda válida para calcular a posição no ranking.')).toBeInTheDocument();
  });

  it('nunca mostra score, simulação ou demanda', () => {
    const regiao = regiaoDe([feature(propsUF({ codigo_ibge: '21' }))]);

    render(<RegionInsightPanel regiao={regiao} escala={escala} onFechar={vi.fn()} />);

    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/simula/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/demanda/i)).not.toBeInTheDocument();
  });

  it('fechar aciona o callback', async () => {
    const onFechar = vi.fn();
    const regiao = regiaoDe([feature(propsUF({ codigo_ibge: '21' }))]);
    render(<RegionInsightPanel regiao={regiao} escala={escala} onFechar={onFechar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar detalhe e voltar ao resumo' }));

    expect(onFechar).toHaveBeenCalled();
  });

  it('declara a procedência de geometria e indicadores no rodapé', () => {
    const regiao = regiaoDe([
      feature(propsUF({ codigo_ibge: '21', fonte_geometria: 'mock:sintetico', fonte_indicadores: 'ibge:pnad-continua-2024' })),
    ]);

    render(<RegionInsightPanel regiao={regiao} escala={escala} onFechar={vi.fn()} />);

    expect(screen.getByText(/Contornos: mock:sintetico/)).toBeInTheDocument();
    expect(screen.getByText(/Indicadores: ibge:pnad-continua-2024/)).toBeInTheDocument();
  });
});
