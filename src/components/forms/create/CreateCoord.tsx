import { FormProvider, useForm } from "react-hook-form";
import CreateCoordForm from "./CreateCoordForm";

type CreateCoordProps = {
  onSuccess: () => void;
};

export type CreateCoordFormData = {
  nomeCompleto: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  idSexo: number;

  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;

  dataContratacao: string;
  nivelAcesso: "admin" | "coord";
};

export const CreateCoord = ({ onSuccess }: CreateCoordProps) => {
  const methods = useForm<CreateCoordFormData>({
    defaultValues: {
      dataContratacao: new Date().toISOString().split("T")[0],
      nivelAcesso: "coord",
    },
  });

  return (
    <FormProvider {...methods}>
      <CreateCoordForm onSuccess={onSuccess} />
    </FormProvider>
  );
};