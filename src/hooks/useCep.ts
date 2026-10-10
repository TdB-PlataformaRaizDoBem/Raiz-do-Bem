import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import type { FieldValues, Path, PathValue } from "react-hook-form";
import useFetch from "../hooks/useFetch";

type ViaCepResponse = {
  cep: string;
  logradouro?: string;
  bairro?: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

/** Preenche rua/bairro/cidade/uf via ViaCEP quando o CEP tem 8 dígitos. Exige `<FormProvider>`. */
export function useCep<T extends FieldValues>(cep: string, prefix: string = "") {
  const { setValue, setError, clearErrors } = useFormContext<T>();
  const { request, loading } = useFetch<ViaCepResponse>();
  const isFirstRender = useRef(true);

  const applyField = (campo: string, valor: string) => {
    setValue(
      (prefix ? `${prefix}.${campo}` : campo) as Path<T>,
      valor as PathValue<T, Path<T>>,
      { shouldValidate: true }
    );
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    const cepField = (prefix ? `${prefix}.cep` : "cep") as Path<T>;

    (async () => {
      let json: ViaCepResponse | null;
      try {
        ({ json } = await request(`https://viacep.com.br/ws/${cepLimpo}/json/`));
      } catch (err) {
        // Consulta substituída por outra (CEP digitado de novo): não é erro para o usuário.
        if (err instanceof Error && err.name === "AbortError") return;
        // ViaCEP fora do ar / sem internet: avisa em vez de deixar a promise rejeitada solta.
        setError(cepField, {
          type: "manual",
          message: "Não foi possível consultar o CEP agora. Tente novamente.",
        });
        return;
      }

      if (!json) return;

      if (json.erro) {
        setError(cepField, {
          type: "manual",
          message: "CEP não encontrado. Verifique ou preencha manualmente.",
        });
        return;
      }

      applyField("rua", json.logradouro ?? "");
      applyField("bairro", json.bairro ?? "");
      applyField("cidade", json.localidade);
      applyField("uf", json.uf);
      clearErrors(cepField);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep]);

  return { loading };
}