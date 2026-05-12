import { useNotification } from "../../../hooks/useNotification";
import { useFormContext } from "react-hook-form";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { criarColaborador } from "../../../services/ColaboradorService";

type CreateCoordProps = {
  onSuccess: () => void;
};

export type CreateCoordFormData = {
  nomeCompleto: string;
  email: string;
  cpf: string;
  dataNascimento: string;

  dataContratacao: string;
};

const CreateCoordForm = ({ onSuccess }: CreateCoordProps) => {
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useFormContext<CreateCoordFormData>();

  const onSubmit = async (data: CreateCoordFormData) => {
    if (!isDirty) return;

    try {
      const payload = {
        nomeCompleto: data.nomeCompleto,
        cpf: data.cpf.replace(/\D/g, ""),
        dataNascimento: data.dataNascimento,
        email: data.email,
        dataContratacao: data.dataContratacao,
      };

      await criarColaborador(payload);

      showNotification("Colaborador criado com sucesso!");

      onSuccess();
    } catch (error) {
      console.error(error);

      showNotification(
        error instanceof Error ? error.message : "Erro ao criar coordenador",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 p-2 max-h-[80vh] overflow-y-auto pr-2"
    >
      <h2 className="text-xl font-bold text-darkgray border-b pb-2">
        Novo Coordenador
      </h2>

      {/* DADOS PESSOAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome Completo"
          {...register("nomeCompleto", {
            required: "Obrigatório",
            pattern: {
              value: /^[A-Za-zÀ-ÿ\s]{3,}$/,
              message:
                "Nome deve conter apenas letras e no mínimo 3 caracteres",
            },
          })}
          error={errors.nomeCompleto?.message}
        />

        <Input
          label="CPF"
          {...register("cpf", {
            required: "Obrigatório",
            pattern: {
              value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
              message: "CPF inválido (use 000.000.000-00)",
            },
          })}
          error={errors.cpf?.message}
        />

        <Input
          label="Data de Nascimento"
          type="date"
          {...register("dataNascimento", { required: "Obrigatório" })}
          error={errors.dataNascimento?.message}
        />

        <Input
          label="Email"
          {...register("email", {
            required: "Obrigatório",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Email inválido",
            },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Data de Contratação"
          type="date"
          {...register("dataContratacao")}
        />
      </div>

      <Button
        type="submit"
        disabled={!isDirty}
        className={`${!isDirty && "opacity-50 cursor-not-allowed"}`}
      >
        Cadastrar
      </Button>
    </form>
  );
};

export default CreateCoordForm;
