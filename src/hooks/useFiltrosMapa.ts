/** Filtros do mapa. Separado da carga de dados: filtrar é local e não faz requisição. */

import { useCallback, useMemo, useState } from "react";
import type { FaixaVulnerabilidade } from "../domain/entities/VulnerabilidadeGeoAPI";
import type { RegiaoViewModel } from "../domain/mappers/VulnerabilidadeMapper";
import { normalizarBusca } from "../utils/geoUtils";

/** Faixas da mais urgente para a menos urgente. */
export const FAIXAS_ORDENADAS: FaixaVulnerabilidade[] = [
  "muito_alta",
  "alta",
  "media",
  "baixa",
  "muito_baixa",
];

export interface FiltrosMapa {
  /** Vazio = nenhuma faixa filtrada, todas visíveis. */
  faixas: Set<FaixaVulnerabilidade>;
  termo: string;

  alternarFaixa: (faixa: FaixaVulnerabilidade) => void;
  definirTermo: (termo: string) => void;
  limpar: () => void;
  temFiltroAtivo: boolean;

  /** Regiões que passam nos filtros — alimenta mapa, badges e ranking. */
  regioesFiltradas: RegiaoViewModel[];
  /** Sugestões do autocomplete, já limitadas. */
  sugestoes: RegiaoViewModel[];
  /** Quantas ficaram de fora, para o painel poder informar. */
  ocultadas: number;
}

const MAX_SUGESTOES = 8;

/** Filtra as UFs por faixa e por nome/código IBGE; sugestões a partir de 2 caracteres (máx. 8). */
export function useFiltrosMapa(regioes: RegiaoViewModel[]): FiltrosMapa {
  const [faixas, setFaixas] = useState<Set<FaixaVulnerabilidade>>(new Set());
  const [termo, setTermo] = useState("");

  const alternarFaixa = useCallback((faixa: FaixaVulnerabilidade) => {
    setFaixas((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(faixa)) proximo.delete(faixa);
      else proximo.add(faixa);
      return proximo;
    });
  }, []);

  const limpar = useCallback(() => {
    setFaixas(new Set());
    setTermo("");
  }, []);

  const termoNormalizado = useMemo(() => normalizarBusca(termo), [termo]);

  const regioesFiltradas = useMemo(() => {
    return regioes.filter((regiao) => {
      if (faixas.size > 0 && !faixas.has(regiao.faixa)) return false;
      if (termoNormalizado.length === 0) return true;
      return (
        normalizarBusca(regiao.nome).includes(termoNormalizado) ||
        regiao.codigoIbge.startsWith(termoNormalizado)
      );
    });
  }, [regioes, faixas, termoNormalizado]);

  /**
   * Sugestões respeitam o filtro de faixa, mas exigem termo digitado.
   * Sem essa exigência o campo abriria uma lista gigante ao receber foco.
   */
  const sugestoes = useMemo(() => {
    if (termoNormalizado.length < 2) return [];
    return [...regioesFiltradas]
      .sort((a, b) => {
        // Quem começa com o termo vem antes de quem só o contém no meio.
        const aComeca = normalizarBusca(a.nome).startsWith(termoNormalizado);
        const bComeca = normalizarBusca(b.nome).startsWith(termoNormalizado);
        if (aComeca !== bComeca) return aComeca ? -1 : 1;
        return b.indicePrioridade - a.indicePrioridade;
      })
      .slice(0, MAX_SUGESTOES);
  }, [regioesFiltradas, termoNormalizado]);

  return {
    faixas,
    termo,
    alternarFaixa,
    definirTermo: setTermo,
    limpar,
    temFiltroAtivo: faixas.size > 0 || termo.trim().length > 0,
    regioesFiltradas,
    sugestoes,
    ocultadas: regioes.length - regioesFiltradas.length,
  };
}
