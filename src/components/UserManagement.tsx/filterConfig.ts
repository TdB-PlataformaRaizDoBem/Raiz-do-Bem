/** Um único filtro do tipo "botão toggle" (ex: "Apenas Aprovados") */export interface FilterOption {
  /** Rótulo exibido no botão */
  label: string;
  /** Valor usado internamente para identificar qual filtro está ativo */
  value: string;
}

/** Grupo de filtros relacionados (ex: Status, Programa, Disponibilidade…) */
export interface FilterGroup {
  /** Rótulo do grupo — exibido acima dos botões */
  label: string;
  /** Identifica o grupo para lookup na função de filtro */
  key: string;
  /** Opções mutuamente exclusivas dentro do grupo */
  options: FilterOption[];
}

/** Configuração completa de filtros para uma página */
export interface PageFilterConfig<T> {
  /**
   * Grupos de filtros que aparecem como botões na FilterBar.
   * Cada grupo tem um valor selecionado por vez ("" = todos).
   */
  groups: FilterGroup[];

  /**
   * Predicado que decide se um item passa pelos filtros ativos.
   * Recebe o item, o mapa de filtros ativos { [groupKey]: value }
   * e o texto de busca (já normalizado, minúsculas sem acento).
   */
  predicate: (
    item: T,
    activeFilters: Partial<Record<string, string>>,
    searchText: string,
  ) => boolean;
}
