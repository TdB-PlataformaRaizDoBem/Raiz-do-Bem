import React from "react";

type RequestReturn<T> = {
  response: Response | null;
  json: T | null;
};

const useFetch = <T = unknown,>() => {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const abortRef = React.useRef<AbortController | null>(null);

  const request = React.useCallback(
    async (url: string, options?: RequestInit): Promise<RequestReturn<T>> => {
      let response: Response | null = null;
      let json: T | null = null;

      try {
        setError(null);
        setLoading(true);

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        response = await fetch(url, {
          ...options,
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          let message = "Erro na requisição";

          try {
            const errorData = await response.json();
            message = errorData?.message || message;
          } catch {
            // backend pode não retornar JSON
          }

          throw new Error(message);
        }

        json = await response.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }

      return { response, json };
    },
    [],
  );

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    data,
    loading,
    error,
    request,
  };
};

export default useFetch;
