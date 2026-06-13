import { useEffect } from "react";
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

export function useCep<T extends FieldValues>(cep: string, prefix: string = "") {
  const { setValue, setError, clearErrors } = useFormContext<T>();
  const { request, loading } = useFetch<ViaCepResponse>();

  const applyField = (campo: string, valor: string) => {
    setValue(
      (prefix ? `${prefix}.${campo}` : campo) as Path<T>,
      valor as PathValue<T, Path<T>>,
      { shouldValidate: true }
    );
  };

  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    const cepField = (prefix ? `${prefix}.cep` : "cep") as Path<T>;

    (async () => {
      const { json } = await request(`https://viacep.com.br/ws/${cepLimpo}/json/`);

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