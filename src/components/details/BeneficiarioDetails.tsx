import {
  excluirBeneficiario,
  type BeneficiarioCompleto,
} from "../../services/Beneficiarioservice";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditBeneficiarioButton from "../ui/buttonFilters/EditBeneficiarioButton";

const SecaoPedido = ({ data }: { data: BeneficiarioCompleto }) => (
  <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-300">
    <h4 className="font-black uppercase text-gray-500 tracking-wider mb-3">
      Pedido ID: {data.pedido ? `(#${data.pedido.id})` : ""}
    </h4>

    {data.pedido ? (
      <>
        {/* Dentista responsável pelo pedido */}
        {data.pedido.dentistaAprovador ? (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
              Dentista Aprovador
            </p>
            <p className="text-sm font-bold text-darkgray">
              {data.pedido.dentistaAprovador}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-amber font-medium italic">
            Nenhum dentista atribuído a este pedido.
          </p>
        )}
      </>
    ) : (
      <p className="text-xs text-gray-400">
        Dados do pedido original não encontrados.
      </p>
    )}
  </div>
);

const SecaoPrograma = ({ data }: { data: BeneficiarioCompleto }) => (
  <div className="bg-amber/5 p-4 rounded-xl border border-amber/10 flex items-center justify-between">
    <div>
      <p className="text-xs font-black uppercase text-amber/60">
        Programa Vinculado
      </p>
      <p className="text-lg font-bold text-amber">
        {data.programaSocial ?? "Não informado"}
      </p>
    </div>
  </div>
);

const SecaoDadosPessoais = ({ data }: { data: BeneficiarioCompleto }) => (
  <>
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
          CPF
        </h4>
        <p className="text-darkgray font-medium text-lg">{data.cpf}</p>
      </div>
      <div>
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
          Nascimento
        </h4>
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
        <p className="text-sm font-bold text-darkgray">{data.telefone}</p>
      </div>
      <div className="p-4 rounded-xl bg-white border border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase">
          E-mail de Contato
        </p>
        <p className="text-sm font-bold text-darkgray truncate">{data.email}</p>
      </div>
    </div>
  </>
);

const SecaoEndereco = ({ data }: { data: BeneficiarioCompleto }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
      Localização
    </h4>
    {data.endereco ? (
      <>
        <p className="text-darkgray leading-relaxed text-lg">
          {data.endereco.logradouro}, {data.endereco.numero}
          <br />
          {data.endereco.bairro && data.endereco.bairro !== "—" && (
            <>{data.endereco.bairro} — </>
          )}
          {data.endereco.cidade} - {data.endereco.estado}
          <br />
          <span className="text-sm font-bold">CEP: {data.endereco.cep}</span>
        </p>
      </>
    ) : (
      <p className="text-xs text-gray-400 italic">Endereço não informado.</p>
    )}
  </div>
);

type BeneficiarioDetailsProps = {
  data: BeneficiarioCompleto;
  isAdmin: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export const BeneficiarioDetails = ({
  data,
  isAdmin,
  onClose,
  onDeleted,
}: BeneficiarioDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 w-full text-left">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                {data.nomeCompleto}
              </h3>
              <div className="h-1.5 w-20 mt-1 bg-amber" />
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
            <SecaoPedido data={data} />
            <SecaoPrograma data={data} />
            <SecaoDadosPessoais data={data} />
            <SecaoEndereco data={data} />
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
          <EditBeneficiarioButton user={data} />
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 md:flex-none"
          >
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);
