import { useState } from "react";
import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import UserInformation from "../../components/userInformation/UserInformation";
import UserActions from "../../components/userActions/UserActions";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useDesignacao, buscarDentistasProximos } from "../../hooks/useDesignacao";
import type { Beneficiario } from "../../data/beneficiariosData";
import type { Dentista } from "../../data/dentistasData";
import { PedidoAjuda } from "../../data/pedidosAjudaData";
 
type DentistaCardProps = {
  dentista: Dentista;
  selecionado: boolean;
  onSelecionar: () => void;
  beneficiario: Beneficiario;
};

const DentistaCard = ({
  dentista,
  selecionado,
  onSelecionar,
  beneficiario,
}: DentistaCardProps) => {
  const mesmaCidade = dentista.endereco.cidade === beneficiario.cidade || dentista.endereco.estado === beneficiario.estado;

  return (
    <button
      type="button"
      onClick={onSelecionar}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all
        ${selecionado
          ? "border-darkgreen bg-lightgreen/10 shadow-sm"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-bold text-darkgray text-sm">{dentista.nome}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            CRO: {dentista.cro} · {dentista.especialidades.map((e) => e.descricao).join(", ")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dentista.endereco.cidade} — {dentista.endereco.estado}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {/* Badge de proximidade */}
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full
              ${mesmaCidade
                ? "bg-lightgreen/20 text-darkgreen"
                : "bg-amber/10 text-amber"
              }`}
          >
            {mesmaCidade ? "Mesma cidade" : "Mesmo estado"}
          </span>
          {selecionado && (
            <span className="text-[10px] font-black text-darkgreen uppercase tracking-wide">
              Selecionado
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export const Designacao = () => {
  const {
    pendentes,
    acaoPendente,
    beneficiarioEmFoco,
    dentistaSelecionado,
    // setDentistaSelecionado,
    solicitarDesignacao,
    cancelarDesignacao,
    confirmarDesignacao,
  } = useDesignacao();

  // Dentista pré-selecionado localmente no painel (antes de abrir o modal).
  const [dentistaPainel, setDentistaPainel] = useState<Dentista | null>(null);

  // Quando o painel troca de beneficiário, limpa a seleção anterior.
  const handleSelecionarBeneficiario = (b: Beneficiario) => {
    setDentistaPainel(null);
    return b;
  };

  return (
    <>
      {/* Modal de confirmação de designação */}
      <Modal open={acaoPendente === "designar"} onClose={cancelarDesignacao}>
        {beneficiarioEmFoco && dentistaSelecionado && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-darkgray font-fredoka">
                Confirmar Designação
              </h2>
              <div className="h-1 w-16 mt-1 bg-lightgreen" />
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">
                  Beneficiário
                </p>
                <p className="font-bold text-darkgray">{beneficiarioEmFoco.nome}</p>
                <p className="text-xs text-gray-500">
                  {beneficiarioEmFoco.programaSocial} · {beneficiarioEmFoco.cidade} — {beneficiarioEmFoco.estado}
                </p>
              </div>

              <div className="bg-lightgreen/5 rounded-xl p-4 border border-lightgreen/20">
                <p className="text-xs font-black uppercase text-darkgreen tracking-widest mb-1">
                  Dentista designado
                </p>
                <p className="font-bold text-darkgray">{dentistaSelecionado.nome}</p>
                <p className="text-xs text-gray-500">
                  CRO: {dentistaSelecionado.cro} · {dentistaSelecionado.endereco.cidade} — {dentistaSelecionado.endereco.estado}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Esta ação vinculará o beneficiário ao dentista. O dentista será
              notificado sobre o novo caso.
            </p>

            <div className="flex gap-3 justify-end flex-wrap">
              <Button
                variant="secondary"
                onClick={cancelarDesignacao}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={confirmarDesignacao}
                className="flex-1 sm:flex-none"
              >
                Confirmar designação
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <UserManagementPage
        title="Designação"
        users={pendentes}
        getId={(b) => b.id}
        renderCard={(b, selected, select) => (
          <UserCard
            className={`transition-all border-l-4 border-l-amber p-5
              ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="text-xl sm:text-2xl font-bold text-black leading-tight">
                  {b.nome}
                </p>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray uppercase text-xs mr-1">
                  Programa:
                </span>
                {b.programaSocial}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray uppercase text-xs mr-1">
                  Localização:
                </span>
                {b.cidade} — {b.estado}
              </p>
            </div>

            <div className="mt-4 pt-4 flex flex-col gap-4 sm:border-0 border-t border-gray/20">
              <span className="text-sm sm:text-end font-black uppercase text-gray-400 tracking-widest">
                ID: #{b.id}
              </span>
              <Button
                onClick={() => {
                  handleSelecionarBeneficiario(b);
                  select();
                }}
                variant={selected ? "primary" : "secondary"}
                className="w-full py-2 px-6 text-xs font-bold shadow-sm active:scale-95 transition-transform"
              >
                Designar Dentista
              </Button>
            </div>
          </UserCard>
        )}
        renderDetails={(beneficiario, close) => {
          const dentistasDisponiveis = buscarDentistasProximos(beneficiario);
          const pedido = PedidoAjuda.find((p) => p.id === beneficiario.id_pedido_ajuda);
          const semDentistas = dentistasDisponiveis.length === 0;

          return (
            <UserInformation>
              <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
                <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 custom-scrollbar">

                  {/* Cabeçalho */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                        {beneficiario.nome}
                      </h3>
                      <div className="h-1.5 w-20 bg-amber mt-1" />
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                        ID
                      </span>
                      <span className="text-lg font-mono font-bold text-darkgray">
                        #{beneficiario.id}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Info do beneficiário */}
                    <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-black uppercase text-gray-400">Programa</p>
                        <p className="font-bold text-amber">{beneficiario.programaSocial}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div>
                        <p className="text-xs font-black uppercase text-gray-400">Localização</p>
                        <p className="font-bold text-darkgray">
                          {beneficiario.cidade} — {beneficiario.estado}
                        </p>
                      </div>
                    </div>

                    {/* Pedido vinculado */}
                    {pedido && (
                      <div className="bg-lightgreen/5 p-4 rounded-xl border border-lightgreen/20">
                        <p className="text-xs font-black uppercase text-darkgreen tracking-widest mb-1">
                          Pedido aprovado vinculado
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          Protocolo #{pedido.id} · {pedido.data}
                        </p>
                        <p className="text-sm text-darkgray mt-2 italic line-clamp-2">
                          "{pedido.descricao_problema}"
                        </p>
                      </div>
                    )}

                    {/* Lista de dentistas */}
                    <div>
                      <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3">
                        Dentistas disponíveis por proximidade
                      </p>

                      {/* Sem dentistas disponíveis */}
                      {semDentistas && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                          <p className="text-sm font-bold text-red-700">
                            Nenhum dentista disponível
                          </p>
                          <p className="text-xs text-red-500 mt-1 leading-relaxed">
                            Não há dentistas disponíveis em {beneficiario.cidade} ou no
                            estado {beneficiario.estado} compatíveis com o programa{" "}
                            {beneficiario.programaSocial}. A designação está bloqueada
                            até que um dentista elegível esteja disponível.
                          </p>
                        </div>
                      )}

                      {/* Lista de dentistas disponíveis */}
                      {!semDentistas && (
                        <div className="flex flex-col gap-2">
                          {dentistasDisponiveis.map((d: Dentista) => (
                            <DentistaCard
                              key={d.id}
                              dentista={d}
                              beneficiario={beneficiario}
                              selecionado={dentistaPainel?.id === d.id}
                              onSelecionar={() =>
                                setDentistaPainel((prev) =>
                                  prev?.id === d.id ? null : d
                                )
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <UserActions>
                  <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end">
                    <Button
                      variant="secondary"
                      onClick={close}
                      className="flex-1 md:flex-none"
                    >
                      Fechar
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!dentistaPainel || semDentistas}
                      className={`flex-1 md:flex-none ${
                        !dentistaPainel || semDentistas
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => {
                        if (dentistaPainel) {
                          solicitarDesignacao(beneficiario, dentistaPainel);
                        }
                      }}
                    >
                      {dentistaPainel
                        ? `Designar ${dentistaPainel.nome.split(" ")[0]}`
                        : "Selecione um dentista"}
                    </Button>
                  </div>
                </UserActions>
              </div>
            </UserInformation>
          );
        }}
      />
    </>
  );
};