import { FormProvider, useForm } from "react-hook-form";
import { useNotification } from "../../../hooks/useNotification";
import { criarBeneficiario } from "../../../services/Beneficiarioservice";
import { BeneficiarioForm } from "./CreateBeneficiariosForm";

export interface BeneficiarioFormValues {
  idPedidoAjuda: number;
  idProgramaSocial: number;
}

interface CreateBeneficiarioProps {
  onSuccess: () => void;
}

export const CreateBeneficiario = ({ onSuccess }: CreateBeneficiarioProps) => {
  const { showNotification } = useNotification();

  const methods = useForm<BeneficiarioFormValues>({
    defaultValues: {
      idPedidoAjuda: 0,
      idProgramaSocial: 0,
    },
  });

  const onSubmit = async (data: BeneficiarioFormValues) => {
    try {
      await criarBeneficiario({
        idPedidoAjuda: data.idPedidoAjuda,
        idProgramaSocial: data.idProgramaSocial,
      });
      showNotification("Beneficiário criado com sucesso!", "success");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar beneficiário";
      showNotification(msg, "error");
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
