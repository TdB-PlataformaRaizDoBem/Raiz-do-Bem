import { useForm } from "react-hook-form";
import type { DentistaViewModel } from "../../../domain/mappers/DentistaMapper ";
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
  programa: string;
  disponivel: "true" | "false";
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
    formState: { errors, isDirty },
  } = useForm<DentistaEditavel>({
    defaultValues: {
      email: initialData.email,
      telefone: initialData.telefone,
      programa: initialData.programa,
      disponivel: initialData.disponivel ? "true" : "false",
      "endereco.cep": initialData.endereco?.cep ?? "",
      "endereco.numero": initialData.endereco?.numero ?? "",
      "endereco.logradouro": initialData.endereco?.logradouro ?? "",
      "endereco.cidade": initialData.endereco?.cidade ?? "",
      "endereco.estado": initialData.endereco?.estado ?? "",
    },
  });

  const { buscarCep } = useCep<DentistaEditavel>(setValue, setError, clearErrors);

  const onSubmit = async (data: DentistaEditavel) => {
    try {
      await atualizarDentista(initialData.cpf, {
        email:      data.email,
        telefone:   data.telefone,
        disponivel: data.disponivel === "true",   // converte string → boolean para a API
        // programa e especialidades: aguardam implementação back-end (@ManyToMany)
      });
      showNotification(`Dentista ${initialData.nomeCompleto} atualizado!`, "success");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar";
      showNotification(msg, "error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 p-2 max-h-[85vh] overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <h2 className="text-xl font-bold text-darkgray border-b pb-2">
        Editar Dentista
      </h2>

      {/* DADOS IMUTÁVEIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          {...register("email", {
            required: "Obrigatório",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Telefone"
          {...register("telefone", {
            required: "Obrigatório",
            pattern: { value: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, message: "Telefone inválido" },
          })}
          error={errors.telefone?.message}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold">Disponibilidade</label>
          <select
            {...register("disponivel")}
            className="p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        {/*
         * Programa: DÉBITO TÉCNICO — não existe em Dentista.java.
         * Campo exibido como read-only enquanto o back-end não implementa
         * a relação com ProgramaSocial. Quando disponível, substituir por
         * select que envia idProgramaSocial no payload.
         */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-400">
            Programa{" "}
            <span className="text-xs font-normal text-amber">(aguardando back-end)</span>
          </label>
          <input
            {...register("programa")}
            readOnly
            className="p-3 border border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed text-gray-500"
          />
        </div>
      </div>

      {/*
       * Especialidades: DÉBITO TÉCNICO — @ManyToMany não implementado em Dentista.java.
       * Exibindo o valor atual do mapper (array de strings) como read-only.
       * Quando back-end implementar, transformar em campo de seleção múltipla.
       */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-400">
          Especialidades{" "}
          <span className="text-xs font-normal text-amber">(aguardando back-end)</span>
        </label>
        <input
          defaultValue={
            initialData.especialidades.length > 0
              ? initialData.especialidades.map((e) => e.descricao).join(", ")
              : "Não informado"
          }
          readOnly
          className="p-3 border border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed text-gray-500"
        />
      </div>

      {/* ENDEREÇO */}
      <div className="border-t pt-4">
        <h3 className="font-bold mb-4">Endereço do Consultório</h3>

        {/*
         * NOTA SOBRE ENDEREÇO:
         * Mesmo fluxo do Beneficiário:
         *   1. POST /endereco → cria endereço e retorna id
         *   2. PUT /dentista/:cpf com { idEndereco: novoId }
         * Enquanto PUT /dentista não aceita body, campos ficam em modo informativo.
         */}
        <div className="mb-3 p-3 bg-amber/5 border border-amber/20 rounded-lg">
          <p className="text-xs text-amber font-bold">
            Endereço do Consultório
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Input label="Logradouro" {...register("endereco.logradouro")} readOnly className="bg-gray-100" />
          <Input label="Cidade"     {...register("endereco.cidade")}     readOnly className="bg-gray-100" />
          <Input label="Estado"     {...register("endereco.estado")}     readOnly className="bg-gray-100" />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="secondary" type="button" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isDirty}
          className={!isDirty ? "opacity-50 cursor-not-allowed" : ""}
        >
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default UpdateDentista;