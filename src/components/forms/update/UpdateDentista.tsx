import { useForm } from "react-hook-form";
import type { Dentista } from "../../../data/dentistasData";
import { useNotification } from "../../../hooks/useNotification";
import { useCep } from "../../../hooks/useCep";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";

type UpdateDentistaProps = {
  initialData: Dentista;
  onSuccess: () => void;
};

const UpdateDentista = ({ initialData, onSuccess }: UpdateDentistaProps) => {
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<Dentista>({
    defaultValues: initialData,
  });

  const { buscarCep } = useCep<Dentista>(setValue, setError, clearErrors);

  const onSubmit = (data: Dentista) => {
    if (!isDirty) return;

    const payload = {
      id: initialData.id,
      email: data.email,
      telefone: data.telefone,
      programa: data.programa,
      disponibilidade: data.disponibilidade,
      especialidades: data.especialidades,

      endereco: {
        cep: data.endereco.cep,
        logradouro: data.endereco.logradouro,
        numero: data.endereco.numero,
        cidade: data.endereco.cidade,
        estado: data.endereco.estado,
      },
    };

    console.log("Payload UPDATE Dentista:", payload);

    showNotification(`Dentista atualizado com sucesso!`);
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 p-2 max-h-[85vh] overflow-y-auto pr-2"
    >
      <h2 className="text-xl font-bold text-darkgray border-b pb-2">
        Editar Dentista
      </h2>

      {/* DADOS IMUTÁVEIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border-gray">
        <Input
          label="Nome Completo"
          {...register("nome")}
          readOnly
          className="bg-gray-200 cursor-not-allowed"
        />

        <Input
          label="CPF"
          {...register("cpf")}
          readOnly
          className="bg-gray-200 cursor-not-allowed"
        />

        <Input
          label="CRO"
          {...register("cro")}
          readOnly
          className="bg-gray-200 cursor-not-allowed"
        />
      </div>

      {/* EDITÁVEIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          label="Telefone"
          {...register("telefone", {
            required: "Obrigatório",
            pattern: {
              value: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
              message: "Telefone inválido",
            },
          })}
          error={errors.telefone?.message}
        />

        <Input
          label="Especialidade"
          {...register("especialidades", {
            required: "Obrigatório",
          })}
          error={errors.especialidades?.message}
        />

        <div className="flex flex-col">
          <label className="text-sm font-bold">Programa</label>
          <select
            {...register("programa")}
            className="p-3 border rounded-md"
          >
            <option value="Turma do Bem">Turma do Bem</option>
            <option value="Apolônias do Bem">Apolônias do Bem</option>
            <option value="Ambos">Ambos</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-bold">Disponibilidade</label>
          <select
            {...register("disponibilidade")}
            className="p-3 border rounded-md"
          >
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>
      </div>

      {/* ENDEREÇO */}
      <div className="border-t pt-4">
        <h3 className="font-bold mb-4">Endereço</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CEP"
            {...register("endereco.cep", {
              required: "Obrigatório",
              onBlur: (e) => buscarCep(e.target.value),
              pattern: {
                value: /^\d{5}-?\d{3}$/,
                message: "CEP inválido",
              },
            })}
            error={errors.endereco?.cep?.message}
          />

          <Input
            label="Número"
            {...register("endereco.numero", { required: "Obrigatório" })}
          />

          <Input
            label="Logradouro"
            {...register("endereco.logradouro")}
            readOnly
            className="bg-gray-100"
          />

          <Input
            label="Cidade"
            {...register("endereco.cidade")}
            readOnly
            className="bg-gray-100"
          />

          <Input
            label="Estado"
            {...register("endereco.estado")}
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="secondary" type="button" onClick={onSuccess}>
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={!isDirty}
          className={`${!isDirty && "opacity-50 cursor-not-allowed"}`}
        >
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default UpdateDentista;