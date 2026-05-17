import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { CreateDentista } from "../../components/forms/create/CreateDentista";
import { DentistaDetails } from "../../components/details/DentistaDetails";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import { useDentistas, useDentista } from "../../hooks/useDentistas";
import type { DentistaCompleto } from "../../services/DentistaService";
import { getUser } from "../../hooks/useUser";
import { dentistaFilterConfig } from "../../hooks/pageFilterConfigs";

const DentistaPainel = ({
  cpf,
  isAdmin,
  onClose,
  onDeleted,
  onUpdated,
}: {
  cpf: string;
  isAdmin: boolean;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}) => {
  const { data, loading, error, refetch: refetchSingle } = useDentista(cpf);
  
  return (
    <AsyncEstado loading={loading} error={error} vazio={!data}>
      <DentistaDetails 
        data={data!} 
        isAdmin={isAdmin} 
        onClose={onClose} 
        onDeleted={onDeleted} 
        onUpdated={() => {
          onUpdated();
          if (refetchSingle) refetchSingle();
        }}
      />
    </AsyncEstado>
  );
};

export const Dentistas = () => {
  const loggerUser = getUser();
  const isAdmin = loggerUser?.role === "admin";
  const { data: dentistas, loading, error, refetch } = useDentistas();

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
        filterConfig={dentistaFilterConfig}
        renderCreateForm={(close) => <CreateDentista onSuccess={close} />}
        renderCard={(u, selected, select) => (
          <UserCard
            className={`transition-all border-l-4 border-lightgreen p-5 ${
              selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"
            }`}
          >
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold text-darkgray leading-tight">
                {u.nomeCompleto}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-darkgray uppercase text-xs mr-1">CRO:</span>
                {u.croDentista}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-darkgray uppercase text-xs mr-1">Especialidade:</span>
                {u.especialidades.length > 0
                  ? u.especialidades.join(", ")
                  : "Não informado"}
              </p>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
                  u.disponivel
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {u.disponivel ? "Disponível" : "Indisponível"}
              </span>
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
          <DentistaPainel
            cpf={user.cpf}
            isAdmin={isAdmin}
            onClose={close}
            onDeleted={refetch}
            onUpdated={refetch}
          />
        )}
      />
    </AsyncEstado>
  );
};