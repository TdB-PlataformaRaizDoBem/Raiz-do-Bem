export interface FilterOption {
  label: string;
  value: string;
}

/** Grupo de filtros relacionados (ex: Status, Programa, Disponibilidade…) */
export interface FilterGroup {
  label: string;
  key: string;
  options: FilterOption[];
}

/** Configuração completa de filtros para uma página */
export interface PageFilterConfig<T> {
  groups: FilterGroup[];

  predicate: (
    item: T,
    activeFilters: Record<string, string>,
    searchText: string
  ) => boolean;
}
