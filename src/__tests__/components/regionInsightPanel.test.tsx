import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegionInsightPanel } from '../../components/vulnerabilityMap/RegionInsightPanel';
import type { AnaliseUnidadeAPI, SimulacaoAPI } from '../../domain/entities/VulnerabilidadeGeoAPI';
import { toColecaoViewModel, toRegiaoViewModel } from '../../domain/mappers/VulnerabilidadeMapper';
import { useEscalaVulnerabilidade } from '../../hooks/useEscalaVulnerabilidade';
import { ANALISE_COLECAO, feature, propsUF } from '../../test/vulnerabilidadeFixtures';

const escala = renderHook(() => useEscalaVulnerabilidade()).result.current;
const referencia = toColecaoViewModel({ type: 'FeatureCollection', features: [], analise: ANALISE_COLECAO }).analise;

type Sobrescritas = {
  simulacao?: Partial<SimulacaoAPI> | null;
  sensibilidade?: Partial<NonNullable<AnaliseUnidadeAPI['sensibilidade']>> | null;
  dentistasPor1000?: number;
  semAnalise?: boolean;
};

function regiao({ simulacao, sensibilidade, dentistasPor1000, semAnalise }: Sobrescritas = {}) {
  const base = propsUF();
  return toRegiaoViewModel(
    feature(
      propsUF({
        simulacao: simulacao === null ? null : { ...base.simulacao!, ...simulacao },
        analise: semAnalise
          ? null
          : {
              ...base.analise!,
              sensibilidade:
                sensibilidade === null ? null : { ...base.analise!.sensibilidade!, ...sensibilidade },
            },
        indicadores:
          dentistasPor1000 === undefined ? base.indicadores : { ...base.indicadores!, dentistas_por_1000: dentistasPor1000 },
      }),
    ),
  );
}

function renderPainel(
  r = regiao(),
  o: { modeloIndisponivel?: boolean; semReferencia?: boolean; onFechar?: () => void } = {},
) {
  const onFechar = o.onFechar ?? vi.fn();
  render(
    <RegionInsightPanel
      regiao={r}
      escala={escala}
      referencia={o.semReferencia ? null : referencia}
      modeloIndisponivel={o.modeloIndisponivel ?? false}
      onFechar={onFechar}
    />,
  );
  return { onFechar };
}

/** A linha (rótulo + valor) que contém o rótulo informado. */
const linha = (rotulo: string) => screen.getByText(rotulo).closest('div')!;

describe('RegionInsightPanel — cabeçalho', () => {
  it('identifica a região, mostra a procedência e fecha pelo botão', async () => {
    const { onFechar } = renderPainel();

    expect(screen.getByRole('heading', { name: 'Maranhão (MA)' })).toBeInTheDocument();
    expect(screen.getByText(/Código IBGE 21/)).toBeInTheDocument();
    expect(screen.getByText(/Contornos: ibge:malhas\/v4/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar detalhe e voltar ao resumo' }));

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it('mostra a média nacional na régua quando o back-end a envia', () => {
    renderPainel();

    expect(screen.getByText(/Média Brasil 30%/)).toBeInTheDocument();
  });

  it('sem a média nacional (back-end antigo) ainda desenha a régua, sem a marca do Brasil', () => {
    renderPainel(regiao(), { semReferencia: true });

    expect(screen.getByRole('heading', { name: 'Maranhão (MA)' })).toBeInTheDocument();
    expect(screen.queryByText(/Média Brasil/)).not.toBeInTheDocument();
  });

  it('sem análise da unidade, os blocos comparativos não aparecem', () => {
    renderPainel(regiao({ semAnalise: true }));

    expect(screen.queryByText('Percentil')).not.toBeInTheDocument();
  });
});

describe('RegionInsightPanel — necessidade de atendimento', () => {
  it('modelo indisponível: explica e diz que o resto funciona', () => {
    renderPainel(regiao(), { modeloIndisponivel: true });

    expect(screen.getByText(/o modelo preditivo não foi carregado no servidor/)).toBeInTheDocument();
    expect(screen.getByText(/O restante do painel funciona normalmente/)).toBeInTheDocument();
    expect(screen.queryByText('Demanda do público-alvo')).not.toBeInTheDocument();
  });

  it('sem simulação para o estado: avisa que não há estimativa', () => {
    renderPainel(regiao({ simulacao: null }));

    expect(screen.getByText('Sem estimativa para este estado.')).toBeInTheDocument();
  });

  it('sem voluntários no cenário mostra "nenhum"', () => {
    renderPainel(regiao({ simulacao: { voluntarios_aplicados: 0 } }));

    expect(linha('Voluntários no cenário')).toHaveTextContent('nenhum');
  });

  it('com voluntários no cenário mostra a quantidade', () => {
    renderPainel(regiao({ simulacao: { voluntarios_aplicados: 1500, capacidade_simulada: 180_000, simulado: true } }));

    expect(linha('Voluntários no cenário')).toHaveTextContent('1.500');
    expect(linha('Capacidade simulada')).toHaveTextContent('180.000 / ano');
  });
});

describe('RegionInsightPanel — sensibilidade ao cenário', () => {
  const cardDescer = () => screen.getByText('Para descer de faixa').parentElement!;

  it('mostra quantos voluntários a mais descem a faixa e para qual', () => {
    renderPainel(regiao({ sensibilidade: { voluntarios_para_faixa_inferior: 54, faixa_inferior: 'media' } }));

    expect(cardDescer()).toHaveTextContent('+54');
    expect(cardDescer()).toHaveTextContent('até atenção moderada');
  });

  it('sem número calculado mostra o travessão', () => {
    renderPainel(regiao({ sensibilidade: { voluntarios_para_faixa_inferior: undefined, faixa_inferior: 'media' } }));

    expect(cardDescer()).toHaveTextContent('—');
  });

  it('já na faixa mais baixa não há para onde descer', () => {
    renderPainel(regiao({ sensibilidade: { voluntarios_para_faixa_inferior: undefined, faixa_inferior: undefined } }));

    expect(cardDescer()).toHaveTextContent('já na faixa mais baixa');
  });

  it('sem sensibilidade o bloco não aparece', () => {
    renderPainel(regiao({ sensibilidade: null }));

    expect(screen.queryByText('Para descer de faixa')).not.toBeInTheDocument();
  });
});

describe('RegionInsightPanel — indicadores', () => {
  it('estado abaixo da referência mostra quantos dentistas por mil faltam', () => {
    renderPainel(regiao({ dentistasPor1000: 0.61 }));

    expect(linha('Faltam para o patamar de referência')).toHaveTextContent('1,39');
  });

  it('estado que já atinge a referência mostra "Nenhum"', () => {
    renderPainel(regiao({ dentistasPor1000: 2.5 }));

    expect(linha('Faltam para o patamar de referência')).toHaveTextContent('Nenhum');
  });
});
