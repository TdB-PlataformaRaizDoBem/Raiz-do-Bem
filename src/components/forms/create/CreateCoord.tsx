import { FormProvider, useForm } from "react-hook-form";
import CreateCoordForm from "./CreateCoordForm";

type CreateCoordProps = {
  onSuccess: () => void;
};

export type CreateCoordFormData = {
  nome: string;
  email: string;
  cep: string;
  cidade: string;
  estado: string;
  data_contratacao: string;
};

export const CreateCoord = ({ onSuccess }: CreateCoordProps) => {
  const methods = useForm<CreateCoordFormData>({
    defaultValues: {
      data_contratacao: new Date().toLocaleDateString("pt-br"),
    },
  });

  return (
    <FormProvider {...methods}>
      <CreateCoordForm onSuccess={onSuccess} />
    </FormProvider>
  );
};