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

/** Uma forma de ordenar a lista (ex.: "Mais recentes"). `compare` é o comparador de `Array.sort`. */
export interface SortOption<T> {
  label: string;
  value: string;
  compare: (a: T, b: T) => number;
}

/** Configuração completa de filtros para uma página */
export interface PageFilterConfig<T> {
  groups: FilterGroup[];

  /** Ordenações oferecidas. Sem nenhuma escolhida, a lista segue na ordem em que veio da API. */
  sorts?: SortOption<T>[];

  predicate: (
    item: T,
    activeFilters: Record<string, string>,
    searchText: string
  ) => boolean;
}
