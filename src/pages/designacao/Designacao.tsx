import { useState } from "react";
import { UserManagementPage } from "../../components/UserManagement/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import {
  useDesignacaoPendentes,
  useAtendimentos,
  type DesignacaoTab,
} from "../../hooks/useDesignacao";
import {
  BeneficiarioDesignacaoDetails,
  AtendimentoDetails,
  type EncerramentoPayload,
} from "../../components/details/DesignacaoDetails";
import {
  criarAtendimento,
  encerrarAtendimento,
} from "../../services/AtendimentoService";
import { getBeneficiariosCompletos } from "../../services/Beneficiarioservice";
import { useNotification } from "../../hooks/useNotification";
import {
  designacaoFilterConfig,
  atendimentoFilterConfig,
} from "../../hooks/pageFilterConfigs";
import type { BeneficiarioViewModel } from "../../domain/mappers/Beneficiariomapper";
import type { AtendimentoViewModel } from "../../domain/mappers/AtendimentoMapper";

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
  TODOS: "Nenhum atendimento encontrado.",
};

/* ------------------------------------------------------------------
 *  Aba PENDENTE
 * ------------------------------------------------------------------ */
const AbaPendentes = () => {
  const { pendentes, loading, error, refetch } = useDesignacaoPendentes();
  const { showNotification } = useNotification();

  const [emFoco, setEmFoco] = useState<BeneficiarioViewModel | null>(null);
  const [prontuario, setProntuario] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const solicitar = (b: BeneficiarioViewModel, pront: string) => {
    setEmFoco(b);
    setProntuario(pront);
    setModalOpen(true);
  };

  const cancelar = () => {
    if (salvando) return;
    setModalOpen(false);
    setEmFoco(null);
    setProntuario("");
  };

  const confirmar = async () => {
    if (!emFoco) return;
    setSalvando(true);
    try {
      await criarAtendimento({
        prontuario,
        cpfBeneficiario: emFoco.cpf,
      });
      showNotification(
        `Designação criada com sucesso para ${emFoco.nomeCompleto}. O dentista será selecionado automaticamente.`,
        "success",
      );
      cancelar();
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
      <Modal open={modalOpen} onClose={cancelar}>
        {emFoco && (
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
                <p className="font-bold text-darkgray">{emFoco.nomeCompleto}</p>
                <p className="text-xs text-gray-500">
                  {emFoco.email} · {emFoco.telefone}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {emFoco.endereco
                    ? `${emFoco.endereco.cidade} - ${emFoco.endereco.estado}`
                    : "Localização não informada"}
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
                onClick={cancelar}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={confirmar}
                disabled={salvando}
                className={salvando ? "opacity-70 cursor-not-allowed" : ""}
              >
                {salvando ? "Salvando..." : "Confirmar designação"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AsyncEstado
        loading={loading}
        error={error}
        vazio={!pendentes.length}
        mensagemVazio={EMPTY_MESSAGES.PENDENTE}
      >
        <UserManagementPage<BeneficiarioViewModel>
          key="PENDENTE"
          title="Designação"
          users={pendentes}
          getId={(b) => b.id}
          filterConfig={designacaoFilterConfig}
          renderCard={(b, selected, select) => (
            <UserCard
              className={`border-l-4 border-l-amber p-5 transition-all ${
                selected
                  ? "shadow-md scale-[1.02] bg-gray-50"
                  : "hover:shadow-sm"
              }`}
            >
              <div className="flex flex-col gap-2">
                <p className="text-xl sm:text-2xl font-bold text-black leading-tight">
                  {b.nomeCompleto}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  <span className="font-bold text-xs uppercase mr-1">CPF:</span>
                  {b.cpf}
                </p>
                <p className="text-xs text-gray-400 italic mt-1">
                  {b.endereco
                    ? `${b.endereco.cidade} - ${b.endereco.estado}`
                    : "Localização não informada"}
                </p>
              </div>
              <div className="mt-4 pt-4 flex flex-col gap-3 border-t border-gray/10 lg:border-t-0 lg:text-end">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  ID #{b.id}
                </span>
                <Button
                  onClick={select}
                  variant={selected ? "primary" : "secondary"}
                  className="w-full text-xs font-bold shadow-sm active:scale-95 transition-transform"
                >
                  Designar Dentista
                </Button>
              </div>
            </UserCard>
          )}
          renderDetails={(b, close) => (
            <BeneficiarioDesignacaoDetails
              data={b}
              onDesignar={solicitar}
              onClose={close}
            />
          )}
        />
      </AsyncEstado>
    </>
  );
};

/* ------------------------------------------------------------------
 *  Abas EM_ATENDIMENTO, CONCLUIDO e TODOS
 * ------------------------------------------------------------------ */
type AbaAtendimentosProps = {
  tab: "EM_ATENDIMENTO" | "CONCLUIDO" | "TODOS";
};

const AbaAtendimentos = ({ tab }: AbaAtendimentosProps) => {
  const { atendimentos, loading, error, refetch } = useAtendimentos(tab);
  const { showNotification } = useNotification();

  const [emFoco, setEmFoco] = useState<AtendimentoViewModel | null>(null);
  const [payload, setPayload] = useState<EncerramentoPayload | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const solicitarEncerramento = (
    a: AtendimentoViewModel,
    p: EncerramentoPayload,
  ) => {
    setEmFoco(a);
    setPayload(p);
    setModalOpen(true);
  };

  const cancelar = () => {
    if (salvando) return;
    setModalOpen(false);
    setEmFoco(null);
    setPayload(null);
  };

  /**
   * O endpoint PUT /atendimento/{cpf} exige o CPF do beneficiário, mas o
   * AtendimentoDTO devolve apenas o nome. Precisamos buscar a lista de
   * beneficiários e localizar pelo nome para obter o CPF.
   */
  const confirmar = async () => {
    if (!emFoco || !payload) return;
    setSalvando(true);
    try {
      const beneficiarios = await getBeneficiariosCompletos();
      const alvo = beneficiarios.find(
        (b) =>
          b.nomeCompleto.trim().toLowerCase() ===
          emFoco.beneficiario.trim().toLowerCase(),
      );

      if (!alvo) {
        showNotification(
          `Não foi possível localizar o beneficiário "${emFoco.beneficiario}" para obter o CPF.`,
          "error",
        );
        return;
      }

      await encerrarAtendimento(alvo.cpf, payload);

      showNotification(
        emFoco.encerrado
          ? `Atendimento de ${emFoco.beneficiario} atualizado com sucesso.`
          : `Atendimento de ${emFoco.beneficiario} encerrado com sucesso.`,
        "success",
      );

      cancelar();
      refetch();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao encerrar atendimento.";
      showNotification(msg, "error");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <Modal open={modalOpen} onClose={cancelar}>
        {emFoco && payload && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-darkgray font-fredoka">
                {emFoco.encerrado
                  ? "Confirmar Atualização"
                  : "Confirmar Encerramento"}
              </h2>
              <div className="h-1 w-16 mt-1 bg-lightgreen" />
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-black uppercase text-gray-400 mb-1">
                  Beneficiário
                </p>
                <p className="font-bold text-darkgray">{emFoco.beneficiario}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Atendimento #{emFoco.id} · Iniciado em {emFoco.dataInicial}
                </p>
              </div>

              <div className="bg-lightgreen/5 rounded-xl p-4 border border-lightgreen/20">
                <p className="text-xs font-black uppercase text-darkgreen mb-1">
                  Prontuário
                </p>
                <p className="text-sm text-darkgray leading-relaxed italic">
                  "{payload.prontuario}"
                </p>
                <p className="text-xs text-darkgreen mt-3">
                  <span className="font-black uppercase">Colaborador:</span> #
                  {payload.idColaborador}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={cancelar}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={confirmar}
                disabled={salvando}
                className={salvando ? "opacity-70 cursor-not-allowed" : ""}
              >
                {salvando ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AsyncEstado
        loading={loading}
        error={error}
        vazio={!atendimentos.length}
        mensagemVazio={EMPTY_MESSAGES[tab]}
      >
        <UserManagementPage<AtendimentoViewModel>
          key={tab}
          title="Designação"
          users={atendimentos}
          getId={(a) => a.id}
          filterConfig={atendimentoFilterConfig}
          renderCard={(a, selected, select) => {
            const cor = a.encerrado ? "border-l-darkgreen" : "border-l-amber";
            return (
              <UserCard
                className={`border-l-4 ${cor} p-5 transition-all ${
                  selected
                    ? "shadow-md scale-[1.02] bg-gray-50"
                    : "hover:shadow-sm"
                }`}
              >
                <div className="flex flex-col gap-2">
                  <p className="text-xl sm:text-2xl font-bold text-black leading-tight">
                    {a.beneficiario}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    <span className="font-bold text-xs uppercase mr-1">
                      Dentista:
                    </span>
                    {a.dentista}
                  </p>
                  <p className="text-xs text-gray-400 italic mt-1 line-clamp-2">
                    <span className="font-bold not-italic">Prontuário:</span>{" "}
                    {a.prontuario}
                  </p>
                </div>
                <div className="mt-4 pt-4 flex flex-col gap-3 border-t border-gray/10 lg:border-t-0 lg:text-end">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    {a.encerrado
                      ? `Concluído em ${a.dataFim}`
                      : `Iniciado em ${a.dataInicial}`}
                  </span>
                  <Button
                    onClick={select}
                    variant={selected ? "primary" : "secondary"}
                    className="w-full text-xs font-bold shadow-sm active:scale-95 transition-transform"
                  >
                    {a.encerrado ? "Ver detalhes" : "Encerrar atendimento"}
                  </Button>
                </div>
              </UserCard>
            );
          }}
          renderDetails={(a, close) => (
            <AtendimentoDetails
              data={a}
              modoLeitura={a.encerrado}
              permitirAtualizar={a.encerrado}
              onEncerrar={solicitarEncerramento}
              onClose={close}
            />
          )}
        />
      </AsyncEstado>
    </>
  );
};

export const Designacao = () => {
  const [tab, setTab] = useState<DesignacaoTab>("PENDENTE");

  return (
    <>
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

      {tab === "PENDENTE" ? <AbaPendentes /> : <AbaAtendimentos tab={tab} />}
    </>
  );
};
