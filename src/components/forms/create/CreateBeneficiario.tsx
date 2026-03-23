import { BeneficiarioForm } from "./CreateBeneficiariosForm";
import { type Beneficiario } from "../../../data/beneficiariosData";
import { useNotification } from "../../../hooks/useNotification";
import { FormProvider, useForm } from "react-hook-form";

interface CreateBeneficiarioProps {
  onSuccess: () => void;
  initialData?: Beneficiario;
}

export const CreateBeneficiario = ({ onSuccess, initialData }: CreateBeneficiarioProps) => {
  const isEdit = !!initialData?.id;
  const { showNotification } = useNotification();

  const methods = useForm<Beneficiario>({
    defaultValues: initialData || {
      cpf: "",
      nome: "",
      email: "",
      telefone: "",
      sexo: "Feminino",
      dataNascimento: "",
      programaSocial: "Turma do Bem",
      cep: "",
      logradouro: "",
      numero: "",
      cidade: "",
      estado: "",
    },
  });

  const onSubmit = async (data: Omit<Beneficiario, 'id'>) => {
    try {
      showNotification(`Beneficiário ${data.nome} ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess();
    } catch {
      showNotification("Erro ao processar a solicitação");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <BeneficiarioForm onCancel={onSuccess} isEdit={isEdit} />
      </form>
    </FormProvider>
  );
};