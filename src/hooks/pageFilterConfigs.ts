/** Configs de filtro por página, para `useSmartFilter`. */

import type { PageFilterConfig, SortOption } from "../components/UserManagement/FilterConfig";
import { normalizeText } from "./useSmartFilter";
import { comparadorPorData } from "../utils/sortUtils";
import type { BeneficiarioViewModel } from "../domain/mappers/Beneficiariomapper";
import type { DentistaViewModel } from "../domain/mappers/DentistaMapper";
import type { ColaboradorViewModel } from "../domain/mappers/ColaboradorMapper";
import type { PedidoViewModel } from "../domain/mappers/PedidoMapper";
import type { AtendimentoViewModel } from "../domain/mappers/AtendimentoMapper";

/** Par de ordenações "mais recentes / mais antigos" para um campo de data ISO. */
function ordenacaoPorData<T>(
  getData: (item: T) => string | null | undefined,
  getId: (item: T) => number,
  rotulos: { recentes: string; antigos: string },
): SortOption<T>[] {
  return [
    { label: rotulos.recentes, value: "recentes", compare: comparadorPorData(getData, getId, "recentes") },
    { label: rotulos.antigos, value: "antigos", compare: comparadorPorData(getData, getId, "antigos") },
  ];
}

/*
   COLABORADORES
   Filtros: Nível de acesso
   Ordenação: data de contratação
   Busca: nome, e-mail
   */
export const colaboradorFilterConfig: PageFilterConfig<ColaboradorViewModel> = {
  groups: [
    {
      label: "Nível de acesso",
      key: "nivel",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Colaborador", value: "colaborador" },
      ],
    },
  ],
  sorts: ordenacaoPorData<ColaboradorViewModel>((c) => c.dataContratacaoISO, (c) => c.id, {
    recentes: "Contratação mais recente",
    antigos: "Contratação mais antiga",
  }),
  predicate(item, _activeFilters, searchText) {
    // Filtro de nível (nivelAcesso não disponível no ColaboradorViewModel)
    // Busca por texto
    if (searchText) {
      const haystack = normalizeText(
        `${item.nomeCompleto} ${item.email} ${item.cpf}`,
      );
      if (!haystack.includes(searchText)) return false;
    }

    return true;
  },
};

/*
   BENEFICIÁRIOS
   Filtros: Programa Social, Status do Pedido
   Busca: nome, CPF, cidade
 */
export const beneficiarioFilterConfig: PageFilterConfig<BeneficiarioViewModel> =
  {
    groups: [
      {
        label: "Programa Social",
        key: "programa",
        options: [
          { label: "Turma do Bem", value: "Turma do Bem" },
          { label: "Apolônias do Bem", value: "Apolonia do Bem" },
        ],
      },
    ],
    predicate(item, activeFilters, searchText) {
      // Filtro de programa
      const programa = activeFilters["programa"];
      if (programa) {
        const itemPrograma = normalizeText(item.programaSocial ?? "");
        if (itemPrograma !== normalizeText(programa)) return false;
      }

      // Busca por texto
      if (searchText) {
        const haystack = normalizeText(
          `${item.nomeCompleto} ${item.cpf} ${item.email} ${item.endereco?.cidade ?? ""} ${item.endereco?.estado ?? ""}`,
        );
        if (!haystack.includes(searchText)) return false;
      }

      return true;
    },
  };

