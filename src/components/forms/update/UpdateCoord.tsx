import { useForm } from "react-hook-form";
import type { ColaboradorViewModel } from "../../../domain/mappers/ColaboradorMapper";
import { atualizarColaborador } from "../../../services/ColaboradorService";
import { useNotification } from "../../../hooks/useNotification";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";

interface UpdateCoordProps {
  initialData: ColaboradorViewModel;
  onSuccess: () => void;
}

type CoordEditavel = {
  email: string;
};

const UpdateCoord = ({ initialData, onSuccess }: UpdateCoordProps) => {
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting }, // Adicionado isSubmitting aqui
  } = useForm<CoordEditavel>({
    defaultValues: {
      email: initialData.email,
    },
  });

  const onSubmit = async (data: CoordEditavel) => {
    if (!isDirty) return;
    try {
      await atualizarColaborador(initialData.cpf, {
        email: data.email,
      });
      showNotification("Conta atualizada com sucesso!", "success");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar";
      showNotification(msg, "error");
    }
  };

  // O botão deve ser desativado se o formulário não foi mexido OU se já estiver enviando
  const isButtonDisabled = !isDirty || isSubmitting;

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-2">

        <div className="border-b pb-3 mb-2">
          <h2 className="text-xl font-bold text-darkgray">Editar Cadastro</h2>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
            ID: #{initialData.id}
          </p>
        </div>

        {/* DADOS IMUTÁVEIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <Input
            label="Nome Completo"
            defaultValue={initialData.nomeCompleto}
            readOnly
            className="bg-gray-200/50 cursor-not-allowed text-gray-500"
          />
          <Input
            label="CPF"
            defaultValue={initialData.cpf}
            readOnly
            className="bg-gray-200/50 cursor-not-allowed text-gray-500"
          />
          <Input
            label="Data de Nascimento"
            defaultValue={initialData.dataNascimento}
            readOnly
            className="bg-gray-200/50 cursor-not-allowed text-gray-500"
          />
          <Input
            label="Data de Contratação"
            defaultValue={initialData.dataContratacao}
            readOnly
            className="bg-gray-200/50 cursor-not-allowed text-gray-500"
          />
        </div>

        {/* EDITÁVEIS */}
        <div className="space-y-4 pt-2">
          <Input
            label="E-mail Corporativo"
            {...register("email", {
              required: "O e-mail é obrigatório",
              pattern: { 
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                message: "E-mail inválido" 
              },
            })}
            error={errors.email?.message}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isButtonDisabled}
            className={`w-full py-4 uppercase tracking-widest font-bold ${
              isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Salvando..." : "Confirmar Atualização"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCoord;