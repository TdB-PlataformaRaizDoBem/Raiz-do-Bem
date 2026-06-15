import { useNotification } from "../../../hooks/useNotification";
import { useFormContext } from "react-hook-form";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { criarColaborador } from "../../../services/ColaboradorService";
import type { CreateCoordFormData } from "./CreateCoord";

type CreateCoordProps = {
  onSuccess: () => void;
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
      await criarColaborador({
        nomeCompleto: data.nomeCompleto,
        cpf: data.cpf.replace(/\D/g, ""),
        dataNascimento: data.dataNascimento,
        email: data.email,
        dataContratacao: data.dataContratacao,
        role: data.role,
        senha: data.senha,
      });

      showNotification("Colaborador criado com sucesso!");
      onSuccess();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Erro ao criar colaborador",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 p-2 max-h-[80vh] overflow-y-auto pr-2"
    >
      <h2 className="text-xl font-bold text-darkgray border-b pb-2">
        Novo Colaborador
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome Completo"
          {...register("nomeCompleto", {
            required: "Obrigatório",
            pattern: {
              value: /^[A-Za-zÀ-ÿ\s]{3,}$/,
              message: "Nome deve conter apenas letras e no mínimo 3 caracteres",
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

        {/* Nível de acesso */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-darkgray">
            Nível de Acesso <span className="text-red-500">*</span>
          </label>
          <select
            {...register("role", { required: "Obrigatório" })}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-darkgray focus:outline-none focus:ring-2 focus:ring-lightgreen/50 focus:border-lightgreen transition"
          >
            <option value="COLABORADOR">Colaborador</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* Senha inicial */}
        <Input
          label="Senha Inicial"
          type="password"
          {...register("senha", {
            required: "Obrigatório",
            minLength: {
              value: 8,
              message: "A senha deve ter no mínimo 8 caracteres",
            },
          })}
          error={errors.senha?.message}
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
