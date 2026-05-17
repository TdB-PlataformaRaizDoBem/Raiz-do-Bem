import { useState } from "react";
import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import { getUser } from "../../hooks/useUser";
import { useNotification } from "../../hooks/useNotification";
import { usePedidos } from "../../hooks/usePedidos";
import {
  aprovarPedido,
  negarPedido,
  type PedidoCompleto,
} from "../../services/PedidoService";
import { PedidoDetails } from "../../components/details/PedidosDetails";
import { pedidoFilterConfig } from "../../hooks/pageFilterConfigs";

type AcaoPendente = "aprovar" | "suspender" | null;

const usePedidoActions = (refetch: () => void) => {
  const { showNotification } = useNotification();
  const [acaoPendente, setAcaoPendente] = useState<AcaoPendente>(null);
  const [pedidoEmFoco, setPedidoEmFoco] = useState<PedidoCompleto | null>(null);
  const [dentistaId, setDentistaId] = useState<string>("");

  const solicitarConfirmacao = (pedido: PedidoCompleto, acao: AcaoPendente) => {
    setPedidoEmFoco(pedido);
    setAcaoPendente(acao);
    setDentistaId("");
  };

  const cancelarConfirmacao = () => {
    setAcaoPendente(null);
    setPedidoEmFoco(null);
  };

  const confirmarAcao = async () => {
    if (!pedidoEmFoco) return;
    try {
      if (acaoPendente === "aprovar") {
        const idDentista = Number(dentistaId || 0);
        if (!idDentista)
          throw new Error("Informe o id do dentista responsável.");
        await aprovarPedido(pedidoEmFoco.id, idDentista);
        showNotification("Pedido aprovado com sucesso.", "success");
      }
      if (acaoPendente === "suspender") {
        const idDentista = Number(dentistaId || 0);
        if (!idDentista)
          throw new Error("Informe o id do dentista responsável.");
        await negarPedido(pedidoEmFoco.id, idDentista);
        showNotification("Pedido suspenso.", "error");
      }
      refetch();
    } catch {
      showNotification("Erro ao executar ação.", "error");
    } finally {
      cancelarConfirmacao();
    }
  };

  return {
    acaoPendente,
    pedidoEmFoco,
    dentistaId,
    setDentistaId,
    solicitarConfirmacao,
    cancelarConfirmacao,
    confirmarAcao,
  };
};

export const PedidosAjuda = () => {
  const loggedUser = getUser();
  const isCoord = loggedUser?.role === "coordenador";
  const { data: pedidos, loading, error, refetch } = usePedidos();
  const {
    acaoPendente,
    pedidoEmFoco,
    dentistaId,
    setDentistaId,
    solicitarConfirmacao,
    cancelarConfirmacao,
    confirmarAcao,
  } = usePedidoActions(refetch);

  const modalConfig = {
    aprovar: {
      titulo: "Confirmar Aprovação",
      descricao: `Aprovar o protocolo #${pedidoEmFoco?.id}?`,
      labelConfirmar: "Aprovar",
      variantConfirmar: "secondary" as const,
      acento: "bg-lightgreen",
    },
    suspender: {
      titulo: "Confirmar Suspensão",
      descricao: `Suspender o protocolo #${pedidoEmFoco?.id}?`,
      labelConfirmar: "Suspender",
      variantConfirmar: "danger" as const,
      acento: "bg-red-500",
    },
  };
  const configAtual = acaoPendente ? modalConfig[acaoPendente] : null;

  return (
    <>
      <Modal open={acaoPendente !== null} onClose={cancelarConfirmacao}>
        {configAtual && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-darkgray font-fredoka">
                {configAtual.titulo}
              </h2>
              <div className={`h-1 w-16 mt-1 ${configAtual.acento}`} />
            </div>
            <p className="text-gray-600 leading-relaxed">
              {configAtual.descricao}
            </p>
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">
                ID do dentista responsável
              </label>
              <input
                value={dentistaId}
                onChange={(e) => setDentistaId(e.target.value)}
                type="number"
                placeholder="Digite o id do dentista (ex: 123)"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end flex-wrap">
              <Button
                variant="secondary"
                onClick={cancelarConfirmacao}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                variant={configAtual.variantConfirmar}
                onClick={confirmarAcao}
                className="flex-1 sm:flex-none"
              >
                {configAtual.labelConfirmar}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AsyncEstado
        loading={loading}
        error={error}
        vazio={!pedidos?.length}
        mensagemVazio="Nenhum pedido encontrado."
      >
        <UserManagementPage<PedidoCompleto>
          title="Pedidos de Ajuda"
          users={pedidos ?? []}
          getId={(p) => p.id}
          filterConfig={pedidoFilterConfig}
          renderCard={(p, selected, select) => (
            <UserCard
              className={`transition-all border-l-4
                ${p.statusAPI === "PENDENTE" ? "border-l-amber" : ""}
                ${p.statusAPI === "APROVADO" ? "border-l-lightgreen" : ""}
                ${p.statusAPI === "REJEITADO" ? "border-l-red-500" : ""}
                ${selected ? "shadow-md scale-[1.02] bg-gray-50" : ""}
                p-6`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <p className="text-2xl font-bold text-darkgray leading-tight">
                    {p.nomeCompleto}
                    <span className="pl-3 text-sm text-gray">
                      Protocolo: #{p.id}
                    </span>
                  </p>
                </div>

                <span
                  className={`text-sm px-3 py-1 rounded-full w-fit font-bold ${p.statusClass}`}
                >
                  {p.statusLabel}
                </span>

                <p className="text-md text-gray-500 line-clamp-3 mt-1 italic">
                  <span className="font-semibold text-gray">
                    Descrição do Problema:
                  </span>
                  <br />
                  {p.descricaoProblema}
                </p>
              </div>

              <div className="mt-6 pt-4 flex border-t border-gray/10 lg:border-t-0 flex-col gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Data do Envio
                  </p>
                  <p className="text-sm font-bold text-darkgray">
                    {p.dataPedido}
                  </p>
                </div>
                <Button
                  onClick={select}
                  variant={selected ? "primary" : "secondary"}
                  className="w-[80%] py-3 text-sm font-bold shadow-sm active:scale-95 transition-transform"
                >
                  Analisar Pedido
                </Button>
              </div>
            </UserCard>
          )}
          renderDetails={(pedido, close) => (
            <PedidoDetails
              data={pedido}
              isCoord={isCoord}
              onAprovar={() => solicitarConfirmacao(pedido, "aprovar")}
              onSuspender={() => solicitarConfirmacao(pedido, "suspender")}
              onClose={close}
            />
          )}
        />
      </AsyncEstado>
    </>
  );
};
