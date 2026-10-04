/**
 * Escala de cores e vocabulário do mapa coroplético.
 *
 * FONTE ÚNICA DA VERDADE: as cores vivem em `src/styles/theme.css`, no bloco
 * `@theme` do Tailwind v4. Este hook as LÊ em runtime via `getComputedStyle`
 * em vez de repetir hexadecimais em TypeScript — o Leaflet pinta SVG por
 * `style()` e precisa de hex, e paleta duplicada sempre diverge com o tempo.
 *
 * Também concentra o VOCABULÁRIO exibido na tela. Os nomes técnicos das faixas
 * ("muito_alta") nunca chegam ao usuário: quem lê o painel é gestor, não
 * cientista de dados.
 */

import { useMemo } from "react";
import type { FaixaVulnerabilidade } from "../domain/entities/VulnerabilidadeGeoAPI";

export interface DegrauEscala {
  faixa: FaixaVulnerabilidade;
  /** Rótulo curto, para legenda e badges. */
  rotulo: string;
  /** O que essa faixa significa em termos de ação. */
  significado: string;
  min: number;
  max: number;
  /** Cor do polígono no mapa. */
  cor: string;
  /**
   * Tom escurecido da mesma cor, legível como TEXTO sobre fundo claro.
   *
   * Badge sólido não funciona nesta paleta: os degraus do meio caem na zona
   * morta de contraste, onde nem texto branco nem grafite alcançam 4,5:1.
   * A solução é o badge tingido — fundo com 12% da cor e texto neste tom.
   */
  corTexto: string;
  token: string;
}

/**
 * Cortes idênticos aos de `classificar_faixa` no back-end.
 * O front NUNCA reclassifica: a `faixa` vem pronta da API e estes limites
 * servem apenas para desenhar a legenda.
 */
const DEGRAUS: Array<
  Pick<DegrauEscala, "faixa" | "min" | "max" | "token" | "rotulo" | "significado">
> = [
  {
    faixa: "muito_baixa",
    min: 0.0,
    max: 0.2,
    token: "vuln-1",
    rotulo: "Atenção mínima",
    significado: "Cobertura adequada. Manter o acompanhamento de rotina.",
  },
  {
    faixa: "baixa",
    min: 0.2,
    max: 0.4,
    token: "vuln-2",
    rotulo: "Atenção baixa",
    significado: "Situação estável, com pontos isolados a observar.",
  },
  {
    faixa: "media",
    min: 0.4,
    max: 0.6,
    token: "vuln-3",
    rotulo: "Atenção moderada",
    significado: "Demanda acima da capacidade local. Vale planejar reforço.",
  },
  {
    faixa: "alta",
    min: 0.6,
    max: 0.8,
    token: "vuln-4",
    rotulo: "Atenção alta",
    significado: "Lacuna relevante de assistência. Priorizar mutirões.",
  },
  {
    faixa: "muito_alta",
    min: 0.8,
    max: 1.0,
    token: "vuln-5",
    rotulo: "Atenção crítica",
    significado: "Necessita intervenção orçamentária prioritária.",
  },
];

const FALLBACK: Record<string, string> = {
  "vuln-1": "#b8c7d9",
  "vuln-2": "#88aac5",
  "vuln-3": "#b3803f",
  "vuln-4": "#ac5226",
  "vuln-5": "#8b0000",
  canvas: "#eef1f5",
  "canvas-soft": "#f7f9fb",
  "canvas-line": "#dde3ea",
};

