/**
 * Carga das 27 UFs, unindo indicadores e geometria oficial.
 *
 * Um único nível geográfico. Não há navegação hierárquica: o mapa sempre mostra
 * o Brasil inteiro, e clicar num estado apenas o seleciona no painel. A base
 * municipal cobria 1,1% dos 5.570 municípios, e servi-la dava aparência de
 * cobertura que o dado não tinha.
 *
 * A geometria e os indicadores viajam por caminhos diferentes de propósito
 * (ver MalhaGeograficaService) e são unidos aqui, por código IBGE. Os
 * indicadores vêm sem geometria — poucos KB por cenário simulado — e a malha é
 * baixada uma vez por sessão, preferencialmente do próprio vulnerabilidade-api.
 *
 * POR QUE NÃO USA `useAsync`
 * `useAsync` zera `data` ao entrar em loading — correto para tabelas, ruim para
 * mapa: causaria um flash de tela vazia a cada mudança no simulador. Aqui o
 * resultado anterior permanece até o novo chegar, e `loading` é DERIVADO da
 * comparação entre o cenário pedido e o já carregado. Sem `setState` síncrono
 * em efeito e sem leitura de ref durante o render.
 */

import { useCallback, useEffect, useState } from "react";
import type { VulnerabilidadePropertiesAPI } from "../domain/entities/VulnerabilidadeGeoAPI";
import {
  toColecaoViewModel,
  toRegiaoViewModel,
  type ColecaoViewModel,
  type RegiaoViewModel,
} from "../domain/mappers/VulnerabilidadeMapper";
import {
  carregarMalha,
  juntarGeometria,
  type OrigemMalha,
} from "../services/MalhaGeograficaService";
import { getVulnerabilidadeBrasil } from "../services/VulnerabilidadeService";

interface ResultadoCarga {
  /** Cenário a que este resultado pertence. Vazio = nenhuma carga concluída. */
  chave: string;
  colecao: ColecaoViewModel | null;
  erro: string | null;
  origemGeometria: OrigemMalha;
}

const RESULTADO_INICIAL: ResultadoCarga = {
  chave: " ", // sentinela: nunca igual a um cenário real
  colecao: null,
  erro: null,
  origemGeometria: "nenhuma",
};

export interface UseVulnerabilidadeMapa {
  colecao: ColecaoViewModel | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** De onde vieram os contornos: "api", "ibge" (direto do navegador) ou "nenhuma". */
  origemGeometria: OrigemMalha;

  selecionada: RegiaoViewModel | null;
  selecionar: (props: VulnerabilidadePropertiesAPI | null) => void;
}

/**
 * @param cenarioVoluntarios string `MA:900,SP:4200` — vazia quando nada foi
 * declarado. Entra na chave de identidade: mudar o cenário recarrega.
 */
export function useVulnerabilidadeMapa(
  cenarioVoluntarios: string,
): UseVulnerabilidadeMapa {
  const [selecionada, setSelecionada] = useState<RegiaoViewModel | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState<ResultadoCarga>(RESULTADO_INICIAL);

  useEffect(() => {
    let cancelado = false;
    const controle = new AbortController();
    const chave = cenarioVoluntarios;

    // Indicadores e contornos em paralelo: serviços independentes, e encadeá-los
    // somaria as latências sem necessidade. A malha é cacheada, então só a
    // primeira carga paga por ela.
    Promise.all([
      getVulnerabilidadeBrasil(cenarioVoluntarios),
      carregarMalha(controle.signal).catch(() => null),
    ])
      .then(([dados, malha]) => {
        if (cancelado) return;
        const { colecao, origem } = juntarGeometria(dados, malha);
        setResultado({
          chave,
          colecao: toColecaoViewModel(colecao),
          erro: null,
          origemGeometria: origem,
        });
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        const mensagem = err instanceof Error ? err.message : "Falha ao carregar o mapa";
        // Preserva a malha anterior: melhor um dado desatualizado e sinalizado
        // do que uma tela em branco quando a API oscila.
        setResultado((anterior) => ({ ...anterior, chave, erro: mensagem }));
      });

    return () => {
      cancelado = true;
      controle.abort();
    };
  }, [cenarioVoluntarios, tentativa]);

  const loading = resultado.chave !== cenarioVoluntarios;
  const error = resultado.chave === cenarioVoluntarios ? resultado.erro : null;

  const refetch = useCallback(() => setTentativa((n) => n + 1), []);

  const selecionar = useCallback((props: VulnerabilidadePropertiesAPI | null) => {
    setSelecionada(
      props
        ? toRegiaoViewModel({ type: "Feature", geometry: null, properties: props })
        : null,
    );
  }, []);

  return {
    colecao: resultado.colecao,
    loading,
    error,
    refetch,
    origemGeometria: resultado.origemGeometria,
    selecionada,
    selecionar,
  };
}
