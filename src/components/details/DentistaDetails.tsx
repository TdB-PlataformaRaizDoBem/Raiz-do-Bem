import { excluirDentista } from "../../services/DentistaService";
import type { DentistaViewModel } from "../../domain/mappers/DentistaMapper";
import { formatCPF, formatPhone } from "../../utils/formatUtils";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditDentistaButton from "../ui/buttonFilters/EditDentistaButton";

type DentistaDetailsProps = {
  data: DentistaViewModel;
  isAdmin: boolean;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
};

export const DentistaDetails = ({
  data,
  isAdmin,
  onClose,
  onDeleted,
  onUpdated,
}: DentistaDetailsProps) => (
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
              ID:
            </span>
            <span className="text-lg font-mono font-bold text-darkgray">
              #{data.id}
            </span>
          </div>
        </div>

        {/* Status — faixa de destaque */}
        <div className="flex gap-6 items-center bg-gray-50 p-4 rounded-xl mb-6">
          <div>
            <p className="text-xs font-black uppercase text-gray-400">Categoria</p>
            <p className="font-bold text-darkgreen">{data.categoria}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <p className="text-xs font-black uppercase text-gray-400">Disponibilidade</p>
            <p className="font-bold text-darkgray">{data.disponibilidadeLabel}</p>
          </div>
        </div>

        {/* Grid principal de 2 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Coluna esquerda: Dados profissionais */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Dados Profissionais
            </p>

            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Especialidade</p>
                <p className="text-darkgray font-medium">{data.especialidades}</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">CRO</p>
                <p className="text-darkgray font-medium">{data.croDentista}</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">CPF</p>
                <p className="text-darkgray font-medium">{formatCPF(data.cpf)}</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Sexo</p>
                <p className="text-darkgray font-medium">{data.sexoLabel}</p>
              </div>
            </div>
          </div>

          {/* Coluna direita: Contato + Consultório */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Contato & Consultório
            </p>

            <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-3">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">E-mail</p>
                <p className="text-darkgray font-medium break-all">{data.email}</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Telefone</p>
                <p className="text-darkgray font-medium">{formatPhone(data.telefone)}</p>
              </div>
            </div>

            <div className="bg-amber/5 p-5 rounded-2xl border border-amber/10">
              <p className="text-xs font-black uppercase text-amber mb-3">
                Endereço do Consultório
              </p>
              <p className="text-darkgray leading-relaxed">
                {data.logradouro ?? "Não informado"}
                {data.numero ? `, ${data.numero}` : ""}
                <br />
                {data.cidade ?? "Não informado"}
                {data.estado ? ` - ${data.estado}` : ""}
              </p>
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
                await excluirDentista(data.cpf);
                onClose();
                onDeleted();
              }}
            />
          )}
          <EditDentistaButton user={data} onUpdated={onUpdated} />
          <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none">
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);
