import { useFormContext } from "react-hook-form";
import type { FieldValues, Path, PathValue } from "react-hook-form";

export const useCep = <T extends FieldValues>() => {
  const { setValue, setError, clearErrors } = useFormContext<T>();

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError("cep" as Path<T>, { 
          type: "manual", 
          message: "CEP não encontrado." 
        });
        return;
      }
      
      setValue(
        "cidade" as Path<T>, 
        data.localidade as PathValue<T, Path<T>>, 
        { shouldValidate: true }
      );
      
      setValue(
        "estado" as Path<T>, 
        data.uf as PathValue<T, Path<T>>, 
        { shouldValidate: true }
      );
      
      clearErrors("cep" as Path<T>);
      
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setError("cep" as Path<T>, { 
        type: "manual", 
        message: "Erro ao consultar o CEP." 
      });
    }
  };

  return { buscarCep };
};