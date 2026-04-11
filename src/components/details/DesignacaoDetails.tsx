import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import type { Beneficiario } from "../../data/beneficiariosData";
import type { Dentista } from "../../data/dentistasData";
import { PedidoAjuda } from "../../data/pedidosAjudaData";
import { buscarDentistasProximos } from "../../services/DesignacaoService";

type Props = {
  data: Beneficiario;
  dentistaSelecionado: Dentista | null;
  setDentistaSelecionado: (d: Dentista | null) => void;
  onDesignar: (b: Beneficiario, d: Dentista) => void;
  onClose: () => void;
};

export const DesignacaoDetails = ({
  data,
  dentistaSelecionado,
  setDentistaSelecionado,
  onDesignar,
  onClose,
}: Props) => {
  const dentistas = buscarDentistasProximos(data);
  const pedido = PedidoAjuda.find(
    (p) => p.id === data.id_pedido_ajuda
  );

  const semDentistas = dentistas.length === 0;

  return (
    <UserInformation>
      <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">

        {/* SCROLL */}
        <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 custom-scrollbar">

          {/* HEADER */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                {data.nome}
              </h3>
              <div className="h-1.5 w-20 bg-amber mt-1" />
            </div>

            <div className="text-right">
              <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                ID Beneficiário
              </span>
              <span className="text-lg font-mono font-bold text-darkgray">
                #{data.id}
              </span>
            </div>
          </div>

          <div className="space-y-6">

            {/* INFO PRINCIPAL */}
            <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs font-black uppercase text-gray-400">
                  Programa
                </p>
                <p className="font-bold text-amber">
                  {data.programaSocial}
                </p>
              </div>

              <div className="w-px h-8 bg-gray-200" />

              <div>
                <p className="text-xs font-black uppercase text-gray-400">
                  Localização
                </p>
                <p className="font-bold text-darkgray">
                  {data.cidade} — {data.estado}
                </p>
              </div>
            </div>

            {/* PEDIDO VINCULADO */}
            {pedido && (
              <div className="bg-lightgreen/5 p-6 rounded-2xl border border-lightgreen/20">
                <h4 className="text-xs font-black uppercase text-darkgreen tracking-wider mb-2">
                  Pedido aprovado vinculado
                </h4>

                <p className="text-xs text-gray-500 font-mono">
                  Protocolo #{pedido.id} · {pedido.data}
                </p>

                <p className="text-sm text-darkgray mt-3 italic leading-relaxed">
                  "{pedido.descricao_problema}"
                </p>
              </div>
            )}

            {/* LISTA DE DENTISTAS */}
            <div>
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3">
                Dentistas disponíveis por proximidade
              </p>

              {/* EMPTY STATE */}
              {semDentistas && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm font-bold text-red-700">
                    Nenhum dentista disponível
                  </p>
                  <p className="text-xs text-red-500 mt-1 leading-relaxed">
                    Não há dentistas disponíveis em {data.cidade} ou no estado{" "}
                    {data.estado}. A designação está bloqueada.
                  </p>
                </div>
              )}

              {/* LISTA */}
              {!semDentistas && (
                <div className="flex flex-col gap-2">
                  {dentistas.map((d) => {
                    const selecionado = dentistaSelecionado?.id === d.id;

                    const mesmaCidade =
                      d.endereco.cidade === data.cidade ||
                      d.endereco.estado === data.estado;

                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() =>
                          setDentistaSelecionado(
                            selecionado ? null : d
                          )
                        }
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all
                          ${
                            selecionado
                              ? "border-darkgreen bg-lightgreen/10 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-bold text-darkgray text-sm">
                              {d.nome}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              CRO: {d.cro}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {d.endereco.cidade} — {d.endereco.estado}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full
                                ${
                                  mesmaCidade
                                    ? "bg-lightgreen/20 text-darkgreen"
                                    : "bg-amber/10 text-amber"
                                }`}
                            >
                              {mesmaCidade
                                ? "Mesma cidade"
                                : "Mesmo estado"}
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
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <UserActions>
          <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 md:flex-none"
            >
              Fechar
            </Button>

            <Button
              variant="primary"
              disabled={!dentistaSelecionado || semDentistas}
              className={`flex-1 md:flex-none ${
                !dentistaSelecionado || semDentistas
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() =>
                dentistaSelecionado &&
                onDesignar(data, dentistaSelecionado)
              }
            >
              {dentistaSelecionado
                ? `Designar ${dentistaSelecionado.nome.split(" ")[0]}`
                : "Selecione um dentista"}
            </Button>
          </div>
        </UserActions>
      </div>
    </UserInformation>
  );
};