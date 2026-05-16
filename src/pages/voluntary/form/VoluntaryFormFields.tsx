import { useFormContext } from "react-hook-form";
import { useCep } from "../../../hooks/useCep";
import Input from "../../../components/formElements/Input";

export interface VoluntaryFormValues {
  nomeCompleto: string;
  croDentista: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: "Masculino" | "Feminino" | "Outro";
  categoria: "DENTISTA" | "COORDENADOR";
  disponivel: "S" | "N";
  endereco: {
    cep: string;
    numero: string;
  };
}

const REGEX = {
  nome: /^[A-Za-zÀ-ÿ\s]{3,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefone: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
  cro: /^(CRO[-/ ]?)?[A-Za-z]{2}[-/ ]?\d{4,7}$|^\d{4,7}[-/ ]?[A-Za-z]{2}$/,
  cep: /^\d{5}-?\d{3}$/,
};

const selectClass =
  "h-[48px] rounded-md bg-gray-200 px-3 text-black border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange transition";

const VoluntaryFormFields = () => {
  const {
    register,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<VoluntaryFormValues>();

  const { buscarCep } = useCep<VoluntaryFormValues>(
    setValue,
    setError,
    clearErrors,
  );
  const req = "Campo obrigatório";

  return (
    <div className="w-full mx-auto px-4">
      {/* Dados pessoais */}
      <h2 className="text-2xl font-bold mt-[80px] mb-10 border-b pb-3">
        INFORMAÇÕES PESSOAIS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-[30px]">
        <Input
          label="Nome Completo:"
          {...register("nomeCompleto", {
            required: req,
            pattern: { value: REGEX.nome, message: "Nome inválido" },
          })}
          error={errors.nomeCompleto?.message}
        />

        <Input
          label="CPF:"
          placeholder="000.000.000-00"
          {...register("cpf", {
            required: req,
            pattern: { value: REGEX.cpf, message: "CPF inválido" },
          })}
          error={errors.cpf?.message}
        />

        <Input
          label="Email:"
          {...register("email", {
            required: req,
            pattern: { value: REGEX.email, message: "Email inválido" },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Telefone:"
          placeholder="(11) 99999-9999"
          {...register("telefone", {
            required: req,
            pattern: { value: REGEX.telefone, message: "Telefone inválido" },
          })}
          error={errors.telefone?.message}
        />

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Sexo:</label>
          <select
            {...register("sexo", { required: req })}
            className={`${selectClass} ${errors.sexo ? "border-red-600" : ""}`}
          >
            <option value="">Selecione</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
            <option value="Outro">Outro</option>
          </select>
          {errors.sexo && (
            <span className="text-red-500 text-xs mt-1">
              {errors.sexo.message}
            </span>
          )}
        </div>
      </div>

      {/* Dados profissionais */}
      <h2 className="text-2xl font-bold mt-[70px] mb-10 border-b pb-3">
        INFORMAÇÕES PROFISSIONAIS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-[30px]">
        <Input
          label="CRO:"
          placeholder="SP-12345"
          {...register("croDentista", {
            required: req,
            pattern: {
              value: REGEX.cro,
              message: "Formato inválido (ex: SP-12345)",
            },
          })}
          error={errors.croDentista?.message}
        />
      </div>

      {/* Endereço do consultório */}
      <h2 className="text-2xl font-bold mt-[70px] mb-10 border-b pb-3">
        ENDEREÇO DO CONSULTÓRIO
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-[30px]">
        <Input
          label="CEP:"
          {...register("endereco.cep", {
            required: req,
            pattern: { value: REGEX.cep, message: "CEP inválido" },
            onBlur: (e) => buscarCep(e.target.value),
          })}
          error={errors.endereco?.cep?.message}
        />

        <Input
          label="Número:"
          {...register("endereco.numero", {
            required: req,
          })}
          error={errors.endereco?.numero?.message}
        />
      </div>
    </div>
  );
};

export default VoluntaryFormFields;