/* 
   DENTISTAS
   Filtros: Disponibilidade, Programa
   Busca: nome, CRO, especialidade, cidade
*/
export const dentistaFilterConfig: PageFilterConfig<DentistaViewModel> = {
  groups: [
    {
      label: "Disponibilidade",
      key: "disponivel",
      options: [
        { label: "Disponível", value: "sim" },
        { label: "Indisponível", value: "nao" },
      ],
    },
    {
      label: "Programa",
      key: "programa",
      options: [
        { label: "Turma do Bem", value: "Turma do Bem" },
        { label: "Apolônias do Bem", value: "Apolonia do Bem" },
        { label: "Ambos", value: "ambos" },
      ],
    },
  ],
  predicate(item, activeFilters, searchText) {
    // Filtro de disponibilidade
    const disponivel = activeFilters["disponivel"];
    if (disponivel === "sim" && !item.disponivel) return false;
    if (disponivel === "nao" && item.disponivel) return false;

    // Filtro de programa
    const programa = activeFilters["programa"];
    if (programa) {
      const itemPrograma = normalizeText(item.programa ?? "");
      if (itemPrograma !== normalizeText(programa)) return false;
    }

    // Busca por texto
    if (searchText) {
      const especialidades = item.especialidades.join(" ");
      const haystack = normalizeText(
        `${item.nomeCompleto} ${item.croDentista} ${item.cpf} ${especialidades} ${item.cidade ?? ""} ${item.estado ?? ""}`,
      );
      if (!haystack.includes(searchText)) return false;
    }

    return true;
  },
};

/* 
   PEDIDOS DE AJUDA
   Filtros: Status, Dentista
   Ordenação: data do envio (mais recentes / mais antigos)
   Busca: nome, CPF, protocolo (id), cidade, descrição do problema
 */
export const pedidoFilterConfig: PageFilterConfig<PedidoViewModel> = {
  groups: [
    {
      label: "Status",
      key: "status",
      options: [
        { label: "Pendente", value: "PENDENTE" },
        { label: "Aprovado", value: "APROVADO" },
        { label: "Negado", value: "REJEITADO" },
      ],
    },
    {
      label: "Dentista",
      key: "dentista",
      options: [
        { label: "Com dentista", value: "com" },
        { label: "Sem dentista", value: "sem" },
      ],
    },
  ],
  sorts: ordenacaoPorData<PedidoViewModel>((p) => p.dataPedidoISO, (p) => p.id, {
    recentes: "Mais recentes",
    antigos: "Mais antigos",
  }),
  predicate(item, activeFilters, searchText) {
    // Filtro de status
    const status = activeFilters["status"];
    if (status && item.statusAPI !== status) return false;

    // Filtro de dentista vinculado
    const dentista = activeFilters["dentista"];
    if (dentista === "com" && !item.dentistaResponsavel) return false;
    if (dentista === "sem" && item.dentistaResponsavel) return false;

    // Busca por texto (inclui número do protocolo)
    if (searchText) {
      const haystack = normalizeText(
        `${item.nomeCompleto} ${item.cpf} ${item.id} ${item.descricaoProblema} ${item.endereco ?? ""}`,
      );
      if (!haystack.includes(searchText)) return false;
    }

    return true;
  },
};

/*
   DESIGNAÇÃO — aba PENDENTE (Beneficiários ainda sem atendimento)
   Busca: nome completo, CPF, cidade do endereço.
*/
export const designacaoFilterConfig: PageFilterConfig<BeneficiarioViewModel> = {
  groups: [],
  predicate(item, _activeFilters, searchText) {
    if (searchText) {
      const haystack = normalizeText(
        `${item.nomeCompleto} ${item.cpf} ${item.endereco?.cidade ?? ""}`,
      );
      if (!haystack.includes(searchText)) return false;
    }

    return true;
  },
};

/*
   DESIGNAÇÃO — abas EM_ATENDIMENTO, CONCLUIDO e TODOS (Atendimentos)
   Ordenação: data de início do atendimento
   Busca: nome do beneficiário, nome do dentista, prontuário, id do atendimento.
*/
export const atendimentoFilterConfig: PageFilterConfig<AtendimentoViewModel> = {
  groups: [],
  sorts: ordenacaoPorData<AtendimentoViewModel>((a) => a.dataInicialISO, (a) => a.id, {
    recentes: "Início mais recente",
    antigos: "Início mais antigo",
  }),
  predicate(item, _activeFilters, searchText) {
    if (searchText) {
      const haystack = normalizeText(
        `${item.beneficiario} ${item.dentista} ${item.prontuario} ${item.id}`,
      );
      if (!haystack.includes(searchText)) return false;
    }

    return true;
  },
};
