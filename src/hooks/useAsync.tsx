import { useState, useEffect, useCallback, useRef } from "react";
 
export type AsyncState<T> =
  | { status: "idle";    data: null;  error: null;   loading: false }
  | { status: "loading"; data: null;  error: null;   loading: true  }
  | { status: "success"; data: T;     error: null;   loading: false }
  | { status: "error";   data: null;  error: string; loading: false };
 
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    status:  "idle",
    data:    null,
    error:   null,
    loading: false,
  });
 
  // Evita atualizar estado em componente desmontado
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
 
  const execute = useCallback(async () => {
    setState({ status: "loading", data: null, error: null, loading: true });
 
    try {
      const result = await fn();
      if (!mountedRef.current) return;
      setState({ status: "success", data: result, error: null, loading: false });
    } catch (err) {
      if (!mountedRef.current) return;
      const message =
        err instanceof Error ? err.message : "Erro desconhecido";
      setState({ status: "error", data: null, error: message, loading: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
 
  useEffect(() => { execute(); }, [execute]);
 
  return { ...state, refetch: execute };
}