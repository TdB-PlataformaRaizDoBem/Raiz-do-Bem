import { useFormContext } from "react-hook-form";
import { Button } from "../../ui/Button";
import { usePedidosAprovadosLivres } from "../../../hooks/usePedidos";
import { useProgramasSociais } from "../../../hooks/useProgramasSociais";
import type { BeneficiarioFormValues } from "./CreateBeneficiario";

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
    formState: { errors, isSubmitting },
  } = useFormContext<BeneficiarioFormValues>();

  const { data: pedidosAprovados, loading: loadingPedidos } =
    usePedidosAprovadosLivres();

  const { programas, loading: loadingProgramas } = useProgramasSociais();

  const idPedidoSelecionado = watch("idPedidoAjuda");

  const pedidoSelecionado = pedidosAprovados?.find(
    (p) => p.id === Number(idPedidoSelecionado),
  );

  return (
    <div className="flex flex-col gap-6 w-full max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar text-left">
      <header className="sticky top-0 bg-white pb-2 z-10">
        <h2 className="text-2xl font-bold text-darkgray font-fredoka">
          {isEdit ? "Editar Beneficiário" : "Novo Beneficiário"}
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-y-4">
        {/* Pedido de Ajuda */}
        {!isEdit && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-darkgray">
              Pedido de Ajuda Aprovado
              <span className="ml-1 text-red-500">*</span>
            </label>

            {loadingPedidos ? (
              <p className="text-sm text-gray-400 italic">
                Carregando pedidos...
              </p>
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

            {/* preview moved below with programa select */}
          </div>
        )}

        {/* Programa Social */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-darkgray">
            Programa Social
            <span className="ml-1 text-red-500">*</span>
          </label>

          {loadingProgramas ? (
            <p className="text-sm text-gray-400 italic">
              Carregando programas...
            </p>
          ) : programas.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Nenhum programa disponível.
            </p>
          ) : (
            <select
              {...register("idProgramaSocial", {
                required: "Selecione um programa social",
                valueAsNumber: true,
              })}
              className={`border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                errors.idProgramaSocial ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">Selecione um programa...</option>
              {programas.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.programa}
                </option>
              ))}
            </select>
          )}

          {errors.idProgramaSocial && (
            <span className="text-xs text-red-500">
              {errors.idProgramaSocial.message}
            </span>
          )}

          {pedidoSelecionado && (
            <div className="mt-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">
                Pedido selecionado
              </p>
              <p className="text-sm font-medium">
                #{pedidoSelecionado.id} — {pedidoSelecionado.nomeCompleto}
              </p>
              <p className="text-sm text-gray-600 italic mt-1">
                "{pedidoSelecionado.descricaoProblema}"
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Data: {pedidoSelecionado.dataPedido}
              </p>
            </div>
          )}
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
