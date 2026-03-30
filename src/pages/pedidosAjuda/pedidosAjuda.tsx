import { useState } from "react";
import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import UserInformation from "../../components/userInformation/UserInformation";
import UserActions from "../../components/userActions/UserActions";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { PedidoAjuda, type PedidoAjudaData } from "../../data/pedidosAjudaData";
import { getUser } from "../../hooks/useUser";
import { useNotification } from "../../hooks/useNotification";

type AcaoPendente = "aprovar" | "suspender" | null;

const usePedidoActions = () => {
  const [pedidos, setPedidos] = useState<PedidoAjudaData[]>(PedidoAjuda);
  const { showNotification } = useNotification();

  // Controla qual ação está aguardando confirmação e qual pedido está em foco.
  const [acaoPendente, setAcaoPendente] = useState<AcaoPendente>(null);
  const [pedidoEmFoco, setPedidoEmFoco] = useState<PedidoAjudaData | null>(
    null,
  );

  // Abre o modal associando o pedido e a ação que o coordenador quer executar.
  const solicitarConfirmacao = (
    pedido: PedidoAjudaData,
    acao: AcaoPendente,
  ) => {
    setPedidoEmFoco(pedido);
    setAcaoPendente(acao);
  };

  const cancelarConfirmacao = () => {
    setAcaoPendente(null);
    setPedidoEmFoco(null);
  };

  const atualizarSituacaoLocal = (
    id: number,
    novaSituacao: "Aprovado" | "Negado",
  ) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, situacao: novaSituacao } : p)),
    );
  };

  const handleAprovar = async (pedido: PedidoAjudaData) => {
    // Futura Integração: [INTEGRAÇÃO API - APROVAR]

    atualizarSituacaoLocal(pedido.id, "Aprovado");
    showNotification(
      `Pedido do protocolo #${pedido.id} aprovado com sucesso.`,
      "success",
    );
    cancelarConfirmacao();
  };

  const handleSuspender = async (pedido: PedidoAjudaData) => {
    // Futura Integração: [INTEGRAÇÃO API - SUSPENDER/NEGAR]
    atualizarSituacaoLocal(pedido.id, "Negado");
    showNotification(
      `Pedido do protocolo #${pedido.id} foi suspenso.`,
      "error",
    );
    cancelarConfirmacao();
  };

  const confirmarAcao = () => {
    if (!pedidoEmFoco) return;
    if (acaoPendente === "aprovar") handleAprovar(pedidoEmFoco);
    if (acaoPendente === "suspender") handleSuspender(pedidoEmFoco);
  };

  return {
    pedidos,
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

  const {
    pedidos,
    acaoPendente,
    pedidoEmFoco,
    solicitarConfirmacao,
    cancelarConfirmacao,
    confirmarAcao,
  } = usePedidoActions();

  // Textos e variante do modal variam conforme a ação pendente.
  const modalConfig = {
    aprovar: {
      titulo: "Confirmar Aprovação",
      descricao: `Tem certeza que deseja aprovar o pedido do protocolo #${pedidoEmFoco?.id}? Essa ação notificará o solicitante.`,
      labelConfirmar: "Sim, aprovar",
      variantConfirmar: "secondary" as const,
      acento: "bg-lightgreen",
    },
    suspender: {
      titulo: "Confirmar Suspensão",
      descricao: `Tem certeza que deseja suspender o pedido do protocolo #${pedidoEmFoco?.id}? Essa ação não poderá ser desfeita facilmente.`,
      labelConfirmar: "Sim, suspender",
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

      <UserManagementPage
        title="Pedidos de Ajuda"
        users={pedidos}
        getId={(p) => p.id}
        renderCard={(p, selected, select) => (
          <UserCard
            className={`transition-all border-l-4
              ${p.situacao === "Pendente" ? "border-l-amber" : ""}
              ${p.situacao === "Aprovado" ? "border-l-lightgreen" : ""}
              ${p.situacao === "Negado" ? "border-l-red-500" : ""}
              ${selected ? "shadow-md scale-[1.02] bg-gray-50" : ""} p-6`}
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
                className={`text-sm px-3 py-3 rounded-full w-fit font-bold
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

            <div className="mt-6 pt-4 flex border-t-1 border-gray/20 items-start lg:items-end lg:border-transparent flex-col gap-3 lg:gap-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Data do Envio
                  </p>
                  <p className="text-sm font-bold text-darkgray">{p.data}</p>
                </div>
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
          <UserInformation>
            <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] md:h-auto max-w-3x w-full">
              <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 custom-scrollbar">
                <div className="flex-1 w-full text-left">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                        {pedido.nome_completo}
                      </h3>
                      <div className="h-1.5 w-20 bg-amber mt-1" />
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                        Protocolo
                      </span>
                      <span className="text-lg font-mono font-bold text-darkgray">
                        #{pedido.id}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Status e Data */}
                    <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-black uppercase text-gray-400">
                          Situação Atual
                        </p>
                        <p className="font-bold text-amber">
                          {pedido.situacao}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div>
                        <p className="text-xs font-black uppercase text-gray-400">
                          Data do Envio
                        </p>
                        <p className="font-bold text-darkgray">{pedido.data}</p>
                      </div>
                    </div>

                    {/* Descrição do Problema */}
                    <div className="bg-amber/5 p-6 rounded-2xl border border-amber/10">
                      <h4 className="text-xs font-black uppercase text-amber tracking-wider mb-3">
                        Descrição da Solicitação
                      </h4>
                      <p className="text-darkgray leading-relaxed text-lg">
                        "{pedido.descricao_problema}"
                      </p>
                    </div>

                    {/* Canais de Contato */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <h4 className="text-xs font-black uppercase text-gray-400 mb-2">
                          E-mail
                        </h4>
                        <p className="text-darkgray font-medium break-all">
                          {pedido.email}
                        </p>
                        <a
                          href={`mailto:${pedido.email}`}
                          className="text-xs text-darkgreen font-bold hover:underline mt-2 inline-block"
                        >
                          Email de Contato
                        </a>
                      </div>
                      <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <h4 className="text-xs font-black uppercase text-gray-400 mb-2">
                          Telefone / WhatsApp
                        </h4>
                        <p className="text-darkgray font-medium">
                          {pedido.telefone}
                        </p>
                        <a
                          href={`https://wa.me/55${pedido.telefone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-darkgreen font-bold hover:underline mt-2 inline-block"
                        >
                          Chamar no WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <UserActions>
                <div className="flex flex-wrap gap-3 justify-end">
                  {isCoord && pedido.situacao === "Pendente" && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => solicitarConfirmacao(pedido, "aprovar")}
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          solicitarConfirmacao(pedido, "suspender")
                        }
                      >
                        Suspender
                      </Button>
                    </>
                  )}

                  <Button variant="primary" onClick={() => window.print()}>
                    Imprimir Relatório
                  </Button>
                  <Button variant="secondary" onClick={close}>
                    Fechar
                  </Button>
                </div>
              </UserActions>
            </div>
          </UserInformation>
        )}
      />
    </>
  );
};
