import useFetch from "../hooks/useFetch";
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors,
} from "react-hook-form";

type ViaCepResponse = {
  cep: string;
  localidade: string;
  uf: string;
  logradouro?: string;
  erro?: boolean;
};

export const useCep = <T extends FieldValues>(
  setValue: UseFormSetValue<T>,
  setError: UseFormSetError<T>,
  clearErrors: UseFormClearErrors<T>,
  prefix: string = ""
) => {
  const { request, loading } = useFetch<ViaCepResponse>();

  const field = (name: string): Path<T> => {
    return (prefix ? `${prefix}.${name}` : name) as Path<T>;
  };

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    const { json } = await request(
      `https://viacep.com.br/ws/${cepLimpo}/json/`
    );

    if (!json) return;

    if (json.erro) {
      setError(field("cep"), {
        type: "manual",
        message: "CEP não encontrado. Verifique ou preencha manualmente.",
      });
      return;
    }

    setValue(field("cidade"), json.localidade as PathValue<T, Path<T>>, { shouldValidate: true });
    setValue(field("estado"), json.uf as PathValue<T, Path<T>>, { shouldValidate: true });
    setValue(field("logradouro"), (json.logradouro || "") as PathValue<T, Path<T>>, { shouldValidate: true });

    clearErrors(field("cep"));
  };

  return { buscarCep, loading };
};