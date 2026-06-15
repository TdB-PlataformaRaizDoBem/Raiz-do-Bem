import { FormProvider, useForm } from "react-hook-form";
import CreateCoordForm from "./CreateCoordForm";

export type CreateCoordFormData = {
  nomeCompleto: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  dataContratacao: string;
  role: "ADMIN" | "COLABORADOR";
  senha: string;
};

type CreateCoordProps = {
  onSuccess: () => void;
};

export const CreateCoord = ({ onSuccess }: CreateCoordProps) => {
  const methods = useForm<CreateCoordFormData>({
    defaultValues: {
      dataContratacao: new Date().toISOString().split("T")[0],
      role: "COLABORADOR",
    },
  });

  return (
    <FormProvider {...methods}>
      <CreateCoordForm onSuccess={onSuccess} />
    </FormProvider>
  );
};
