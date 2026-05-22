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

        {/* Cabeçalho */}
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
            <span className="text-lg font-mono font-bold text-darkgray">
              #{data.id}
            </span>
          </div>
        </div>

        {/* Programa Social — faixa de destaque */}
        <div className="bg-amber/5 p-4 rounded-xl border border-amber/10 flex items-center mb-6">
          <div>
            <p className="text-xs font-black uppercase text-amber/60">
              Programa Vinculado
            </p>
            <p className="text-lg font-bold text-amber">
              {data.programaSocial ?? "Não informado"}
            </p>
          </div>
        </div>

        {/* Grid principal de 2 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Coluna esquerda: Dados pessoais + Endereço */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Dados Pessoais
            </p>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">CPF</p>
                <p className="text-darkgray font-semibold">{formatCPF(data.cpf)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Nascimento</p>
                <p className="text-darkgray font-semibold">{data.dataNascimento}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">
                  WhatsApp / Tel
                </p>
                <p className="text-sm font-bold text-darkgray">{formatPhone(data.telefone)}</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">
                  E-mail
                </p>
                <p className="text-sm font-bold text-darkgray truncate">{data.email}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                Localização
              </p>
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
            </div>
          </div>

          {/* Coluna direita: Pedido de inclusão */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Pedido de Inclusão
            </p>

            <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-300 flex-1">
              <p className="text-xs font-black uppercase text-gray-500 tracking-wider mb-3">
                Pedido ID: {data.pedido ? `(#${data.pedido.id})` : ""}
              </p>

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
            </div>
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
