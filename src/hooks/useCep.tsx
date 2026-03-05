import { useFormContext } from "react-hook-form"

export const useCep = () => {
  const {setValue, setError, clearErrors} = useFormContext();

  const buscarCep = async (cep : string) => {
    const cepClear = cep.replace(/\D/g, "");

    if (cepClear.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepClear}/json/`);
      const data = await response.json()

      if (data.error) {
        setError("cep", { type: "manual", message: "CEP não encontrado na busca automática." });
        return;
      }

      setValue("cidade", data.localidade, { shouldValidate: true });
      setValue("estado", data.uf, { shouldValidate: true });
      clearErrors("cep");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setError("cep", { type: "manual", message: "Erro ao consultar o CEP. Verifique se está correto e preencha manualmente" });
    }
  }

  return { buscarCep };
}