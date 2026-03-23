import { useNotification } from "../../../hooks/useNotification";
import { useFormContext } from "react-hook-form";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { useCep } from "../../../hooks/useCep";

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

const CreateCoordForm = ({ onSuccess }: CreateCoordProps) => {
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useFormContext<CreateCoordFormData>();

  const { buscarCep } = useCep<CreateCoordFormData>(
    setValue,
    setError,
    clearErrors,
  );

  const onSubmit = (data: CreateCoordFormData) => {
    if (!isDirty) return;

    const payload = {
      colaborador: {
        nomeCompleto: data.nomeCompleto,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        email: data.email,
        sexo: { id: Number(data.idSexo) },
      },
      endereco: {
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        cidade: data.cidade,
        estado: data.estado,
        idTipoEndereco: 1,
      },
      dataContratacao: data.dataContratacao,
      nivelAcesso: data.nivelAcesso,
    };

    console.log("Payload CREATE:", payload);

    showNotification(`Coordenador criado com sucesso!`);
    onSuccess();
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

        <div className="flex flex-col">
          <label className="text-sm font-bold mb-1">Sexo</label>
          <select
            {...register("idSexo", { required: "Obrigatório" })}
            className="p-3 border rounded-md"
          >
            <option value="">Selecione</option>
            <option value="1">Masculino</option>
            <option value="2">Feminino</option>
            <option value="3">Outros</option>
          </select>
        </div>
      </div>

      {/* ENDEREÇO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="CEP"
          {...register("cep", {
            required: "Obrigatório",
            pattern: {
              value: /^\d{5}-?\d{3}$/,
              message: "CEP inválido",
            },
            onBlur: (e) => buscarCep(e.target.value),
          })}
          error={errors.cep?.message}
        />

        <Input
          label="Número"
          {...register("numero", {
            required: "Obrigatório",
          })}
        />

        <Input
          label="Logradouro"
          {...register("logradouro", {
            required: "Obrigatório",
            pattern: {
              value: /^[A-Za-zÀ-ÿ0-9\s.,-]{3,}$/,
              message: "Logradouro inválido",
            },
          })}
          error={errors.logradouro?.message}
        />

        <Input
          label="Cidade"
          readOnly
          {...register("cidade")}
          className="bg-gray-100"
        />

        <Input
          label="Estado"
          readOnly
          {...register("estado")}
          className="bg-gray-100"
        />

        {/* CONTRATO */}
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
