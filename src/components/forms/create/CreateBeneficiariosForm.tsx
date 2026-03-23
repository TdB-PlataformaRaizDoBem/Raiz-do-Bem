import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { useCep } from "../../../hooks/useCep";
import { type Beneficiario } from "../../../data/beneficiariosData";
import { validateAge } from "../../../hooks/validateAge";

interface BeneficiarioFormProps {
  onCancel: () => void;
  isEdit?: boolean;
}

export const BeneficiarioForm = ({
  onCancel,
  isEdit,
}: BeneficiarioFormProps) => {
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useFormContext<Beneficiario>();

  const { buscarCep } = useCep(setValue, setError, clearErrors);

  const selectedSexo = watch("sexo");
  const dataNasc = watch("data_nascimento");
  const idadeAtual = validateAge(dataNasc);

  useEffect(() => {
    if (selectedSexo === "Masculino") {
      setValue("programaSocial", "Turma do Bem");
    }
    if (idadeAtual > 0 && idadeAtual < 18) {
      setValue("programaSocial", "Turma do Bem");
    }
  }, [selectedSexo, idadeAtual, setValue]);

  return (
    <div className="flex flex-col gap-6 w-full max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar text-left">
      <header className="sticky top-0 bg-white pb-2 z-10">
        <h2 className="text-2xl font-bold text-darkgray font-fredoka">
          {isEdit ? "Editar Beneficiário" : "Novo Beneficiário"}
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Nome Completo"
          error={errors.nome?.message}
          {...register("nome", { required: "Nome é obrigatório" })}
        />

        <Input
          label="CPF"
          disabled={isEdit}
          error={errors.cpf?.message}
          {...register("cpf", {
            required: "CPF é obrigatório",
            pattern: {
              value: /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
              message: "Formato de CPF inválido",
            },
          })}
        />

        <Input
          label="Data de Nascimento"
          type="date"
          error={errors.data_nascimento?.message}
          {...register("data_nascimento", {
            required: "Data obrigatória",
            validate: (value) => validateAge(value) >= 0 || "Data inválida",
          })}
        />

        <Input
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register("email", {
            required: "E-mail é obrigatório",
            pattern: { value: /^\S+@\S+$/i, message: "E-mail inválido" },
          })}
        />

        <Input
          label="Telefone"
          error={errors.telefone?.message}
          {...register("telefone", { required: "Telefone é obrigatório" })}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-darkgray">Sexo</label>
          <select
            {...register("sexo")}
            className={`border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-primary transition-all ${errors.sexo ? "border-red-500" : "border-gray-200"}`}
          >
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
            <option value="Outro">Outro</option>
          </select>
          {errors.sexo && (
            <span className="text-xs text-red-500">{errors.sexo.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-darkgray">Programa</label>
          <select
            {...register("programaSocial")}
            className="border rounded-xl p-3 bg-white border-gray-200 outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="Turma do Bem">Turma do Bem (Jovens)</option>
            {selectedSexo !== "Masculino" && idadeAtual >= 18 && (
              <option value="Apolônias do Bem">
                Apolônias do Bem (Mulheres)
              </option>
            )}
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-darkgray font-fredoka mb-4">
          Endereço
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input
            label="CEP"
            error={errors.cep?.message}
            {...register("cep", {
              required: "CEP obrigatório",
              onBlur: (e) => buscarCep(e.target.value),
            })}
          />
          <Input
            label="Número"
            error={errors.numero?.message}
            {...register("numero", { required: "Obrigatório" })}
          />
          <Input
            label="Logradouro"
            error={errors.logradouro?.message}
            {...register("logradouro", { required: "Obrigatório" })}
          />
          <Input
            label="Cidade"
            error={errors.cidade?.message}
            {...register("cidade", { required: "Obrigatório" })}
          />
          <Input
            label="Estado"
            error={errors.estado?.message}
            {...register("estado", { required: "Obrigatório" })}
          />
        </div>
      </div>

      <footer className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-auto flex gap-3 justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isEdit ? "Salvar Alterações" : "Cadastrar Beneficiário"}
        </Button>
      </footer>
    </div>
  );
};
