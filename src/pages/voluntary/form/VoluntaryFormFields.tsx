import { useFormContext } from "react-hook-form";
import { type DentistFormData } from "./VoluntaryFormData";
import { useCep } from "../../../hooks/useCep";
import Input from "../../../components/formElements/Input";

const VoluntaryFormFields = () => {
  const {
    register,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<DentistFormData>();

  const { buscarCep } = useCep<DentistFormData>(
    setValue,
    setError,
    clearErrors,
  );

  return (
    <div className="w-full mx-auto px-4">
      {/* dados pessoais */}
      <h2 className="text-2xl font-bold mt-[80px] mb-10 border-b pb-3">
        INFORMAÇÕES PESSOAIS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-[30px]">
        <Input
          label="Nome Completo:"
          {...register("nomeCompleto", {
            required: "Nome é obrigatório",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
          })}
          error={errors.nomeCompleto?.message}
        />

        <Input
          label="CPF:"
          placeholder="000.000.000-00"
          {...register("cpf", {
            required: "CPF obrigatório",
            pattern: {
              value: /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
              message: "CPF inválido",
            },
          })}
          error={errors.cpf?.message}
        />

        <Input
          label="Data de Nascimento:"
          type="date"
          {...register("dataNascimento", {
            required: "Data obrigatória",
          })}
          error={errors.dataNascimento?.message}
        />

        <Input
          label="Email:"
          {...register("email", {
            required: "Email obrigatório",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Email inválido",
            },
          })}
          error={errors.email?.message}
        />

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Sexo:</label>

          <select
            {...register("idSexo", { required: "Selecione o sexo" })}
            className={`
              h-[48px]
              rounded-md
              bg-gray-200
              px-3
              text-black
              border border-gray-200
              focus:outline-none
              focus:ring-2 focus:ring-orange
              transition
              ${errors.idSexo ? "border-red-600" : ""}
            `}
          >
            <option value="">Selecione</option>
            <option value="1">Masculino</option>
            <option value="2">Feminino</option>
            <option value="3">Outros</option>
          </select>

          {errors.idSexo && (
            <span className="text-red-500 text-xs mt-1">
              {errors.idSexo.message}
            </span>
          )}
        </div>
      </div>

      {/* dados do profissional*/}
      <h2 className="text-2xl font-bold mt-[70px] mb-10 border-b pb-3">
        INFORMAÇÕES PROFISSIONAIS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-[30px]">
        <Input
          label="CRO:"
          {...register("cro", {
            required: "CRO obrigatório",
            pattern: {
              value: /^\d{2,6}-[A-Z]{2}$/i,
              message: "Formato inválido (12345-SP)",
            },
          })}
          error={errors.cro?.message}
        />

        <Input
          label="Especialidade:"
          {...register("especialidades", {
            required: "Informe a especialidade",
          })}
          error={errors.especialidades?.message}
        />
      </div>

      {/* Endereço */}
      <h2 className="text-2xl font-bold mt-[70px] mb-10 border-b pb-3">
        ENDEREÇO DO CONSULTÓRIO
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-[30px]">
        <Input
          label="CEP:"
          {...register("cep", {
            required: "CEP obrigatório",
            onBlur: (e) => buscarCep(e.target.value),
            pattern: {
              value: /^\d{5}-?\d{3}$/,
              message: "CEP inválido",
            },
          })}
          error={errors.cep?.message}
        />

        <Input
          label="Logradouro:"
          {...register("logradouro", {
            required: "Logradouro obrigatório",
          })}
          error={errors.logradouro?.message}
        />

        <Input
          label="Número:"
          {...register("numero", {
            required: "Número obrigatório",
          })}
          error={errors.numero?.message}
        />

        <Input
          label="Cidade:"
          readOnly
          {...register("cidade")}
          className="bg-gray-200/70 cursor-not-allowed"
        />

        <Input
          label="Estado:"
          readOnly
          {...register("estado")}
          className="bg-gray-200/70 cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default VoluntaryFormFields;
