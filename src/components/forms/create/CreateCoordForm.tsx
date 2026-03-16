import { useNotification } from "../../../hooks/useNotification";
import { useFormContext } from "react-hook-form"; // Hook importante aqui
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { useCep } from "../../../hooks/useCep";

type CreateCoordProps = {
  onSuccess: () => void;
};

export type CreateCoordFormData = {
  nome: string;
  email: string;
  cep: string;
  cidade: string;
  estado: string;
  data_contratacao: string;
};

const CreateCoordForm = ({ onSuccess }: CreateCoordProps) => {
  const { showNotification } = useNotification();

  const { register, handleSubmit, formState: { errors } } = useFormContext<CreateCoordFormData>();
  const { buscarCep } = useCep();

  const onSubmit = (data : CreateCoordFormData) => {
    showNotification(`Coordenador ${data.nome} criado com sucesso!`);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-darkgray">Novo Coordenador</h2>

      <div className="flex flex-col gap-3">
        <Input
          label="Nome Completo"
          required
          {...register("nome", { required: "Nome é obrigatório" })}
        />
        {errors.nome && (
          <span className="text-xs text-red-500">{errors.nome?.message as string}</span>
        )}

        <Input
          label="E-mail"
          type="email"
          required
          {...register("email", {
            required: "E-mail é obrigatório",
            pattern: {
              value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
              message: "Digite um e-mail válido",
            },
          })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="CEP"
            required
            placeholder="00000-000"
            {...register("cep", {
              required: "O CEP é obrigatório.",
              onBlur: (e) => buscarCep(e.target.value),
              pattern: {
                value: /^\d{5}-?\d{3}$/,
                message: "CEP inválido",
              },
            })}
          />

          <Input label="Cidade:" required  {...register("cidade")} />
          <Input label="Estado:" required  {...register("estado")} />

          <Input
            required
            label="Data de Contratação"
            {...register("data_contratacao")}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <Button variant="secondary" type="button" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Cadastrar
        </Button>
      </div>
    </form>
  );
};

export default CreateCoordForm;