import { FormProvider, useForm } from "react-hook-form";
import { useNotification } from "../../../hooks/useNotification";
import { criarBeneficiario } from "../../../services/Beneficiarioservice";
import { BeneficiarioForm } from "./CreateBeneficiariosForm";

// Tipo local do formulário (campos que o form coleta)
export interface BeneficiarioFormValues {
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  sexo: "Feminino" | "Masculino" | "Outro";
  programaSocial: string;
  idPedidoAjuda?: number;
  // Endereço — preenchido via busca CEP
  cep: string;
  logradouro: string;
  numero: string;
  bairro?: string;
  cidade: string;
  estado: string;
}

interface CreateBeneficiarioProps {
  onSuccess: () => void;
}

export const CreateBeneficiario = ({ onSuccess }: CreateBeneficiarioProps) => {
  const { showNotification } = useNotification();

  const methods = useForm<BeneficiarioFormValues>({
    defaultValues: {
      cpf: "",
      nomeCompleto: "",
      email: "",
      telefone: "",
      sexo: "Feminino",
      dataNascimento: "",
      programaSocial: "Turma do Bem",
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });

  const onSubmit = async (data: BeneficiarioFormValues) => {
    try {
      await criarBeneficiario({
        cpf: data.cpf,
        nomeCompleto: data.nomeCompleto,
        dataNascimento: data.dataNascimento,
        telefone: data.telefone,
        email: data.email,
        idPedidoAjuda: data.idPedidoAjuda,
      });
      showNotification(`Beneficiário ${data.nomeCompleto} criado com sucesso!`);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar beneficiário";
      showNotification(msg);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <BeneficiarioForm onCancel={onSuccess} isEdit={false} />
      </form>
    </FormProvider>
  );
};
