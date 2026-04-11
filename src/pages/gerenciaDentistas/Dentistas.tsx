import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { CreateDentista } from "../../components/forms/create/CreateDentista";
import { DentistaDetails } from "../../components/details/DentistaDetails";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import { useDentistas, useDentista } from "../../hooks/useDentistas";
import type { DentistaCompleto } from "../../services/DentistaService";
import { getUser } from "../../hooks/useUser";

const DentistaPainel = ({
  id,
  isAdmin,
  onClose,
}: {
  id: number;
  isAdmin: boolean;
  onClose: () => void;
}) => {
  const { data, loading, error } = useDentista(id);

  return (
    <AsyncEstado loading={loading} error={error} vazio={!data}>
      <DentistaDetails data={data!} isAdmin={isAdmin} onClose={onClose} />
    </AsyncEstado>
  );
};

export const Dentistas = () => {
  const loggerUser = getUser();
  const isAdmin = loggerUser?.role === "admin";
  const { data: dentistas, loading, error } = useDentistas();

  return (
    <AsyncEstado
      loading={loading}
      error={error}
      vazio={!dentistas?.length}
      mensagemVazio="Nenhum dentista cadastrado."
    >
      <UserManagementPage<DentistaCompleto>
        title="Gerenciamento de Dentistas"
        users={dentistas ?? []}
        getId={(u) => u.id}
        renderCreateForm={(close) => <CreateDentista onSuccess={close} />}
        renderCard={(u, selected, select) => (
          <UserCard
            className={`transition-all border-l-4 border-lightgreen p-5
              ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}
          >
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold text-darkgray leading-tight">{u.nome}</p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-darkgray uppercase text-xs mr-1">CRO:</span>
                {u.cro}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-darkgray uppercase text-xs mr-1">Especialidade:</span>
                {u.especialidades.map((e) => e.descricao).join(", ")}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs lg:text-end font-black uppercase text-gray-400 tracking-widest">
                {u.programa}
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
          <DentistaPainel id={user.id} isAdmin={isAdmin} onClose={close} />
        )}
      />
    </AsyncEstado>
  );
};