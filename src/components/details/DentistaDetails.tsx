import { excluirDentista, type DentistaCompleto } from "../../services/DentistaService";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditDentistaButton from "../ui/buttonFilters/EditDentistaButton";
 
const SecaoStatus = ({ data }: { data: DentistaCompleto }) => (
  <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
    <div>
      <p className="text-xs font-black uppercase text-gray-400">Programa</p>
      <p className="font-bold text-darkgreen">Não Informado</p>
    </div>
    <div className="w-px h-8 bg-gray-200" />
    <div>
      <p className="text-xs font-black uppercase text-gray-400">Disponibilidade</p>
      <p className="font-bold text-darkgray">{data.disponibilidadeLabel}</p>
    </div>
  </div>
);
 
const SecaoDadosProfissionais = ({ data }: { data: DentistaCompleto }) => (
  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h4 className="text-xs font-black uppercase text-gray-400 mb-1">Especialidade</h4>
      <p className="text-darkgray font-medium text-lg">
        {data.categoria}
        {/*{data.categoria.length > 0 ? data.especialidades.map((e) => e.descricao).join(", ") : "Não informado"}*/}
      </p>
    </div>
    <div>
      <h4 className="text-xs font-black uppercase text-gray-400 mb-1">CPF</h4>
      <p className="text-darkgray font-medium text-lg">{data.cpf}</p>
    </div>
    <div>
      <h4 className="text-xs font-black uppercase text-gray-400 mb-1">Sexo</h4>
      <p className="text-darkgray font-medium text-lg">{data.sexoLabel}</p>
    </div>
  </div>
);
 
const SecaoContato = ({ data }: { data: DentistaCompleto }) => (
  <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
    <h4 className="text-xs font-black uppercase text-gray-400 mb-2">Contato</h4>
    <p className="text-darkgray font-medium">{data.email}</p>
    <p className="text-darkgray font-medium mt-1">{data.telefone}</p>
  </div>
);
 
const SecaoEndereco = ({ data }: { data: DentistaCompleto }) => (
  <div className="bg-amber/5 p-6 rounded-2xl border border-amber/10">
    <h4 className="text-xs font-black uppercase text-amber mb-3">
      Endereço do Consultório
    </h4>
    <p className="text-darkgray leading-relaxed text-lg">
      {data.endereco?.logradouro}, {data.endereco?.numero}  <br />
      {data.endereco?.cidade} - {data.endereco?.estado} <br />
      <span className="text-sm font-bold">CEP: {data.endereco?.cep}</span>
    </p>
  </div>
);
 
type DentistaDetailsProps = {
  data: DentistaCompleto;
  isAdmin: boolean;
  onClose: () => void;
  onDeleted: () => void;
};
 
export const DentistaDetails = ({ data, isAdmin, onClose, onDeleted }: DentistaDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-3xl font-bold text-darkgray font-fredoka">{data.nomeCompleto}</h3>
            <div className="h-1.5 w-20 mt-1 bg-darkgreen" />
          </div>
          <div className="text-right">
            <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">CRO</span>
            <span className="text-lg font-mono font-bold text-darkgray">{data.croDentista}</span>
          </div>
        </div>
 
        <div className="space-y-6">
          <SecaoStatus data={data} />
          <SecaoDadosProfissionais data={data} />
          <SecaoContato data={data} />
          <SecaoEndereco data={data} />
        </div>
      </div>
 
      <UserActions>
        <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
          {isAdmin && (
            <DeleteUserButton 
              userName={data.nomeCompleto} 
              onConfirm={async (request) => {
                await excluirDentista(request, data.cpf);
                onClose();
                onDeleted();
              }}
            />
          )}
          <EditDentistaButton user={data}/>
          <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none">
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);