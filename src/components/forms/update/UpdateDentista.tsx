import { useForm } from "react-hook-form";
import type { DentistaViewModel } from "../../../domain/mappers/DentistaMapper";
import { atualizarDentista } from "../../../services/DentistaService";
import { useNotification } from "../../../hooks/useNotification";
import { useCep } from "../../../hooks/useCep";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";

type UpdateDentistaProps = {
  initialData: DentistaViewModel;
  onSuccess: () => void;
};

type DentistaEditavel = {
  email: string;
  telefone: string;
  categoriaDentista: string;
  disponivel: "S" | "N";
  "endereco.cep": string;
  "endereco.numero": string;
  "endereco.logradouro": string;
  "endereco.cidade": string;
  "endereco.estado": string;
};

const UpdateDentista = ({ initialData, onSuccess }: UpdateDentistaProps) => {
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<DentistaEditavel>({
    defaultValues: {
      email: initialData.email === "—" ? "" : initialData.email,
      telefone: initialData.telefone === "—" ? "" : initialData.telefone,
      categoriaDentista: initialData.categoria === "—" ? "" : initialData.categoria,
      // Se initialData.disponivel for true, vira "S", senão vira "N"
      disponivel: initialData.disponivel ? "S" : "N",
      
      "endereco.cep": "", // Tratativa para o GET que não traz o CEP
      "endereco.numero": initialData.numero ?? "",
      "endereco.logradouro": initialData.logradouro ?? "",
      "endereco.cidade": initialData.cidade ?? "",
      "endereco.estado": initialData.estado ?? "",
    },
  });

  const { buscarCep } = useCep<DentistaEditavel>(setValue, setError, clearErrors);

  const onSubmit = async (data: DentistaEditavel) => {
    if (!isDirty) return;
    try {
      // Enviando o payload exatamente como o banco e o Swagger esperam
      await atualizarDentista(initialData.cpf, {
        email: data.email,
        telefone: data.telefone.replace(/\D/g, ""),
        categoriaDentista: data.categoriaDentista,
        disponivel: data.disponivel, // Enviará "S" ou "N" perfeitamente
        endereco: {
          cep: data["endereco.cep"].replace(/\D/g, ""),
          numero: data["endereco.numero"],
        },
      });

      showNotification(`Dentista ${initialData.nomeCompleto} atualizado!`, "success");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar";
      showNotification(msg, "error");
    }
  };

  const isButtonDisabled = !isDirty || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-[85vh] md:h-auto max-w-3xl w-full text-left"
    >
      <h2 className="text-2xl font-bold font-fredoka mb-6 text-darkgray">
        Editar Dentista
      </h2>

      <div className="flex-1 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* DADOS IMUTÁVEIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <Input
            label="Nome Completo"
            defaultValue={initialData.nomeCompleto}
            readOnly
            className="bg-gray-200 cursor-not-allowed"
          />
          <Input
            label="CPF"
            defaultValue={initialData.cpf}
            readOnly
            className="bg-gray-200 cursor-not-allowed"
          />
          <Input
            label="CRO"
            defaultValue={initialData.croDentista}
            readOnly
            className="bg-gray-200 cursor-not-allowed"
          />
          <Input
            label="Sexo"
            defaultValue={initialData.sexoLabel}
            readOnly
            className="bg-gray-200 cursor-not-allowed"
          />
        </div>

        {/* EDITÁVEIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            {...register("telefone", { required: "Obrigatório" })}
            error={errors.telefone?.message}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-darkgray mb-1">Disponibilidade</label>
            <select
              {...register("disponivel")}
              className="p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary text-sm h-[50px]"
            >
              <option value="S">Sim</option>
              <option value="N">Não</option>
            </select>
          </div>

          <Input
            label="Categoria"
            {...register("categoriaDentista", { required: "Obrigatório" })}
            error={errors.categoriaDentista?.message}
          />
        </div>

        {/* ENDEREÇO */}
        <div className="border-t pt-4">
          <h3 className="font-bold text-darkgray mb-4 font-fredoka">Endereço do Consultório</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CEP"
                {...register("endereco.cep", {
                  required: "Obrigatório",
                  pattern: { value: /^\d{5}-?\d{3}$/, message: "CEP inválido" },
                  onBlur: (e) => buscarCep(e.target.value),
                })}
                error={errors["endereco.cep"]?.message}
              />
              <Input
                label="Número"
                {...register("endereco.numero", { required: "Obrigatório" })}
                error={errors["endereco.numero"]?.message}
              />
            </div>
            <Input
              label="Logradouro"
              {...register("endereco.logradouro")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
            <Input
              label="Cidade"
              {...register("endereco.cidade")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
            <Input
              label="Estado"
              {...register("endereco.estado")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
        <Button variant="secondary" type="button" disabled={isSubmitting} onClick={onSuccess}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isButtonDisabled}
          className={isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          {isSubmitting ? "Salvando..." : isDirty ? "Salvar Alterações" : "Sem mudanças"}
        </Button>
      </div>
    </form>
  );
};

export default UpdateDentista;