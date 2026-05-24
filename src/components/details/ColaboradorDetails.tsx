import { excluirColaborador, type ColaboradorCompleto } from "../../services/ColaboradorService";
import { formatCPF } from "../../utils/formatUtils";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditCoordButton from "../ui/buttonFilters/EditCoordButton";

type ColaboradorDetailsProps = {
  data: ColaboradorCompleto;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
};

export const ColaboradorDetails = ({
  data,
  onClose,
  onDeleted,
  onUpdated,
}: ColaboradorDetailsProps) => (
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
              ID Colaborador
            </span>
            <span className="text-lg font-mono font-bold text-darkgray">#{data.id}</span>
          </div>
        </div>

        {/* Data de contratação — faixa de destaque */}
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl mb-6">
          <div>
            <p className="text-xs font-black uppercase text-gray-400">Contratado em</p>
            <p className="font-bold text-darkgray">{data.dataContratacao}</p>
          </div>
        </div>

        {/* Grid principal de 2 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Coluna esquerda: Dados pessoais */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Dados Pessoais
            </p>

            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">CPF</p>
                <p className="text-darkgray font-medium text-lg">{formatCPF(data.cpf)}</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Nascimento</p>
                <p className="text-darkgray font-medium text-lg">{data.dataNascimento}</p>
              </div>
            </div>
          </div>

          {/* Coluna direita: Contato corporativo */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Contato Corporativo
            </p>

            <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                E-mail Corporativo
              </p>
              <p className="text-darkgray font-medium break-all">{data.email}</p>
              <a
                href={`mailto:${data.email}`}
                className="text-xs text-darkgreen font-bold hover:underline mt-3 inline-block"
              >
                Enviar E-mail agora
              </a>
            </div>
          </div>
        </div>
      </div>

      <UserActions>
        <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
          <DeleteUserButton
            userName={data.nomeCompleto}
            onConfirm={async () => {
              await excluirColaborador(data.cpf);
              onClose();
              onDeleted();
            }}
          />
          <EditCoordButton user={data} onUpdated={onUpdated} />
          <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none">
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);
