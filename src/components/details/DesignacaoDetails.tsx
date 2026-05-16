import { useState } from "react";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import type { PedidoViewModel } from "../../domain/mappers/PedidoMapper";

type Props = {
  data: PedidoViewModel;
  modoLeitura?: boolean;
  onDesignar?: (pedido: PedidoViewModel, prontuario: string) => void;
  onClose: () => void;
};

export const DesignacaoDetails = ({
  data,
  modoLeitura = false,
  onDesignar,
  onClose,
}: Props) => {
  const [prontuario, setProntuario] = useState("");

  return (
    <UserInformation>
      <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
        <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                {data.nomeCompleto}
              </h3>
              <div className="h-1.5 w-20 bg-amber mt-1" />
            </div>
            <div className="text-right">
              <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                Protocolo
              </span>
              <span className="text-lg font-mono font-bold text-darkgray">
                #{data.id}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs font-black uppercase text-gray-400">
                  Data do pedido
                </p>
                <p className="font-bold text-darkgray">{data.dataPedido}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xs font-black uppercase text-gray-400">
                  Localização
                </p>
                <p className="font-bold text-darkgray">
                  {data.endereco
                    ? `${data.endereco.cidade} — ${data.endereco.estado}`
                    : "Não informado"}
                </p>
              </div>
            </div>

            <div className="bg-lightgreen/5 p-6 rounded-2xl border border-lightgreen/20">
              <h4 className="text-xs font-black uppercase text-darkgreen tracking-wider mb-2">
                Descrição do caso
              </h4>
              <p className="text-sm text-darkgray italic leading-relaxed">
                "{data.descricaoProblema}"
              </p>
            </div>

            {modoLeitura && data.dentistaAtribuido && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                  Dentista responsável
                </h4>
                <p className="font-bold text-darkgray">
                  {data.dentistaAtribuido.nomeCompleto}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  CRO: {data.dentistaAtribuido.croDentista}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {data.dentistaAtribuido.email} ·{" "}
                  {data.dentistaAtribuido.telefone}
                </p>
                <span
                  className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    data.dentistaAtribuido.disponivel
                      ? "bg-lightgreen/20 text-darkgreen"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {data.dentistaAtribuido.disponibilidadeLabel}
                </span>
              </div>
            )}

            {!modoLeitura && (
              <div>
                <label
                  htmlFor="prontuario"
                  className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2"
                >
                  Prontuário inicial
                </label>
                <textarea
                  id="prontuario"
                  rows={4}
                  value={prontuario}
                  onChange={(e) => setProntuario(e.target.value)}
                  placeholder="Descreva o estado inicial do paciente, queixa principal e observações relevantes..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-darkgray placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-lightgreen/50 focus:border-lightgreen transition"
                />
              </div>
            )}
          </div>
        </div>

        <UserActions>
          <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 md:flex-none"
            >
              Fechar
            </Button>
            {!modoLeitura && (
              <Button
                variant="primary"
                disabled={!prontuario.trim()}
                className={`flex-1 md:flex-none ${!prontuario.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => onDesignar?.(data, prontuario.trim())}
              >
                Designar dentista
              </Button>
            )}
          </div>
        </UserActions>
      </div>
    </UserInformation>
  );
};
