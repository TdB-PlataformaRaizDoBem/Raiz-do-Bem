import { FormProvider, useForm } from "react-hook-form";
import { type Dentista } from "../../../data/dentistasData";
import { useNotification } from "../../../hooks/useNotification";
import { CreateDentistaForm } from "./CreateDentistaForms"; // Componente de campos

interface CreateDentistaProps {
  onSuccess: () => void;
  initialData?: Dentista;
}

export const CreateDentista = ({ onSuccess, initialData }: CreateDentistaProps) => {
  const isEdit = !!initialData?.id;
  const { showNotification } = useNotification();

  const methods = useForm<Dentista>({
    defaultValues: initialData || {
      nome: "",
      cro: "",
      cpf: "",
      email: "",
      telefone: "",
      sexo: "Feminino",
      especialidade: "",
      disponibilidade: "S",
      programa: "Ambos",
      cep: "",
      logradouro: "",
      numero: "",
      cidade: "",
      estado: "",
    },
  });

  const onSubmit = async (data: Dentista) => {
    try {
      showNotification(`Dentista ${data.nome} ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess();
    } catch {
      showNotification("Erro ao processar a solicitação");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <CreateDentistaForm onCancel={onSuccess} isEdit={isEdit} />
      </form>
    </FormProvider>
  );
};