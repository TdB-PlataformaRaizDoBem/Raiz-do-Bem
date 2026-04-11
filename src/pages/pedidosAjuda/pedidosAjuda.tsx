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

type AcaoPendente = "aprovar" | "suspender" | null;

const usePedidoActions = (refetch: () => void) => {
  const { showNotification } = useNotification();

  const [acaoPendente, setAcaoPendente] = useState<AcaoPendente>(null);
  const [pedidoEmFoco, setPedidoEmFoco] =
    useState<PedidoCompleto | null>(null);

  const solicitarConfirmacao = (
    pedido: PedidoCompleto,
    acao: AcaoPendente
  ) => {
    setPedidoEmFoco(pedido);
    setAcaoPendente(acao);
  };

  const cancelarConfirmacao = () => {
    setAcaoPendente(null);
    setPedidoEmFoco(null);
  };

  const confirmarAcao = async () => {
    if (!pedidoEmFoco) return;

    try {
      if (acaoPendente === "aprovar") {
        await aprovarPedido(pedidoEmFoco.id);
        showNotification("Pedido aprovado com sucesso.", "success");
      }

      if (acaoPendente === "suspender") {
        await negarPedido(pedidoEmFoco.id);
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
    solicitarConfirmacao,
    cancelarConfirmacao,
    confirmarAcao,
  } = usePedidoActions(refetch);

  const modalConfig = {
    aprovar: {
      titulo: "Confirmar Aprovação",
      descricao: `Tem certeza que deseja aprovar o protocolo #${pedidoEmFoco?.id}?`,
      labelConfirmar: "Aprovar",
      variantConfirmar: "secondary" as const,
      acento: "bg-lightgreen",
    },
    suspender: {
      titulo: "Confirmar Suspensão",
      descricao: `Tem certeza que deseja suspender o protocolo #${pedidoEmFoco?.id}?`,
      labelConfirmar: "Suspender",
      variantConfirmar: "danger" as const,
      acento: "bg-red-500",
    },
  };

  const configAtual = acaoPendente ? modalConfig[acaoPendente] : null;

  return (
    <>
      {/* Modal de confirmação */}
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

      {/* Estado assíncrono */}
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

          renderCard={(p, selected, select) => (
            <UserCard
              className={`transition-all border-l-4
                ${p.situacao === "Pendente" ? "border-l-amber" : ""}
                ${p.situacao === "Aprovado" ? "border-l-lightgreen" : ""}
                ${p.situacao === "Negado" ? "border-l-red-500" : ""}
                ${selected ? "shadow-md scale-[1.02] bg-gray-50" : ""}
                p-6`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <p className="text-2xl font-bold text-darkgray leading-tight">
                    {p.nome_completo}
                    <span className="pl-3 text-sm text-gray">
                      Protocolo: #{p.id}
                    </span>
                  </p>
                </div>

                <span
                  className={`text-sm px-3 py-1 rounded-full w-fit font-bold
                    ${p.situacao === "Pendente" ? "bg-amber/10 text-amber" : ""}
                    ${p.situacao === "Negado" ? "bg-red-700/10 text-red-700" : ""}
                    ${p.situacao === "Aprovado" ? "bg-lightgreen/10 text-darkgreen" : ""}
                  `}
                >
                  {p.situacao}
                </span>

                <p className="text-md text-gray-500 line-clamp-3 mt-1 italic">
                  <span className="font-semibold text-gray">
                    Descrição do Problema:
                  </span>
                  <br />
                  {p.descricao_problema}
                </p>
              </div>

              <div className="mt-6 pt-4 flex border-t border-gray/10 lg:border-t-0 flex-col gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Data do Envio
                  </p>
                  <p className="text-sm font-bold text-darkgray">{p.data}</p>
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