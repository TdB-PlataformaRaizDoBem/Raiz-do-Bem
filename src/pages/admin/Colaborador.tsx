import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { CreateCoord } from "../../components/forms/create/CreateCoord";
import { ColaboradorDetails } from "../../components/details/ColaboradorDetails";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import { useColaboradores, useColaborador } from "../../hooks/useColaboradores";
import { type ColaboradorCompleto } from "../../services/ColaboradorService";
import { colaboradorFilterConfig } from "../../hooks/pageFilterConfigs";

const ColaboradorPainel = ({ id, onClose, onDeleted }: { id: number; onClose: () => void; onDeleted: () => void }) => {
  const { data, loading, error } = useColaborador(id);
  return (
    <AsyncEstado loading={loading} error={error} vazio={!data}>
      <ColaboradorDetails data={data!} onClose={onClose} onDeleted={onDeleted} />
    </AsyncEstado>
  );
};

export default function Colaborador() {
  const { data: colaboradores, loading, error, refetch } = useColaboradores();

  return (
    <AsyncEstado loading={loading} error={error} vazio={!colaboradores?.length} mensagemVazio="Nenhum colaborador cadastrado.">
      <UserManagementPage<ColaboradorCompleto>
        title="Gerenciamento de Colaboradores"
        users={colaboradores ?? []}
        getId={(u) => u.id}
        filterConfig={colaboradorFilterConfig}
        renderCreateForm={(close) => <CreateCoord onSuccess={close} />}
        renderCard={(u, selected, select) => (
          <UserCard className={`transition-all border-l-4 border-lightgreen p-5 ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold text-darkgray leading-tight">{u.nomeCompleto}</p>
              <p className="text-sm text-gray-500 font-medium mb-2">
                <span className="font-bold text-darkgray uppercase text-xs mr-1">
                  {u.nivelAcesso ?? "colaborador"}:
                </span>
                {u.email}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs lg:text-end font-black uppercase text-gray-400 tracking-widest">
                ID: #{u.id}
              </span>
              <Button
                onClick={select}
                variant={selected ? "primary" : "secondary"}
                className="w-full lg:w-auto py-2 px-6 text-xs font-bold shadow-sm active:scale-95 transition-transform"
              >
                Visualizar Perfil
              </Button>
            </div>
          </UserCard>
        )}
        renderDetails={(user, close) => (
          <ColaboradorPainel id={user.id} onClose={close} onDeleted={refetch} />
        )}
      />
    </AsyncEstado>
  );
}
