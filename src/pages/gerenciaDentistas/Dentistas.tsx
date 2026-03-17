import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import { dentistasMock, type Dentista } from "../../data/dentistasData";
import UserCard from "../../components/userCard/UserCard";
import UserInformation from "../../components/userInformation/UserInformation";
import UserActions from "../../components/userActions/UserActions";
import { Button } from "../../components/ui/Button";
import DeleteUserButton from "../../components/ui/buttonFilters/DeleteUserButton";
import { CreateDentista } from "../../components/forms/create/CreateDentista";
import EditDentistaButton from "../../components/ui/buttonFilters/EditDentistaButton";
import { getUser } from "../../hooks/useUser";

export const Dentistas = () => {
  const loggerUser = getUser();
  const isAdmin = loggerUser?.role === 'admin';

  return (
    <UserManagementPage
      title="Dentista"
      users={dentistasMock}
      getId={(u) => u.id}
      renderCreateForm={(close) => <CreateDentista onSuccess={close} />}
      renderCard={(u, selected, select) => (
        <UserCard
          className={`transition-all ${selected ? "shadow-md scale-[1.02] border-amber" : ""}`}
        >
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold text-darkgray">{u.nome}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm px-2 py-2 bg-primary/10 rounded-full font-black">
                CRO: {u.cro}
              </span>
            </div>
          </div>
          <div>
            <span className="text-sm px-2 py-1 bg-darkgreen/10 text-darkgreen rounded-full font-black">
              {u.programa}
            </span>
            <Button
              onClick={select}
              variant="secondary"
              className="text-xs mt-4 w-full"
            >
              Visualizar Perfil
            </Button>
          </div>
        </UserCard>
      )}
      renderDetails={(user: Dentista, close) => (
        <UserInformation>
          <div className="flex flex-col h-[85vh] md:h-auto max-w-3xl w-full">
            <div className="flex-1 overflow-y-auto p-1 pr-2 custom-scrollbar">
              <div className="flex-1 w-full text-left">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                      {user.nome}
                    </h3>
                    <p className="text-primary font-bold">CRO: {user.cro}</p>
                    <div className="h-1.5 w-20 bg-darkgreen mt-1" />
                  </div>
                  <span className="px-4 py-1.5 bg-darkgreen/10 text-darkgreen rounded-full text-sm font-bold shrink-0">
                    {user.programa}
                  </span>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl mt-6 shadow-sm">
                  {/* Dados Profissionais */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                      Dados Profissionais
                    </h4>
                    <p className="text-darkgray">
                      <b>Especialidade:</b> {user.especialidade}
                    </p>
                    <p className="text-darkgray">
                      <b>CPF:</b> {user.cpf}
                    </p>
                    <p className="text-darkgray">
                      <b>Sexo:</b> {user.sexo}
                    </p>
                  </div>

                  {/* Contato */}
                  <div className="space-y-3">
                    <h4 className="text-xs mt-4 font-black uppercase text-gray-400 tracking-wider mb-2">
                      Contato
                    </h4>
                    <p className="text-darkgray">
                      <b>E-mail:</b> {user.email}
                    </p>
                    <p className="text-darkgray">
                      <b>Telefone:</b> {user.telefone}
                    </p>
                  </div>

                  {/* Consultório */}
                  <div className="md:col-span-2 pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                      Endereço do Consultório
                    </h4>
                    <p className="text-darkgray">
                      <b>Endereço:</b> {user.logradouro}, {user.numero}
                    </p>
                    <p className="text-darkgray">
                      <b>Cidade:</b> {user.cidade} - {user.estado}
                    </p>
                    <p className="text-darkgray">
                      <b>CEP:</b> {user.cep}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <UserActions>
              <div className="sticky bottom-0 pt-2">
                <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end">
                  {isAdmin && (
                    <DeleteUserButton
                    userId={user.id}
                    userName={user.nome}
                    onDelete={close}
                  />
                  )}
                  
                  <EditDentistaButton user={user} />
                  <Button
                    variant="secondary"
                    onClick={close}
                    className="flex-1 md:flex-none"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </UserActions>
          </div>
        </UserInformation>
      )}
    />
  );
};
