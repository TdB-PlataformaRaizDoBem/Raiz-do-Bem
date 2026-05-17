import { useEffect, useState } from "react";
import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import { useDesignacao, type DesignacaoTab } from "../../hooks/useDesignacao";
import { DesignacaoDetails } from "../../components/details/DesignacaoDetails";
import type { PedidoViewModel } from "../../domain/mappers/PedidoMapper";
import { criarAtendimento } from "../../services/AtendimentoService";
import { useNotification } from "../../hooks/useNotification";
import { designacaoFilterConfig } from "../../hooks/pageFilterConfigs";

const TAB_LABELS: Record<DesignacaoTab, string> = {
  PENDENTE: "Pendentes",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDO: "Concluídos",
  TODOS: "Todos",
};

const EMPTY_MESSAGES: Record<DesignacaoTab, string> = {
  PENDENTE: "Nenhum beneficiário pendente de designação.",
  EM_ATENDIMENTO: "Nenhum atendimento em andamento.",
  CONCLUIDO: "Nenhum atendimento concluído.",
  TODOS: "Nenhum pedido encontrado.",
};

export const Designacao = () => {
  const [tab, setTab] = useState<DesignacaoTab>("PENDENTE");
  const { pendentes, loading, error, refetch } = useDesignacao(tab);
  const { showNotification } = useNotification();

  const [pedidoEmFoco, setPedidoEmFoco] = useState<PedidoViewModel | null>(null);
  const [prontuario, setProntuario] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setModalOpen(false);
    setPedidoEmFoco(null);
    setProntuario("");
  }, [tab]);

  const solicitarDesignacao = (pedido: PedidoViewModel, pront: string) => {
    setPedidoEmFoco(pedido);
    setProntuario(pront);
    setModalOpen(true);
  };

  const cancelarDesignacao = () => {
    if (salvando) return;
    setModalOpen(false);
    setPedidoEmFoco(null);
    setProntuario("");
  };

  const confirmarDesignacao = async () => {
    if (!pedidoEmFoco) return;

    setSalvando(true);
    try {
      await criarAtendimento({
        prontuario,
        cpfBeneficiario: pedidoEmFoco.cpf,
      });

      showNotification(
        `Designação criada com sucesso para ${pedidoEmFoco.nomeCompleto}. O dentista será selecionado automaticamente.`,
        "success",
      );

      cancelarDesignacao();
      refetch();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao criar atendimento.";
      showNotification(msg, "error");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <Modal open={modalOpen} onClose={cancelarDesignacao}>
        {pedidoEmFoco && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-darkgray font-fredoka">
                Confirmar Designação
              </h2>
              <div className="h-1 w-16 mt-1 bg-lightgreen" />
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-black uppercase text-gray-400 mb-1">
                  Beneficiário
                </p>
                <p className="font-bold text-darkgray">
                  {pedidoEmFoco.nomeCompleto}
                </p>
                <p className="text-xs text-gray-500">
                  {pedidoEmFoco.email} · {pedidoEmFoco.telefone}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {pedidoEmFoco.endereco ?? "Localização não informada"}
                </p>
              </div>

              <div className="bg-lightgreen/5 rounded-xl p-4 border border-lightgreen/20">
                <p className="text-xs font-black uppercase text-darkgreen mb-1">
                  Prontuário inicial
                </p>
                <p className="text-sm text-darkgray leading-relaxed italic">
                  "{prontuario}"
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              O sistema selecionará automaticamente o dentista mais próximo
              disponível após a confirmação.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={cancelarDesignacao}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={confirmarDesignacao}
                disabled={salvando}
                className={salvando ? "opacity-70 cursor-not-allowed" : ""}
              >
                {salvando ? "Salvando..." : "Confirmar designação"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(TAB_LABELS) as DesignacaoTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              tab === t
                ? "bg-darkgreen text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <AsyncEstado
        loading={loading}
        error={error}
        vazio={!pendentes.length}
        mensagemVazio={EMPTY_MESSAGES[tab]}
      >
        <UserManagementPage<PedidoViewModel>
          key={tab}
          title="Designação"
          users={pendentes}
          getId={(p) => p.id}
          filterConfig={designacaoFilterConfig}
          renderCard={(p, selected, select) => (
            <UserCard
              className={`border-l-4 border-l-amber p-5 transition-all ${
                selected
                  ? "shadow-md scale-[1.02] bg-gray-50"
                  : "hover:shadow-sm"
              }`}
            >
              <div className="flex flex-col gap-2">
                <p className="text-xl sm:text-2xl font-bold text-black leading-tight">
                  {p.nomeCompleto}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  <span className="font-bold text-xs uppercase mr-1">
                    Localização:
                  </span>
                  {p.endereco ?? "Não informado"}
                </p>
                <p className="text-xs text-gray-400 italic mt-1 line-clamp-2">
                  <span className="font-bold not-italic">
                    Protocolo #{p.id}:
                  </span>{" "}
                  {p.descricaoProblema}
                </p>
              </div>
              <div className="mt-4 pt-4 flex flex-col gap-3 border-t border-gray/10 lg:border-t-0 lg:text-end">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {p.dataPedido}
                </span>
                <Button
                  onClick={select}
                  variant={selected ? "primary" : "secondary"}
                  className="w-full text-xs font-bold shadow-sm active:scale-95 transition-transform"
                >
                  {tab === "PENDENTE" ? "Designar Dentista" : "Ver detalhes"}
                </Button>
              </div>
            </UserCard>
          )}
          renderDetails={(p, close) => (
            <DesignacaoDetails
              data={p}
              modoLeitura={tab !== "PENDENTE"}
              onDesignar={solicitarDesignacao}
              onClose={close}
            />
          )}
        />
      </AsyncEstado>
    </>
  );
};
