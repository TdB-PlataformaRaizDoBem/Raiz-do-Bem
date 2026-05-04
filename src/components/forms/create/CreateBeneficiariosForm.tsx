import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { useCep } from "../../../hooks/useCep";
import { validateAge } from "../../../hooks/validateAge";
import { usePedidosAprovadosLivres } from "../../../hooks/usePedidos";
import type { BeneficiarioFormValues } from "./CreateBeneficiario";

interface BeneficiarioFormProps {
  onCancel: () => void;
  isEdit?: boolean;
}

export const BeneficiarioForm = ({ onCancel, isEdit }: BeneficiarioFormProps) => {
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useFormContext<BeneficiarioFormValues>();

  const { buscarCep } = useCep<BeneficiarioFormValues>(setValue, setError, clearErrors);

  const selectedSexo = watch("sexo");
  const dataNasc = watch("dataNascimento");
  const idadeAtual = validateAge(dataNasc);

  // Busca pedidos aprovados via API
  const { data: pedidosAprovados, loading: loadingPedidos } = usePedidosAprovadosLivres();

  useEffect(() => {
    if (selectedSexo === "Masculino") {
      setValue("programaSocial", "Turma do Bem");
    }
    if (idadeAtual > 0 && idadeAtual < 18) {
      setValue("programaSocial", "Turma do Bem");
    }
  }, [selectedSexo, idadeAtual, setValue]);

  const idPedidoSelecionado = watch("idPedidoAjuda");
  const pedidoPreview = pedidosAprovados?.find((p) => p.id === Number(idPedidoSelecionado));

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
          error={errors.nomeCompleto?.message}
          {...register("nomeCompleto", { required: "Nome é obrigatório" })}
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
          error={errors.dataNascimento?.message}
          {...register("dataNascimento", {
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
              <option value="Apolônias do Bem">Apolônias do Bem (Mulheres)</option>
            )}
          </select>
        </div>

        {/* Vínculo com pedido de ajuda aprovado — só no cadastro */}
        {!isEdit && (
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-bold text-darkgray">
              Pedido de Ajuda Aprovado
              <span className="ml-1 text-red-500">*</span>
            </label>

            {loadingPedidos ? (
              <p className="text-sm text-gray-400 italic">Carregando pedidos...</p>
            ) : !pedidosAprovados || pedidosAprovados.length === 0 ? (
              <div className="border border-amber/40 bg-amber/5 rounded-xl p-3">
                <p className="text-sm text-amber font-medium">
                  Nenhum pedido aprovado disponível para vínculo no momento.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Um pedido de ajuda precisa ser aprovado na triagem antes de
                  vincular a um beneficiário.
                </p>
              </div>
            ) : (
              <select
                {...register("idPedidoAjuda", {
                  required: "Selecione um pedido aprovado",
                  valueAsNumber: true,
                })}
                className={`border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.idPedidoAjuda ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">Selecione um pedido...</option>
                {pedidosAprovados.map((pedido) => (
                  <option key={pedido.id} value={pedido.id}>
                    #{pedido.id} — {pedido.nomeCompleto} · {pedido.dataPedido}
                  </option>
                ))}
              </select>
            )}

            {errors.idPedidoAjuda && (
              <span className="text-xs text-red-500">
                {errors.idPedidoAjuda.message}
              </span>
            )}

            {/* Preview do pedido selecionado */}
            {pedidoPreview && (
              <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">
                  Descrição do pedido #{pedidoPreview.id}
                </p>
                <p className="text-sm text-darkgray italic line-clamp-3">
                  "{pedidoPreview.descricaoProblema}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-darkgray font-fredoka mb-4">Endereço</h3>
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
