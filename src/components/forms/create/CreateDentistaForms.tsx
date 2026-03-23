import { useFormContext } from "react-hook-form";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { type Dentista } from "../../../data/dentistasData";
import { useCep } from "../../../hooks/useCep";

interface DentistaFormFieldsProps {
  onCancel: () => void;
  isEdit?: boolean;
}

export const CreateDentistaForm = ({
  onCancel,
  isEdit,
}: DentistaFormFieldsProps) => {
  const {
    register,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<Dentista>();
  const requiredMsg = "Este campo é obrigatório";
  const { buscarCep } = useCep(setValue, setError, clearErrors);

  return (
    <div className="flex flex-col h-[85vh] md:h-auto max-w-3xl w-full text-left">
      <h2 className="text-2xl font-bold font-fredoka mb-6 text-darkgray">
        {isEdit ? "Editar Dentista" : "Cadastrar Dentista"}
      </h2>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Nome Completo"
            {...register("nome", { required: requiredMsg })}
            error={errors.nome?.message}
          />
          <Input
            label="CRO"
            {...register("cro", { required: requiredMsg })}
            error={errors.cro?.message}
          />
          <Input
            label="CPF"
            {...register("cpf", { required: requiredMsg })}
            disabled={isEdit}
            error={errors.cpf?.message}
          />
          <Input
            label="E-mail"
            type="email"
            {...register("email", { required: requiredMsg })}
            error={errors.email?.message}
          />
          <Input
            label="Telefone"
            {...register("telefone", { required: requiredMsg })}
            error={errors.telefone?.message}
          />
          <Input
            label="Especialidade"
            {...register("especialidade", { required: requiredMsg })}
            error={errors.especialidade?.message}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-darkgray">Sexo</label>
            <select
              {...register("sexo", { required: requiredMsg })}
              className="border border-gray-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-darkgray">Programa</label>
            <select
              {...register("programa", { required: requiredMsg })}
              className="border border-gray-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Turma do Bem">Turma do Bem</option>
              <option value="Apolônias do Bem">Apolônias do Bem</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-darkgray mb-4 font-fredoka">
            Endereço do Consultório
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CEP"
                {...register("cep", {
                  required: requiredMsg,
                  onBlur: (e) => buscarCep(e.target.value),
                })}
                error={errors.cep?.message}
              />
              <Input
                label="Número"
                {...register("numero", { required: requiredMsg })}
                error={errors.numero?.message}
              />
            </div>
            <Input
              label="Logradouro"
              {...register("logradouro", { required: requiredMsg })}
              error={errors.logradouro?.message}
            />
            <Input
              label="Cidade"
              {...register("cidade", { required: requiredMsg })}
              error={errors.cidade?.message}
            />
            <Input
              label="Estado"
              {...register("estado", { required: requiredMsg })}
              error={errors.estado?.message}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t sticky bottom-0 bg-white">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Salvar
        </Button>
      </div>
    </div>
  );
};