export function lerCorDoTema(token: string): string {
  if (typeof document === "undefined") return FALLBACK[token] ?? "#cccccc";
  const valor = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${token}`)
    .trim();
  return valor || FALLBACK[token] || "#cccccc";
}

// ---------------------------------------------------------------------------
// Contraste (WCAG 2.1)
// ---------------------------------------------------------------------------

function paraRgb(hex: string): [number, number, number] {
  const limpo = hex.replace("#", "").trim();
  const completo =
    limpo.length === 3
      ? limpo
          .split("")
          .map((c) => c + c)
          .join("")
      : limpo;
  return [0, 2, 4].map((i) => parseInt(completo.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

/** Luminância relativa. Base de todo cálculo de contraste do painel. */
export function luminanciaRelativa(hex: string): number {
  const canais = paraRgb(hex).map((valor) => {
    const v = valor / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

/** Razão de contraste entre duas cores (1 a 21). */
export function razaoContraste(corA: string, corB: string): number {
  const a = luminanciaRelativa(corA);
  const b = luminanciaRelativa(corB);
  const [claro, escuro] = a > b ? [a, b] : [b, a];
  return (claro + 0.05) / (escuro + 0.05);
}

function paraHex(rgb: [number, number, number]): string {
  return `#${rgb
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Escurece a cor em passos até atingir o contraste mínimo contra `fundo`.
 *
 * Preserva o matiz — o texto do badge continua sendo "a mesma cor" da faixa,
 * só que legível. Multiplicar os canais é uma aproximação suficiente para
 * este uso e evita trazer uma dependência de espaço de cor.
 */
export function escurecerAteContraste(
  cor: string,
  fundo = "#ffffff",
  alvo = 4.5,
): string {
  let atual = cor;
  for (let passo = 0; passo < 40; passo += 1) {
    if (razaoContraste(atual, fundo) >= alvo) return atual;
    atual = paraHex(paraRgb(atual).map((v) => v * 0.92) as [number, number, number]);
  }
  return atual;
}

// ---------------------------------------------------------------------------
// Vocabulário do índice agregado
// ---------------------------------------------------------------------------

export interface LeituraIndice {
  percentual: number;
  rotulo: string;
  apoio: string;
}

export function lerIndice(score: number): LeituraIndice {
  const percentual = Math.round(score * 100);

  if (score < 0.2) {
    return {
      percentual,
      rotulo: "Risco baixo",
      apoio: "A rede local dá conta da demanda estimada.",
    };
  }
  if (score < 0.4) {
    return {
      percentual,
      rotulo: "Risco moderado",
      apoio: "Há folga, mas com bolsões que merecem acompanhamento.",
    };
  }
  if (score < 0.6) {
    return {
      percentual,
      rotulo: "Risco elevado",
      apoio: "A demanda supera a capacidade instalada em boa parte da área.",
    };
  }
  if (score < 0.8) {
    return {
      percentual,
      rotulo: "Risco alto",
      apoio: "Lacuna consistente de assistência. Priorize esta região.",
    };
  }
  return {
    percentual,
    rotulo: "Risco crítico",
    apoio: "Intervenção orçamentária prioritária recomendada.",
  };
}

export interface EscalaVulnerabilidade {
  degraus: DegrauEscala[];
  corPorFaixa: (faixa: FaixaVulnerabilidade) => string;
  corPorScore: (score: number) => string;
  degrauPorFaixa: (faixa: FaixaVulnerabilidade) => DegrauEscala;
  degrauPorScore: (score: number) => DegrauEscala;
  corNeutra: string;
  canvas: { fundo: string; suave: string; linha: string };
}

export function useEscalaVulnerabilidade(): EscalaVulnerabilidade {
  return useMemo(() => {
    const degraus: DegrauEscala[] = DEGRAUS.map((d) => {
      const cor = lerCorDoTema(d.token);
      return { ...d, cor, corTexto: escurecerAteContraste(cor) };
    });

    const porFaixa = new Map(degraus.map((d) => [d.faixa, d]));
    const corNeutra = lerCorDoTema("canvas-line");
    const porScore = (score: number) =>
      degraus.find((d) => score < d.max) ?? degraus[degraus.length - 1];

    return {
      degraus,
      corNeutra,
      canvas: {
        fundo: lerCorDoTema("canvas"),
        suave: lerCorDoTema("canvas-soft"),
        linha: lerCorDoTema("canvas-line"),
      },
      corPorFaixa: (faixa) => porFaixa.get(faixa)?.cor ?? corNeutra,
      degrauPorFaixa: (faixa) => porFaixa.get(faixa) ?? degraus[0],
      degrauPorScore: porScore,
      corPorScore: (score) => porScore(score).cor,
    };
  }, []);
}

// A opacidade de preenchimento passou a ser um contrato visual único, definido
// em ChoroplethLayer (0.75 padrão / 0.95 sob o cursor). Variar por nível
// fazia o mesmo índice parecer mais grave no zoom de país do que no de estado.
