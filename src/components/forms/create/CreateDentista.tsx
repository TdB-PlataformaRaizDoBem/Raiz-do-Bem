import { FormProvider, useForm } from "react-hook-form";
import { useNotification } from "../../../hooks/useNotification";
import { CreateDentistaForm } from "./CreateDentistaForms";
import { criarDentista } from "../../../services/DentistaService";

export type SexoAPI = "M" | "F" | "O";

interface CreateDentistaProps {
  onSuccess: () => void;
}

const formatCRO = (value: string) => {
  const cleaned = value.trim().toUpperCase();
  if (cleaned.startsWith("CRO-")) return cleaned;
  // caso usuário digite "SP-12345" ou "12345-SP"
  return `CRO-${cleaned}`;
};

export type DentistaFormValues = {
  nomeCompleto: string;
  croDentista: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: "Masculino" | "Feminino" | "Outro";
  disponivel: "S" | "N";

  categoria: "COORDENADOR" | "DENTISTA";

  endereco: {
    cep: string;
    numero: string;
  };
};

const SEXO_MAP: Record<DentistaFormValues["sexo"], SexoAPI> = {
  Masculino: "M",
  Feminino: "F",
  Outro: "O",
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
      sexo: "Feminino",
      disponivel: "S",
      categoria: "DENTISTA",

      endereco: {
        cep: "",
        numero: "",
      },
    },
  });

  const onSubmit = async (data: DentistaFormValues) => {
    try {
      const payload = {
        croDentista: formatCRO(data.croDentista),
        cpf: data.cpf,
        nomeCompleto: data.nomeCompleto,
        sexo: SEXO_MAP[data.sexo],
        email: data.email,
        telefone: data.telefone,
        disponivel: data.disponivel,
        categoria: data.categoria,
        endereco: {
          cep: data.endereco.cep,
          numero: data.endereco.numero,
          tipoEndereco: "PROFISSIONAL",
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