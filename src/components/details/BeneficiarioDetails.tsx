import {
  excluirBeneficiario,
  type BeneficiarioCompleto,
} from "../../services/Beneficiarioservice";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditBeneficiarioButton from "../ui/buttonFilters/EditBeneficiarioButton";
import { formatCPF, formatPhone, formatCEP } from "../../utils/formatUtils";
import { Link } from "react-router-dom";
import { buildGlobalChatUrl } from "../../utils/Chatutils";
import { Section, ColLabel } from "./Section";

type BeneficiarioDetailsProps = {
  data: BeneficiarioCompleto;
  isAdmin: boolean;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
};

export const BeneficiarioDetails = ({
  data,
  isAdmin,
  onClose,
  onDeleted,
  onUpdated,
}: BeneficiarioDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        <div className="flex justify-between items-start mb-6 pb-5 border-b border-gray-100">
          <div>
            <h3 className="text-3xl font-bold text-darkgray font-fredoka">
              {data.nomeCompleto}
            </h3>
            <div className="h-1.5 w-20 mt-1 bg-amber" />
          </div>
          <div className="text-right shrink-0 ml-4">
            <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
              ID Beneficiário
            </span>
            <span className="text-lg font-mono font-bold text-darkgray">#{data.id}</span>
          </div>
        </div>

        <div className="bg-amber/5 p-4 rounded-xl border border-amber/10 flex items-center mb-6">
          <div>
            <p className="text-xs font-black uppercase text-amber/60">Programa Vinculado</p>
            <p className="text-lg font-bold text-amber">
              {data.programaSocial ?? "Não informado"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <ColLabel>Dados Pessoais</ColLabel>

            <Section
              variant="default"
              layout="grid"
              items={[
                { label: "CPF", value: formatCPF(data.cpf) },
                { label: "Nascimento", value: data.dataNascimento },
              ]}
            />

            <Section
              variant="default"
              items={[
                {
                  label: "WhatsApp / Tel",
                  value: (
                    <>
                      <p className="text-sm font-bold text-darkgray">{formatPhone(data.telefone)}</p>
                      {data.telefone && (
                        <Link
                          to={buildGlobalChatUrl(data.telefone)}
                          onClick={onClose}
                          className="mt-1.5 text-xs text-darkgreen font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
                            <path
                              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Iniciar conversa
                        </Link>
                      )}
                    </>
                  ),
                },
                { label: "E-mail", value: data.email },
              ]}
            />

            <Section variant="default" title="Localização">
              {data.endereco ? (
                <p className="text-darkgray leading-relaxed">
                  {data.endereco.logradouro}, {data.endereco.numero}
                  <br />
                  {data.endereco.bairro && data.endereco.bairro !== "—" && (
                    <>{data.endereco.bairro} — </>
                  )}
                  {data.endereco.cidade} - {data.endereco.estado}
                  <br />
                  <span className="text-sm font-bold">CEP: {formatCEP(data.endereco.cep)}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">Endereço não informado.</p>
              )}
            </Section>
          </div>

          <div className="flex flex-col gap-4">
            <ColLabel>Pedido de Inclusão</ColLabel>

            <Section
              variant="dashed"
              title={`Pedido ID: ${data.pedido ? `(#${data.pedido.id})` : ""}`}
              className="flex-1"
            >
              {data.pedido ? (
                data.pedido.dentistaResponsavel ? (
                  <div className="mt-2 pt-4 border-t border-gray-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                      Dentista Aprovador
                    </p>
                    <p className="text-sm font-bold text-darkgray">
                      {data.pedido.dentistaResponsavel}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-amber font-medium italic">
                    Nenhum dentista atribuído a este pedido.
                  </p>
                )
              ) : (
                <p className="text-xs text-gray-400">
                  Dados do pedido original não encontrados.
                </p>
              )}
            </Section>
          </div>
        </div>
      </div>

      <UserActions>
        <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
          {isAdmin && (
            <DeleteUserButton
              userName={data.nomeCompleto}
              onConfirm={async () => {
                await excluirBeneficiario(data.cpf);
                onClose();
                onDeleted();
              }}
            />
          )}
          <EditBeneficiarioButton user={data} onUpdated={onUpdated} />
          <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none">
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);
