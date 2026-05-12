import { useMemo, useState, useCallback } from "react";
import type { PageFilterConfig } from "../components/UserManagement.tsx/FilterConfig";

/** Normaliza texto para comparação sem acentos e minúsculas */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Hook de filtro inteligente.
 *
 * @param items   Lista original de itens
 * @param config  Configuração de filtros declarada pela página
 */
export function useSmartFilter<T>(items: T[], config: PageFilterConfig<T>) {
  const [searchText, setSearchText] = useState("");

  // Estado dos filtros ativos: { [groupKey]: selectedValue | "" }
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(config.groups.map((g) => [g.key, ""])) as Record<
        string,
        string
      >
  );

  /** Alterna um filtro: clica no mesmo valor desativa, outro valor ativa */
  const toggleFilter = useCallback((groupKey: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey] === value ? "" : value,
    }));
  }, []);

  /** Limpa todos os filtros e a busca */
  const clearAll = useCallback(() => {
    setSearchText("");
    setActiveFilters(
      Object.fromEntries(config.groups.map((g) => [g.key, ""])) as Record<
        string,
        string
      >
    );
  }, [config.groups]);

  /** Verifica se algum filtro está ativo */
  const hasActiveFilters = useMemo(() => {
    const hasSearch = searchText.trim().length > 0;
    const hasFilter = Object.values(activeFilters).some((v) => v !== "");
    return hasSearch || hasFilter;
  }, [searchText, activeFilters]);

  /** Lista filtrada */
  const filteredItems = useMemo(() => {
    const normalizedSearch = normalizeText(searchText);
    return items.filter((item) =>
      config.predicate(item, activeFilters, normalizedSearch)
    );
  }, [items, activeFilters, searchText, config]);

  return {
    filteredItems,
    searchText,
    setSearchText,
    activeFilters,
    toggleFilter,
    clearAll,
    hasActiveFilters,
  };
}
