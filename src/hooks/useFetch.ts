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
    async (
      url: string,
      options?: RequestInit,
    ): Promise<RequestReturn<T>> => {
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

            message =
              errorData?.message ||
              errorData?.error ||
              message;
          } catch {
              console.warn("Não foi possível interpretar a resposta de erro como JSON");
          }

          throw new Error(message);
        }

        // evita erro em respostas vazias
        const contentType =
          response.headers.get("content-type");

        if (
          response.status !== 204 &&
          contentType?.includes("application/json")
        ) {
          json = await response.json();

          setData(json);
        }

        return { response, json };
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.name !== "AbortError"
        ) {
          setError(err.message);

          throw err;
        }

        throw err;
      } finally {
        setLoading(false);
      }
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
    error,
    loading,
    request,
  };
};

export default useFetch;