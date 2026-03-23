// CreateDentista.tsx
import { FormProvider, useForm } from "react-hook-form";
import { type Dentista } from "../../../data/dentistasData";
import { useNotification } from "../../../hooks/useNotification";
import { CreateDentistaForm } from "./CreateDentistaForms";

interface CreateDentistaProps {
  onSuccess: () => void;
}

type DentistaFormValues = Omit<Dentista, "id" | "sexo" | "especialidades"> & {
  sexo: "Masculino" | "Feminino" | "Outro";
  especialidades: string;
};

export const CreateDentista = ({ onSuccess }: CreateDentistaProps) => {
  const { showNotification } = useNotification();

  const methods = useForm<DentistaFormValues>({
    mode: "onBlur",
    defaultValues: {
      nome: "",
      cro: "",
      cpf: "",
      email: "",
      telefone: "",
      sexo: "Feminino",
      especialidades: "",
      programa: "Ambos",
      disponibilidade: "Sim",
      endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        cidade: "",
        estado: "",
      },
    },
  });

  const onSubmit = (data: DentistaFormValues) => {
  const dentista: Dentista = {
    id: 0,
    nome: data.nome,
    cro: data.cro,
    cpf: data.cpf,
    email: data.email,
    telefone: data.telefone,
    sexo: {
      id: data.sexo === "Masculino" ? 1 : data.sexo === "Feminino" ? 2 : 3,
      tipo: data.sexo,
    },
    especialidades: data.especialidades
      .split(",")
      .map((desc, i) => ({ id: i + 1, descricao: desc.trim() })),
    programa: data.programa,
    disponibilidade: data.disponibilidade,
    endereco: { ...data.endereco },
  };

  console.log("CREATE Dentista:", dentista);
  showNotification(`Dentista criado com sucesso!`);
  onSuccess();
};

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <CreateDentistaForm onCancel={onSuccess} />
      </form>
    </FormProvider>
  );
};
