import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { type Colaborador } from "../../../data/colaboradorData";
import { useCep } from "../../../hooks/useCep";
import { ToastNotificationContext } from "../../context/NotificationContext";

interface UpdateCoordProps {
  initialData: Colaborador;
  onSuccess: () => void;
}

const UpdateCoord = ({ initialData, onSuccess }: UpdateCoordProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<Colaborador>({
    defaultValues: initialData,
  });

  // Hook de CEP configurado para preencher os campos automaticamente
  const { buscarCep } = useCep<Colaborador>(setValue, setError, clearErrors);

  const { showNotification } = React.useContext(ToastNotificationContext)!;

  const onSubmit = (data: Colaborador) => {
    if (!isDirty) return;

    const payload = {
      idColaborador: initialData.idColaborador, // PK fixa
      email: data.email,
      nivelAcesso: data.nivelAcesso,
      endereco: {
        id: initialData.id,
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        cidade: data.cidade,
        estado: data.estado,
        idTipoEndereco: 1,
      },
    };

    console.log("Integrando com Oracle - Payload de Update:", payload);
    // Exemplo: await api.put(`/coordenadores/${initialData.id}`, payload);
    showNotification("Conta atualizada com sucesso!", "success");
    onSuccess();
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 p-2"
      >
        <div className="border-b pb-3 mb-2">
          <h2 className="text-xl font-bold text-darkgray">Editar Cadastro</h2>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
            ID Colaborador: #{initialData.idColaborador}
          </p>
        </div>

        {/* SEÇÃO: DADOS IMUTÁVEIS (Apenas Leitura) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <Input
            label="Nome Completo:"
            {...register("nomeCompleto")}
            readOnly
            className="bg-gray-200/50 cursor-not-allowed text-gray-500 border-gray-300 shadow-none"
          />
          <Input
            label="CPF:"
            {...register("cpf")}
            readOnly
            className="bg-gray-200/50 cursor-not-allowed text-gray-500 border-gray-300 shadow-none"
          />
          <Input
            label="Data de Nascimento:"
            {...register("dataNascimento")}
            readOnly
            className="bg-gray-200/50 cursor-not-allowed text-gray-500 border-gray-300 shadow-none"
          />
          <Input
            label="Data de Contratação:"
            {...register("dataContratacao")}
            readOnly
            className="bg-gray-200/50 cursor-not-allowed text-gray-500 border-gray-300 shadow-none"
          />
        </div>

        {/* SEÇÃO: DADOS EDITÁVEIS */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="E-mail Corporativo:"
              {...register("email", {
                required: "O e-mail é obrigatório",
                pattern: { value: /^\S+@\S+$/i, message: "E-mail inválido" },
              })}
              error={errors.email?.message}
            />
            <div className="flex flex-col">
              <label className="text-sm font-bold text-darkgray mb-1">
                Nível de Acesso:
              </label>
              <select
                {...register("nivelAcesso")}
                className="p-3 rounded-md bg-white border border-gray-200 h-[52px] focus:border-amber outline-none transition-all shadow-sm"
              >
                <option value="coord">Coordenador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Input
                label="CEP:"
                {...register("cep", {
                  required: "CEP obrigatório",
                  onBlur: (e) => buscarCep(e.target.value),
                })}
                error={errors.cep?.message}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Número:"
                {...register("numero", { required: "Obrigatório" })}
                error={errors.numero?.message}
              />
            </div>
          </div>

          <Input
            label="Logradouro:"
            {...register("logradouro")}
            readOnly
            className="bg-gray-50 italic"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cidade:"
              {...register("cidade")}
              readOnly
              className="bg-gray-50 italic"
            />
            <Input
              label="Estado:"
              {...register("estado")}
              readOnly
              className="bg-gray-50 italic"
            />
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
