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
  const isAdmin = loggerUser?.role === "admin";

  return (
    <UserManagementPage<Dentista>
      title="Gerenciamento de Dentistas"
      users={dentistasMock}
      getId={(u) => u.id}
      renderCreateForm={(close) => <CreateDentista onSuccess={close} />}
      renderCard={(u, selected, select) => (
        <UserCard
          className={`transition-all border-l-4 border-lightgreen p-5
        ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}
        >
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold text-darkgray leading-tight">
              {u.nome}
            </p>

            <p className="text-sm text-gray-500 font-medium">
              <span className="font-bold text-darkgray uppercase text-xs mr-1">
                CRO:
              </span>
              {u.cro}
            </p>

            <p className="text-sm text-gray-500 font-medium">
              <span className="font-bold text-darkgray uppercase text-xs mr-1">
                Especialidade:
              </span>
              {u.especialidades.map(e => e.descricao).join(", ")}
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
        <UserInformation>
          <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
            {/* SCROLL */}
            <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* HEADER */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                    {user.nome}
                  </h3>
                  <div className="h-1.5 w-20 mt-1 bg-darkgreen" />
                </div>

                <div className="text-right">
                  <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                    CRO
                  </span>
                  <span className="text-lg font-mono font-bold text-darkgray">
                    {user.cro}
                  </span>
                </div>
              </div>

              {/* STATUS */}
              <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs font-black uppercase text-gray-400">
                    Programa
                  </p>
                  <p className="font-bold text-darkgreen">{user.programa}</p>
                </div>

                <div className="w-px h-8 bg-gray-200" />

                <div>
                  <p className="text-xs font-black uppercase text-gray-400">
                    Disponibilidade
                  </p>
                  <p className="font-bold text-darkgray">
                    {user.disponibilidade}
                  </p>
                </div>
              </div>

              {/* DADOS PROFISSIONAIS */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-400 mb-1">
                    Especialidade
                  </h4>
                  <p className="text-darkgray font-medium text-lg">
                    {user.especialidades.map(e => e.descricao).join(", ")}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase text-gray-400 mb-1">
                    CPF
                  </h4>
                  <p className="text-darkgray font-medium text-lg">
                    {user.cpf}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase text-gray-400 mb-1">
                    Sexo
                  </h4>
                  <p className="text-darkgray font-medium text-lg">
                    {user.sexo.tipo}
                  </p>
                </div>
              </div>

              {/* CONTATO */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm mt-6">
                <h4 className="text-xs font-black uppercase text-gray-400 mb-2">
                  Contato
                </h4>

                <p className="text-darkgray font-medium">{user.email}</p>

                <p className="text-darkgray font-medium mt-1">
                  {user.telefone}
                </p>
              </div>

              {/* ENDEREÇO */}
              <div className="bg-amber/5 p-6 rounded-2xl border border-amber/10 mt-6">
                <h4 className="text-xs font-black uppercase text-amber mb-3">
                  Endereço do Consultório
                </h4>

                <p className="text-darkgray leading-relaxed text-lg">
                  {user.endereco.logradouro}, {user.endereco.numero} <br />
                  {user.endereco.cidade} - {user.endereco.estado} <br />
                  <span className="text-sm font-bold">CEP: {user.endereco.cep}</span>
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <UserActions>
              <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
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
            </UserActions>
          </div>
        </UserInformation>
      )}
    />
  );
};
