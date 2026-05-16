import { excluirColaborador, type ColaboradorCompleto } from "../../services/ColaboradorService";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditCoordButton from "../ui/buttonFilters/EditCoordButton";

const SecaoAcesso = ({ data }: { data: ColaboradorCompleto }) => (
  <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
    <div className="w-px h-8 bg-gray-200" />
    <div>
      <p className="text-xs font-black uppercase text-gray-400">Contratado em</p>
      <p className="font-bold text-darkgray">{data.dataContratacao}</p>
    </div>
  </div>
);

const SecaoDadosPessoais = ({ data }: { data: ColaboradorCompleto }) => (
  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">CPF</h4>
      <p className="text-darkgray font-medium text-lg">{data.cpf}</p>
    </div>
    <div>
      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Nascimento</h4>
      <p className="text-darkgray font-medium text-lg">{data.dataNascimento}</p>
    </div>
  </div>
);

const SecaoContato = ({ data }: { data: ColaboradorCompleto }) => (
  <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
    <h4 className="text-xs font-black uppercase text-gray-400 mb-2">E-mail Corporativo</h4>
    <p className="text-darkgray font-medium break-all">{data.email}</p>
    <a
      href={`mailto:${data.email}`}
      className="text-xs text-darkgreen font-bold hover:underline mt-2 inline-block"
    >
      Enviar E-mail agora
    </a>
  </div>
);

type ColaboradorDetailsProps = {
  data: ColaboradorCompleto;
  onClose: () => void;
  onDeleted: () => void;
};

export const ColaboradorDetails = ({ data, onClose, onDeleted }: ColaboradorDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 custom-scrollbar">
        <div className="flex-1 w-full text-left">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold text-darkgray font-fredoka">{data.nomeCompleto}</h3>
            </div>
            <div className="text-right">
              <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                ID Colaborador
              </span>
              <span className="text-lg font-mono font-bold text-darkgray">#{data.id}</span>
            </div>
          </div>

          <div className="space-y-6">
            <SecaoAcesso data={data} />
            <SecaoDadosPessoais data={data} />
            <SecaoContato data={data} />
          </div>
        </div>
      </div>

      <UserActions>
        <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
          <DeleteUserButton 
          userName={data.nomeCompleto} 
          onConfirm={async () => {
            await excluirColaborador(data.cpf)
            onClose();
            onDeleted();
          }}
          />
          <EditCoordButton user={data} />
          <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none">
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);