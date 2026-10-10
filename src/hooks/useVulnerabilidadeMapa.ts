/**
 * Carga das 27 UFs, unindo indicadores (API) e malha geográfica por código IBGE.
 * Não usa `useAsync`: o resultado anterior fica na tela até o novo chegar, sem flash de mapa vazio.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { VulnerabilidadePropertiesAPI } from "../domain/entities/VulnerabilidadeGeoAPI";
import {
  toColecaoViewModel,
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

/** Carrega as 27 UFs para o cenário informado (`MA:900,SP:4200`) e controla a seleção. */
export function useVulnerabilidadeMapa(
  cenarioVoluntarios: string,
): UseVulnerabilidadeMapa {
  // Guarda só o CÓDIGO. Guardar o ViewModel congelava o painel no cenário do
  // clique: o usuário selecionava o Maranhão, digitava 900 voluntários no
  // simulador e o detalhe seguia mostrando "nenhum voluntário, cobertura 0%".
  const [codigoSelecionado, setCodigoSelecionado] = useState<string | null>(null);
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
    setCodigoSelecionado(props?.codigo_ibge ?? null);
  }, []);

  // Derivado da coleção EM TELA: acompanha cada novo cenário sem efeito nem
  // cópia. Se o estado sair do conjunto, a seleção some com ele.
  const selecionada = useMemo(
    () =>
      codigoSelecionado
        ? (resultado.colecao?.regioes.find((r) => r.codigoIbge === codigoSelecionado) ??
          null)
        : null,
    [codigoSelecionado, resultado.colecao],
  );

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
