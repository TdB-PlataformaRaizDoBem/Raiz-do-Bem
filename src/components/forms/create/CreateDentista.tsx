import { FormProvider, useForm } from "react-hook-form";
import { useNotification } from "../../../hooks/useNotification";
import { CreateDentistaForm } from "./CreateDentistaForms";
import { criarDentista } from "../../../services/DentistaService";
interface CreateDentistaProps {
  onSuccess: () => void;
}

export type DentistaFormValues = {
  nomeCompleto: string;
  croDentista: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: "M" | "F" | "O";
  disponivel: "S" | "N";

  categoria: "COORDENADOR" | "CLINICO";

  endereco: {
    cep: string;
    numero: string;
  };
};

export const CreateDentista = ({ onSuccess }: CreateDentistaProps) => {
  const { showNotification } = useNotification();

  const methods = useForm<DentistaFormValues>({
    mode: "onBlur",
    defaultValues: {
      nomeCompleto: "",
      croDentista: "",
      cpf: "",
      email: "",
      telefone: "",
      sexo: "F",
      disponivel: "S",
      categoria: "CLINICO",

      endereco: {
        cep: "",
        numero: "",
      },
    },
  });

  const onSubmit = async (data: DentistaFormValues) => {
    const croLimpo = data.croDentista
      .toUpperCase()
      .replace(/^CRO[-/ ]?/, "")
      .trim();

    try {
      const payload = {
        croDentista: croLimpo,
        cpf: data.cpf.replace(/\D/g, ""),
        nomeCompleto: data.nomeCompleto,
        sexo: data.sexo,
        email: data.email,
        telefone: data.telefone.replace(/\D/g, ""),
        disponivel: data.disponivel,
        categoria: data.categoria,
        endereco: {
          cep: data.endereco.cep.replace(/\D/g, ""),
          numero: data.endereco.numero,
        },
      };

      await criarDentista(payload);

      showNotification(
        `Dentista ${data.nomeCompleto} cadastrado com sucesso!`,
        "success"
      );

      onSuccess();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao cadastrar dentista";

      showNotification(msg, "error");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <CreateDentistaForm onCancel={onSuccess} />
      </form>
    </FormProvider>
  );
};