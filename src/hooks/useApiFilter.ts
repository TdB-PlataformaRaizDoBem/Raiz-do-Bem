import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

export type InputValues       = Record<string, string>;
export type QuickValues       = Record<string, boolean>;
export type FilterResolver<T> = (value: string) => Promise<T[]>;
export type LocalPredicate<T> = (item: T, value: string) => boolean;

export interface UseApiFilterOptions<T> {
  baseItems:         T[];
  inputs:            InputValues;
  quickFilters?:     QuickValues;
  resolvers:         Partial<Record<string, FilterResolver<T>>>;
  localPredicates?:  Partial<Record<string, LocalPredicate<T>>>;
  searchPredicate?:  (item: T, normalizedSearch: string) => boolean;
  debounceMs?:       number;
}

export interface UseApiFilterReturn<T> {
  items:            T[];
  loading:          boolean;
  inputValues:      InputValues;
  quickValues:      QuickValues;
  searchText:       string;
  setInput:         (key: string, value: string) => void;
  toggleQuick:      (key: string) => void;
  setSearchText:    (v: string) => void;
  hasActiveFilters: boolean;
  clearAll:         () => void;
}

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


// Hook
export function useApiFilter<T>({
  baseItems,
  inputs:           initialInputs,
  quickFilters:     initialQuick   = {},
  resolvers,
  localPredicates   = {},
  searchPredicate,
  debounceMs        = 400,
}: UseApiFilterOptions<T>): UseApiFilterReturn<T> {

  const [inputValues,     setInputValues]     = useState<InputValues>(initialInputs);
  const [quickValues,     setQuickValues]     = useState<QuickValues>(initialQuick);
  const [debouncedInputs, setDebouncedInputs] = useState<InputValues>(initialInputs);
  const [searchText,      setSearchText]      = useState("");
  const [apiItems,        setApiItems]        = useState<T[] | null>(null);
  const [loading,         setLoading]         = useState(false);

  const baseRef = useRef<T[]>(baseItems);
  useEffect(() => { baseRef.current = baseItems; }, [baseItems]);

  // Debounce text inputs
  useEffect(() => {
    const t = setTimeout(() => setDebouncedInputs({ ...inputValues }), debounceMs);
    return () => clearTimeout(t);
  }, [inputValues, debounceMs]);

  const hasActiveFilters = useMemo(() => {
    const anyInput  = Object.values(inputValues).some(v => v.trim() !== "");
    const anyQuick  = Object.values(quickValues).some(Boolean);
    const anySearch = searchText.trim() !== "";
    return anyInput || anyQuick || anySearch;
  }, [inputValues, quickValues, searchText]);

  // Resolver principal + pós-filtros locais
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const activeInputs = Object.entries(debouncedInputs).filter(([, v]) => v.trim() !== "");
    const activeQuicks = Object.entries(quickValues).filter(([, v]) => v);
    const totalActive  = activeInputs.length + activeQuicks.length;

    if (totalActive === 0) {
      setApiItems(null);
      return;
    }

    // Quick filters têm prioridade; entre inputs, prefere o que tem resolver
    const firstQuick        = activeQuicks[0];
    const inputWithResolver = activeInputs.find(([k]) => resolvers[k]);

    // Se nenhum campo ativo tem resolver -> pós-filtra localmente sobre base
    if (!firstQuick && !inputWithResolver) {
      let result = baseRef.current;
      for (const [k, v] of activeInputs) {
        const pred = localPredicates[k];
        if (pred) result = result.filter(item => pred(item, v));
      }
      setApiItems(result);
      return;
    }

    const [primaryKey, primaryValue] = firstQuick
      ? [firstQuick[0], ""]
      : [inputWithResolver![0], inputWithResolver![1]];

    const resolver = resolvers[primaryKey];
    if (!resolver) { setApiItems(null); return; }

    // Campos secundários com predicado local (todos os outros inputs ativos)
    const secondaryInputs = activeInputs.filter(
      ([k]) => k !== primaryKey,
    );

    let cancelled = false;
    setLoading(true);

    resolver(primaryValue)
      .then(result => {
        if (cancelled || !mountedRef.current) return;

        let filtered = result;
        for (const [key, val] of secondaryInputs) {
          const pred = localPredicates[key];
          if (pred && val.trim()) {
            filtered = filtered.filter(item => pred(item, val));
          }
        }

        setApiItems(filtered);
      })
      .catch(() => {
        if (cancelled || !mountedRef.current) return;
        setApiItems([]); 
      })
      .finally(() => {
        if (!cancelled && mountedRef.current) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputs, quickValues]);

  // Search global aplicado sobre o resultado final
  const items = useMemo(() => {
    const source = apiItems ?? baseRef.current;
    if (!searchText.trim() || !searchPredicate) return source;
    const norm = normalizeText(searchText);
    return source.filter(item => searchPredicate(item, norm));
    // baseItems na dep para reagir quando o pai re-fetcha sem filtros ativos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiItems, searchText, searchPredicate, baseItems]);


  // Setters
  const setInput = useCallback((key: string, value: string) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
    // Desativa quick filters ao digitar
    setQuickValues(prev =>
      Object.fromEntries(Object.keys(prev).map(k => [k, false])),
    );
  }, []);

  const toggleQuick = useCallback((key: string) => {
    setQuickValues(prev => {
      const activating = !prev[key];
      return Object.fromEntries(
        Object.keys(prev).map(k => [k, k === key ? activating : false]),
      );
    });
    // Limpa inputs de texto ao ativar quick filter
    setInputValues(prev =>
      Object.fromEntries(Object.keys(prev).map(k => [k, ""])),
    );
  }, []);

  const clearAll = useCallback(() => {
    setInputValues(initialInputs);
    setQuickValues(initialQuick);
    setDebouncedInputs(initialInputs);
    setSearchText("");
    setApiItems(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    loading,
    inputValues,
    quickValues,
    searchText,
    setInput,
    toggleQuick,
    setSearchText,
    hasActiveFilters,
    clearAll,
  };
}
