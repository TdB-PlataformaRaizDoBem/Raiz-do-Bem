import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import { beneficiariosData } from "../../data/beneficiariosData";
import UserCard from "../../components/userCard/UserCard";
import UserInformation from "../../components/userInformation/UserInformation";
import UserActions from "../../components/userActions/UserActions";
import { Button } from "../../components/ui/Button";
import DeleteUserButton from "../../components/ui/buttonFilters/DeleteUserButton";
import { CreateBeneficiario } from "../../components/forms/create/CreateBeneficiario";
import EditBeneficiarioButton from "../../components/ui/buttonFilters/EditBeneficiarioButton";
import { getUser } from "../../hooks/useUser";

export const Beneficiarios = () => {
  const loggedUser = getUser();
  const isAdmin = loggedUser?.role === "admin";

  return (
    <UserManagementPage
      title="Gerenciamento de Beneficiários"
      users={beneficiariosData}
      getId={(u) => u.id}
      renderCreateForm={(close) => <CreateBeneficiario onSuccess={close} />}
      renderCard={(u, selected, select) => (
        <UserCard
          className={`transition-all border-l-4 border-amber p-5
            ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-xl font-bold text-darkgray leading-tight">
                {u.nome}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray uppercase text-xs mr-1">
                  Programa:
                </span>
                {u.programaSocial}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 flex flex-col gap-6">
            <span className="text-xs font-black sm:text-end uppercase text-gray-400 tracking-widest">
              #{u.id}
            </span>
            <Button
              onClick={select}
              variant={selected ? "primary" : "secondary"}
              className="w-full lg:w-auto py-2 px-6 text-xs font-bold shadow-sm active:scale-95 transition-transform"
            >
              Visualizar Detalhes
            </Button>
          </div>
        </UserCard>
      )}
      renderDetails={(user, close) => (
        <UserInformation>
          <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
            <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex-1 w-full text-left">
                {/* Cabeçalho de Detalhes */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                      {user.nome}
                    </h3>
                    <div className="h-1.5 w-20 mt-1 bg-amber" />
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                      ID Beneficiário
                    </span>
                    <span className="text-lg font-mono font-bold text-darkgray">
                      #{user.id}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Status do Programa */}
                  <div className="bg-amber/5 p-4 rounded-xl border border-amber/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-amber/60">
                        Programa Vinculado
                      </p>
                      <p className="text-lg font-bold text-amber">
                        {user.programaSocial}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase text-gray-400">
                        Sexo
                      </p>
                      <p className="font-bold text-darkgray">{user.sexo}</p>
                    </div>
                  </div>

                  {/* Grid de Informações Pessoais */}
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
                        CPF
                      </h4>
                      <p className="text-darkgray font-medium text-lg">
                        {user.cpf}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
                        Data de Nascimento
                      </h4>
                      <p className="text-darkgray font-medium text-lg">
                        {user.data_nascimento}
                      </p>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                      Localização
                    </h4>
                    <p className="text-darkgray leading-relaxed text-lg">
                      {user.logradouro}, {user.numero} <br />
                      {user.cidade} - {user.estado} <br />
                      <span className="text-sm font-bold">CEP: {user.cep}</span>
                    </p>
                  </div>

                  {/* Contato Principal */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                      <h4 className="text-xs font-black uppercase text-gray-400 mb-1">
                        E-mail
                      </h4>
                      <p className="text-darkgray font-medium break-all">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                      <h4 className="text-xs font-black uppercase text-gray-400 mb-1">
                        Telefone
                      </h4>
                      <p className="text-darkgray font-medium">
                        {user.telefone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <UserActions>
              <div className="grid grid-cols-3 md:flex-wrap gap-3 justify-end w-full">
                {isAdmin && (
                  <DeleteUserButton
                    userId={user.id}
                    userName={user.nome}
                    onDelete={close}
                  />
                )}
                <EditBeneficiarioButton user={user} />
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
