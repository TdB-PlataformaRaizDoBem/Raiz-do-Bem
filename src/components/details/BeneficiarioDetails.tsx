import type { BeneficiarioCompleto } from "../../services/Beneficiarioservice";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditBeneficiarioButton from "../ui/buttonFilters/EditBeneficiarioButton";
 
// Subcomponentes de seção — cada um renderiza uma fatia isolada do detalhe.
const SecaoVinculos = ({ data }: { data: BeneficiarioCompleto }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-gray/10 p-4 rounded-xl">
      <p className="text-xs font-black uppercase mb-2 tracking-widest">
        Dentista Responsável
      </p>
      {data.dentista ? (
        <>
          <p className="text-sm font-bold text-darkgray">{data.dentista.nome}</p>
          <p className="text-xs text-gray-500">CRO: {data.dentista.cro}</p>
        </>
      ) : (
        <p className="text-xs italic text-gray-400">Aguardando designação</p>
      )}
    </div>
 
    <div className="bg-gray/10 p-4 rounded-xl border border-purple-100">
      <p className="text-xs font-black uppercase mb-2 tracking-widest">
        Colaborador do Caso
      </p>
      {data.coordenador ? (
        <>
          <p className="text-sm font-bold text-darkgray">{data.coordenador.nomeCompleto}</p>
          <p className="text-xs text-gray-500">{data.coordenador.email}</p>
        </>
      ) : (
        <p className="text-xs italic text-gray-400">Não atribuído</p>
      )}
    </div>
  </div>
);
 
const SecaoPedido = ({ data }: { data: BeneficiarioCompleto }) => (
  <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-300">
    <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider mb-3">
      Relato Inicial do Pedido (#{data.id_pedido_ajuda})
    </h4>
    {data.pedido ? (
      <>
        <p className="text-sm text-darkgray leading-relaxed italic">
          "{data.pedido.descricao_problema}"
        </p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
            SITUAÇÃO: {data.pedido.situacao}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            Data do Pedido: {data.pedido.data}
          </span>
        </div>
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
      <p className="text-xs font-black uppercase text-amber/60">Programa Vinculado</p>
      <p className="text-lg font-bold text-amber">{data.programaSocial}</p>
    </div>
    <div className="text-right">
      <p className="text-xs font-black uppercase text-gray-400">Sexo</p>
      <p className="font-bold text-darkgray">{data.sexo}</p>
    </div>
  </div>
);
 
const SecaoDadosPessoais = ({ data }: { data: BeneficiarioCompleto }) => (
  <>
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">CPF</h4>
        <p className="text-darkgray font-medium text-lg">{data.cpf}</p>
      </div>
      <div>
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Nascimento</h4>
        <p className="text-darkgray font-medium text-lg">{data.dataNascimento}</p>
      </div>
    </div>
 
    <div className="grid grid-cols-1 gap-4">
      <div className="p-4 rounded-xl bg-white border border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase">WhatsApp / Tel</p>
        <p className="text-sm font-bold text-darkgray">{data.telefone}</p>
      </div>
      <div className="p-4 rounded-xl bg-white border border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase">E-mail de Contato</p>
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
    <p className="text-darkgray leading-relaxed text-lg">
      {data.logradouro}, {data.numero} <br />
      {data.cidade} - {data.estado} <br />
      <span className="text-sm font-bold">CEP: {data.cep}</span>
    </p>
  </div>
);
 
// Componente principal: compõe as seções e recebe dados já resolvidos.
type BeneficiarioDetailsProps = {
  data: BeneficiarioCompleto;
  isAdmin: boolean;
  onClose: () => void;
};
 
export const BeneficiarioDetails = ({ data, isAdmin, onClose }: BeneficiarioDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 w-full text-left">
 
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold text-darkgray font-fredoka">{data.nome}</h3>
              <div className="h-1.5 w-20 mt-1 bg-amber" />
            </div>
            <div className="text-right">
              <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                ID Beneficiário
              </span>
              <span className="text-lg font-mono font-bold text-darkgray">#{data.id}</span>
            </div>
          </div>
 
          <div className="space-y-6">
            <SecaoVinculos data={data} />
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
            <DeleteUserButton userId={data.id} userName={data.nome} onDelete={onClose} />
          )}
          <EditBeneficiarioButton user={data} />
          <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none">
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);