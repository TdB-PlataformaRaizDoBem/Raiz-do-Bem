import { useState } from "react";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import type { BeneficiarioViewModel } from "../../domain/mappers/Beneficiariomapper";
import type { AtendimentoViewModel } from "../../domain/mappers/AtendimentoMapper";

/*
 *  BeneficiarioDesignacaoDetails — aba PENDENTE
 *  Mostra os dados do beneficiário + input de prontuário inicial
 *  que será enviado em POST /atendimento.
 */

type BeneficiarioDetailsProps = {
  data: BeneficiarioViewModel;
  onDesignar: (beneficiario: BeneficiarioViewModel, prontuario: string) => void;
  onClose: () => void;
};

export const BeneficiarioDesignacaoDetails = ({
  data,
  onDesignar,
  onClose,
}: BeneficiarioDetailsProps) => {
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
                ID Beneficiário
              </span>
              <span className="text-lg font-mono font-bold text-darkgray">
                #{data.id}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
                  CPF
                </p>
                <p className="text-darkgray font-medium text-lg">{data.cpf}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
                  Nascimento
                </p>
                <p className="text-darkgray font-medium text-lg">
                  {data.dataNascimento}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-xl bg-white border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  WhatsApp / Tel
                </p>
                <p className="text-sm font-bold text-darkgray">
                  {data.telefone}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  E-mail
                </p>
                <p className="text-sm font-bold text-darkgray truncate">
                  {data.email}
                </p>
              </div>
            </div>

            {data.programaSocial && (
              <div className="bg-amber/5 p-4 rounded-xl border border-amber/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-amber/60">
                    Programa Vinculado
                  </p>
                  <p className="text-lg font-bold text-amber">
                    {data.programaSocial}
                  </p>
                </div>
              </div>
            )}

            {data.endereco && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                  Localização
                </h4>
                <p className="text-darkgray leading-relaxed">
                  {data.endereco.logradouro}, {data.endereco.numero}
                  <br />
                  {data.endereco.bairro && data.endereco.bairro !== "—" && (
                    <>{data.endereco.bairro} — </>
                  )}
                  {data.endereco.cidade} - {data.endereco.estado}
                  <br />
                  <span className="text-sm font-bold">
                    CEP: {data.endereco.cep}
                  </span>
                </p>
              </div>
            )}

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
              <p className="mt-2 text-xs text-gray-400 italic">
                O sistema selecionará automaticamente o dentista mais adequado
                após a confirmação.
              </p>
            </div>
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
            <Button
              variant="primary"
              disabled={!prontuario.trim()}
              className={`flex-1 md:flex-none ${
                !prontuario.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => onDesignar(data, prontuario.trim())}
            >
              Designar dentista
            </Button>
          </div>
        </UserActions>
      </div>
    </UserInformation>
  );
};

/* 
 *  AtendimentoDetails — abas EM_ATENDIMENTO, CONCLUIDO e TODOS
 *  - EM_ATENDIMENTO → mostra form de encerramento (prontuario + idColaborador)
 *  - CONCLUIDO -> leitura, mas com botão "Atualizar atendimento" que abre o mesmo form e reenvia PUT /atendimento/{cpf}
 *  - TODOS → comportamento dependendo de `encerrado`
 */

export interface EncerramentoPayload {
  prontuario: string;
  idColaborador: number;
}

type AtendimentoDetailsProps = {
  data: AtendimentoViewModel;
  modoLeitura?: boolean;
  permitirAtualizar?: boolean;
  onEncerrar?: (atendimento: AtendimentoViewModel, payload: EncerramentoPayload) => void;
  onClose: () => void;
};

export const AtendimentoDetails = ({
  data,
  modoLeitura = false,
  permitirAtualizar = false,
  onEncerrar,
  onClose,
}: AtendimentoDetailsProps) => {
  const [editando, setEditando] = useState<boolean>(!modoLeitura);
  const [prontuario, setProntuario] = useState<string>(
    data.prontuario && data.prontuario !== "—" ? data.prontuario : "",
  );
  const [idColaboradorTxt, setIdColaboradorTxt] = useState<string>("");

  const idColaborador = Number(idColaboradorTxt);
  const idColaboradorValido =
    idColaboradorTxt.trim().length > 0 &&
    Number.isFinite(idColaborador) &&
    idColaborador > 0;

  const podeSalvar = prontuario.trim().length > 0 && idColaboradorValido;

  const handleSubmit = () => {
    if (!podeSalvar || !onEncerrar) return;
    onEncerrar(data, {
      prontuario: prontuario.trim(),
      idColaborador,
    });
  };

  const statusLabel = data.encerrado ? "Concluído" : "Em atendimento";
  const statusClass = data.encerrado
    ? "bg-darkgreen/10 text-darkgreen"
    : "bg-amber/10 text-amber";

  return (
    <UserInformation>
      <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
        <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                {data.beneficiario}
              </h3>
              <div className="h-1.5 w-20 bg-amber mt-1" />
            </div>
            <div className="text-right">
              <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                Atendimento
              </span>
              <span className="text-lg font-mono font-bold text-darkgray">
                #{data.id}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-black uppercase text-gray-400">
                  Início
                </p>
                <p className="font-bold text-darkgray">{data.dataInicial}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-gray-400">
                  Finalização
                </p>
                <p className="font-bold text-darkgray">
                  {data.encerrado ? data.dataFim : "—"}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
                Dentista responsável
              </p>
              <p className="text-darkgray font-bold text-lg">{data.dentista}</p>
            </div>

            <div className="bg-lightgreen/5 p-6 rounded-2xl border border-lightgreen/20">
              <h4 className="text-xs font-black uppercase text-darkgreen tracking-wider mb-2">
                Prontuário atual
              </h4>
              <p className="text-sm text-darkgray italic leading-relaxed whitespace-pre-line">
                {data.prontuario && data.prontuario !== "—"
                  ? `"${data.prontuario}"`
                  : "Sem prontuário registrado."}
              </p>
            </div>

            {editando && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="prontuario-encerramento"
                    className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2"
                  >
                    {data.encerrado
                      ? "Atualizar prontuário"
                      : "Prontuário de encerramento"}
                  </label>
                  <textarea
                    id="prontuario-encerramento"
                    rows={4}
                    value={prontuario}
                    onChange={(e) => setProntuario(e.target.value)}
                    placeholder="Descreva o desfecho do atendimento, procedimentos realizados e observações finais..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-darkgray placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-lightgreen/50 focus:border-lightgreen transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="id-colaborador"
                    className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2"
                  >
                    ID do colaborador responsável
                  </label>
                  <input
                    id="id-colaborador"
                    type="number"
                    min={1}
                    value={idColaboradorTxt}
                    onChange={(e) => setIdColaboradorTxt(e.target.value)}
                    placeholder="Ex.: 12"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lightgreen/50 focus:border-lightgreen transition"
                  />
                  <p className="mt-1 text-xs text-gray-400 italic">
                    Identificador do colaborador que está registrando o
                    encerramento.
                  </p>
                </div>
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

            {/* Concluído + permitir atualizar: botão para reabrir o form */}
            {data.encerrado && permitirAtualizar && !editando && (
              <Button
                variant="primary"
                className="flex-1 md:flex-none"
                onClick={() => setEditando(true)}
              >
                Atualizar atendimento
              </Button>
            )}

            {/* Form aberto: botão de salvar */}
            {editando && onEncerrar && (
              <Button
                variant="primary"
                disabled={!podeSalvar}
                className={`flex-1 md:flex-none ${
                  !podeSalvar ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleSubmit}
              >
                {data.encerrado ? "Salvar alterações" : "Encerrar atendimento"}
              </Button>
            )}
          </div>
        </UserActions>
      </div>
    </UserInformation>
  );
};
