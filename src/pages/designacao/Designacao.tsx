import { useState } from "react";
import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { AsyncEstado } from "../../components/ui/AsyncEstado";

import { useDesignacao } from "../../hooks/useDesignacao";
import type { Beneficiario } from "../../data/beneficiariosData";
import type { Dentista } from "../../data/dentistasData";

import { DesignacaoDetails } from "../../components/details/DesignacaoDetails";

export const Designacao = () => {
  const { pendentes, loading, error, refetch } = useDesignacao();

  const [beneficiarioEmFoco, setBeneficiarioEmFoco] =
    useState<Beneficiario | null>(null);

  const [dentistaSelecionado, setDentistaSelecionado] =
    useState<Dentista | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const solicitarDesignacao = (b: Beneficiario, d: Dentista) => {
    setBeneficiarioEmFoco(b);
    setDentistaSelecionado(d);
    setModalOpen(true);
  };

  const cancelarDesignacao = () => {
    setModalOpen(false);
    setBeneficiarioEmFoco(null);
    setDentistaSelecionado(null);
  };

  const confirmarDesignacao = () => {
    // futura integração API
    console.log("Designado:", beneficiarioEmFoco, dentistaSelecionado);

    cancelarDesignacao();
    refetch();
  };

  return (
    <>
      {/* Modal */}
      <Modal open={modalOpen} onClose={cancelarDesignacao}>
        {beneficiarioEmFoco && dentistaSelecionado && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-darkgray font-fredoka">
                Confirmar Designação
              </h2>
              <div className="h-1 w-16 mt-1 bg-lightgreen" />
            </div>

            <div className="space-y-4">
              {/* Beneficiário */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-black uppercase text-gray-400 mb-1">
                  Beneficiário
                </p>
                <p className="font-bold text-darkgray">
                  {beneficiarioEmFoco.nome}
                </p>
                <p className="text-xs text-gray-500">
                  {beneficiarioEmFoco.email} · {beneficiarioEmFoco.telefone}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {beneficiarioEmFoco.cidade} — {beneficiarioEmFoco.estado}
                </p>
              </div>

              {/* Dentista */}
              <div className="bg-lightgreen/5 rounded-xl p-4 border border-lightgreen/20">
                <p className="text-xs font-black uppercase text-darkgreen mb-1">
                  Dentista
                </p>
                <p className="font-bold text-darkgray">
                  {dentistaSelecionado.nome}
                </p>
                <p className="text-xs text-gray-500">
                  {dentistaSelecionado.email} · {dentistaSelecionado.telefone}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  CRO: {dentistaSelecionado.cro}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Recomenda-se entrar em contato com o dentista antes da confirmação
              para alinhar disponibilidade e detalhes do atendimento.
              Importante repassar as informações necessárias ao beneficiário!
            </p>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={cancelarDesignacao}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={confirmarDesignacao}>
                Confirmar designação
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AsyncEstado
        loading={loading}
        error={error}
        vazio={!pendentes.length}
        mensagemVazio="Nenhum beneficiário pendente."
      >
        <UserManagementPage<Beneficiario>
          title="Designação"
          users={pendentes}
          getId={(b) => b.id}
          renderCard={(b, selected, select) => (
            <UserCard
              className={`border-l-4 border-l-amber p-5 transition-all
    ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <p className="text-xl sm:text-2xl font-bold text-black leading-tight">
                    {b.nome}
                  </p>
                </div>

                <p className="text-sm text-gray-500 font-medium">
                  <span className="font-bold text-xs uppercase mr-1">
                    Programa:
                  </span>
                  {b.programaSocial}
                </p>

                <p className="text-sm text-gray-500 font-medium">
                  <span className="font-bold text-xs uppercase mr-1">
                    Localização:
                  </span>
                  {b.cidade} — {b.estado}
                </p>
              </div>

              <div className="mt-4 pt-4 flex flex-col gap-3 border-t border-gray/10 lg:border-t-0 lg:text-end">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  ID: #{b.id}
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
            <DesignacaoDetails
              data={b}
              dentistaSelecionado={dentistaSelecionado}
              setDentistaSelecionado={setDentistaSelecionado}
              onDesignar={solicitarDesignacao}
              onClose={close}
            />
          )}
        />
      </AsyncEstado>
    </>
  );
};
