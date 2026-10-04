/**
 * Cenário de dentistas voluntários, estado a estado.
 *
 * -------------------------------------------------------------------------
 * POR QUE PERSISTIR
 * -------------------------------------------------------------------------
 * Montar o cenário das 27 UFs é um trabalho de vários minutos. Perder isso num
 * F5 acidental, ou ao navegar para outra tela do admin e voltar, tornaria a
 * ferramenta inutilizável na prática. O cenário fica em `localStorage`, com
 * chave versionada — se o formato mudar numa versão futura, a entrada antiga é
 * descartada em vez de quebrar a tela.
 *
 * -------------------------------------------------------------------------
 * O QUE SIGNIFICA UM ESTADO AUSENTE
 * -------------------------------------------------------------------------
 * Ausente ≠ zero. Um estado sem entrada no cenário NÃO é simulado: o mapa
 * mostra a vulnerabilidade real dele, sem desconto. É essa distinção que
 * permite olhar o mapa e saber, de relance, o que já foi planejado e o que
 * ainda está sendo exibido como realmente é.
 */

import { useCallback, useMemo, useState } from "react";

/** Versionada: mudar o formato invalida o que estava salvo, sem quebrar. */
const CHAVE_ARMAZENAMENTO = "raiz-do-bem:cenario-voluntarios:v1";

export type CenarioVoluntarios = Record<string, number>;

function carregarDoArmazenamento(): CenarioVoluntarios {
  if (typeof window === "undefined") return {};
  try {
    const bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (!bruto) return {};

    const dados: unknown = JSON.parse(bruto);
    if (!dados || typeof dados !== "object") return {};

    // Sanitiza na leitura: o conteúdo do localStorage é editável pelo usuário
    // e não pode ser tratado como confiável.
    const limpo: CenarioVoluntarios = {};
    for (const [sigla, valor] of Object.entries(dados as Record<string, unknown>)) {
      if (/^[A-Z]{2}$/.test(sigla) && typeof valor === "number" && valor > 0) {
        limpo[sigla] = Math.floor(valor);
      }
    }
    return limpo;
  } catch {
    return {};
  }
}

function salvarNoArmazenamento(cenario: CenarioVoluntarios): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(cenario));
  } catch {
    // Modo privativo ou cota estourada: o cenário segue funcionando em memória.
  }
}

/**
 * Serializa para o formato aceito pela API: `MA:900,SP:4200`.
 *
 * Compacto de propósito — cabe na query string, é legível no /docs e entra
 * inteiro na chave de cache do serviço, o que faz voltar a um cenário já
 * consultado ser instantâneo.
 */
export function serializarCenario(cenario: CenarioVoluntarios): string {
  const partes = Object.entries(cenario)
    .filter(([, quantidade]) => quantidade > 0)
    // Ordenado para que o mesmo cenário gere sempre a mesma string — e,
    // portanto, o mesmo acerto de cache.
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sigla, quantidade]) => `${sigla}:${quantidade}`);
  return partes.join(",");
}

export interface UseCenarioVoluntarios {
  cenario: CenarioVoluntarios;
  /** String pronta para a query da API. Vazia quando não há nada declarado. */
  parametro: string;
  /** Quantos estados já têm cenário preenchido. */
  totalEstados: number;
  /** Soma de voluntários declarados em todos os estados. */
  totalVoluntarios: number;

  definir: (uf: string, quantidade: number) => void;
  remover: (uf: string) => void;
  limpar: () => void;
  quantidadeDe: (uf: string) => number;
}

export function useCenarioVoluntarios(): UseCenarioVoluntarios {
  // Inicializador preguiçoso: lê o armazenamento uma vez, na montagem, e não a
  // cada render.
  const [cenario, setCenario] = useState<CenarioVoluntarios>(carregarDoArmazenamento);

  const persistir = useCallback((proximo: CenarioVoluntarios) => {
    setCenario(proximo);
    salvarNoArmazenamento(proximo);
  }, []);

  const definir = useCallback(
    (uf: string, quantidade: number) => {
      const sigla = uf.toUpperCase();
      const valor = Math.max(0, Math.floor(quantidade));

      // Zero remove a entrada em vez de gravar 0: "sem voluntários declarados"
      // e "zero voluntários" precisam ser o mesmo estado, senão o mapa passaria
      // a marcar o estado como simulado sem nenhuma simulação.
      const proximo = { ...cenario };
      if (valor <= 0) delete proximo[sigla];
      else proximo[sigla] = valor;

      persistir(proximo);
    },
    [cenario, persistir],
  );

  const remover = useCallback(
    (uf: string) => {
      const proximo = { ...cenario };
      delete proximo[uf.toUpperCase()];
      persistir(proximo);
    },
    [cenario, persistir],
  );

  const limpar = useCallback(() => persistir({}), [persistir]);

  const quantidadeDe = useCallback(
    (uf: string) => cenario[uf.toUpperCase()] ?? 0,
    [cenario],
  );

  const parametro = useMemo(() => serializarCenario(cenario), [cenario]);

  const totalVoluntarios = useMemo(
    () => Object.values(cenario).reduce((acc, n) => acc + n, 0),
    [cenario],
  );

  return {
    cenario,
    parametro,
    totalEstados: Object.keys(cenario).length,
    totalVoluntarios,
    definir,
    remover,
    limpar,
    quantidadeDe,
  };
}
