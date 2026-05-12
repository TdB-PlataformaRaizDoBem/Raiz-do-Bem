/**
 * Configurações de filtro específicas por página.
 *
 * Cada função retorna um PageFilterConfig<T> pronto para ser passado ao
 * useSmartFilter. O predicate une busca por texto + todos os filtros ativos.
 */

import type { PageFilterConfig } from "../components/UserManagement.tsx/FilterConfig";
import { normalizeText } from "./useSmartFilter";
import type { BeneficiarioViewModel } from "../domain/mappers/Beneficiariomapper";
import type { DentistaViewModel } from "../domain/mappers/DentistaMapper ";
import type { ColaboradorViewModel } from "../domain/mappers/ColaboradorMapper";
import type { PedidoViewModel } from "../domain/mappers/PedidoMapper";

/* ───────────────────────────────────────────────
   COLABORADORES
   Filtros: Nível de acesso
   Busca: nome, e-mail
─────────────────────────────────────────────── */
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
  predicate(item, activeFilters, searchText) {
    // Filtro de nível
    const nivel = activeFilters["nivel"];
    if (nivel) {
      const itemNivel = (item.nivelAcesso ?? "colaborador").toLowerCase();
      if (itemNivel !== nivel) return false;
    }

    // Busca por texto
    if (searchText) {
      const haystack = normalizeText(
        `${item.nomeCompleto} ${item.email} ${item.cpf}`
      );
      if (!haystack.includes(searchText)) return false;
    }

    return true;
  },
};

/* ───────────────────────────────────────────────
   BENEFICIÁRIOS
   Filtros: Programa Social, Status do Pedido
   Busca: nome, CPF, cidade
─────────────────────────────────────────────── */
export const beneficiarioFilterConfig: PageFilterConfig<BeneficiarioViewModel> =
  {
    groups: [
      {
        label: "Programa Social",
        key: "programa",
        options: [
          { label: "Turma do Bem", value: "turma_do_bem" },
          { label: "Apolônias do Bem", value: "apollonias_do_bem" },
        ],
      },
      {
        label: "Status do Pedido",
        key: "status",
        options: [
          { label: "Aprovado", value: "APROVADO" },
          { label: "Pendente", value: "PENDENTE" },
          { label: "Negado", value: "REJEITADO" },
        ],
      },
    ],
    predicate(item, activeFilters, searchText) {
      // Filtro de programa
      const programa = activeFilters["programa"];
      if (programa) {
        const itemPrograma = normalizeText(
          item.programaSocial?.programa ?? ""
        );
        if (itemPrograma !== normalizeText(programa)) return false;
      }

      // Filtro de status do pedido
      const status = activeFilters["status"];
      if (status) {
        if (item.pedido?.statusAPI !== status) return false;
      }

      // Busca por texto
      if (searchText) {
        const haystack = normalizeText(
          `${item.nomeCompleto} ${item.cpf} ${item.email} ${item.endereco?.cidade ?? ""} ${item.endereco?.estado ?? ""}`
        );
        if (!haystack.includes(searchText)) return false;
      }

      return true;
    },
  };

/* ───────────────────────────────────────────────
   DENTISTAS
   Filtros: Disponibilidade, Programa
   Busca: nome, CRO, especialidade, cidade
─────────────────────────────────────────────── */
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
        { label: "Turma do Bem", value: "turma_do_bem" },
        { label: "Apolônias do Bem", value: "apollonias_do_bem" },
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
      const especialidades = item.especialidades
        .map((e) => e.descricao)
        .join(" ");
      const haystack = normalizeText(
        `${item.nomeCompleto} ${item.croDentista} ${item.cpf} ${especialidades} ${item.endereco?.cidade ?? ""} ${item.endereco?.estado ?? ""}`
      );
      if (!haystack.includes(searchText)) return false;
    }

    return true;
  },
};

/* ───────────────────────────────────────────────
   PEDIDOS DE AJUDA
   Filtros: Status
   Busca: nome, CPF, protocolo (id), cidade, descrição do problema
─────────────────────────────────────────────── */
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
  predicate(item, activeFilters, searchText) {
    // Filtro de status
    const status = activeFilters["status"];
    if (status && item.statusAPI !== status) return false;

    // Filtro de dentista vinculado
    const dentista = activeFilters["dentista"];
    if (dentista === "com" && !item.dentistaAtribuido) return false;
    if (dentista === "sem" && item.dentistaAtribuido) return false;

    // Busca por texto (inclui número do protocolo)
    if (searchText) {
      const haystack = normalizeText(
        `${item.nomeCompleto} ${item.cpf} ${item.id} ${item.descricaoProblema} ${item.endereco?.cidade ?? ""} ${item.endereco?.estado ?? ""}`
      );
      if (!haystack.includes(searchText)) return false;
    }

    return true;
  },
};

/* ───────────────────────────────────────────────
   DESIGNAÇÃO (beneficiários pendentes)
   Filtros: Programa, Localização (estado)
   Busca: nome, CPF, cidade, protocolo
─────────────────────────────────────────────── */
export const designacaoFilterConfig: PageFilterConfig<BeneficiarioViewModel> =
  {
    groups: [
      {
        label: "Programa Social",
        key: "programa",
        options: [
          { label: "Turma do Bem", value: "turma_do_bem" },
          { label: "Apolônias do Bem", value: "apollonias_do_bem" },
        ],
      },
    ],
    predicate(item, activeFilters, searchText) {
      // Filtro de programa
      const programa = activeFilters["programa"];
      if (programa) {
        const itemPrograma = normalizeText(
          typeof item.programaSocial === "string"
            ? item.programaSocial
            : item.programaSocial?.programa ?? ""
        );
        if (itemPrograma !== normalizeText(programa)) return false;
      }

      // Busca por texto
      if (searchText) {
        const haystack = normalizeText(
          `${item.nomeCompleto} ${item.cpf} ${item.endereco?.cidade ?? ""} ${item.endereco?.estado ?? ""} ${item.pedido?.id ?? ""}`
        );
        if (!haystack.includes(searchText)) return false;
      }

      return true;
    },
  };
