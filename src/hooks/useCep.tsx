import { useFormContext } from "react-hook-form";
import type { FieldValues, Path, PathValue } from "react-hook-form";
import useFetch from "../hooks/useFetch";

type ViaCepResponse = {
  cep: string;
  localidade: string;
  uf: string;
  logradouro?: string;
  erro?: boolean;
};

export const useCep = <T extends FieldValues>() => {
  const { setValue, setError, clearErrors } = useFormContext<T>();
  const { request, loading } = useFetch<ViaCepResponse>();

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    const { json } = await request(
      `https://viacep.com.br/ws/${cepLimpo}/json/`
    );

    if (!json) return;

    if (json.erro) {
      setError("cep" as Path<T>, {
        type: "manual",
        message: "Ops! Não localizamos esse CEP. Confira se digitou corretamente. Caso tenha certeza digite o endereço manualmente.",
      });
      return;
    }

    setValue(
      "cidade" as Path<T>,
      json.localidade as PathValue<T, Path<T>>,
      { shouldValidate: true }
    );

    setValue(
      "estado" as Path<T>,
      json.uf as PathValue<T, Path<T>>,
      { shouldValidate: true }
    );

    setValue(
      'logradouro' as Path<T>,
      json.logradouro as PathValue<T, Path<T>>,
      { shouldValidate: true}
    )

    clearErrors("cep" as Path<T>);
  };

  return { buscarCep, loading };
};