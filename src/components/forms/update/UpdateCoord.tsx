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
  // nivelAcesso: campo de débito técnico — mantido no form para UX mas não enviado
  nivelAcesso: "admin" | "colaborador";
};

const UpdateCoord = ({ initialData, onSuccess }: UpdateCoordProps) => {
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CoordEditavel>({
    defaultValues: {
      email:       initialData.email,
      nivelAcesso: initialData.nivelAcesso ?? "colaborador",
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
              pattern: { value: /^\S+@\S+$/i, message: "E-mail inválido" },
            })}
            error={errors.email?.message}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-400">
              Nível de Acesso{" "}
              <span className="text-xs font-normal text-amber">(aguardando JWT — não salvo)</span>
            </label>
            <select
              {...register("nivelAcesso")}
              className="p-3 rounded-md bg-gray-50 border border-gray-200 h-[52px] text-gray-400 cursor-not-allowed"
              disabled
            >
              <option value="colaborador">Colaborador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-darkgray mb-2">Endereço</h3>
          <div className="p-4 bg-amber/5 border border-amber/20 rounded-lg">
            <p className="text-xs text-amber font-bold mb-1">
              ⚠ Endereço não disponível
            </p>
            <p className="text-xs text-gray-500">
              <code>Colaborador.java</code> não possui relação com <code>Endereco</code>.
              Aguardando implementação do back-end.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty}
            className={`w-full py-4 uppercase tracking-widest font-bold ${
              !isDirty ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Confirmar Atualização
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCoord;