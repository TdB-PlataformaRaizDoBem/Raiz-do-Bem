import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import { beneficiariosData } from "../../data/beneficiariosData";
import UserCard from "../../components/userCard/UserCard";
import UserInformation from "../../components/userInformation/UserInformation";
import UserActions from "../../components/userActions/UserActions";
import { Button } from "../../components/ui/Button";
import DeleteUserButton from "../../components/ui/buttonFilters/DeleteUserButton";
import { CreateBeneficiario } from "../../components/forms/create/CreateBeneficiario";
import EditBeneficiarioButton from "../../components/ui/buttonFilters/EditBeneficiarioButton";

export const Beneficiarios = () => {
  return (
    <UserManagementPage
      title="Beneficiário"
      users={beneficiariosData}
      getId={(u) => u.id}
      renderCreateForm={(close) => <CreateBeneficiario onSuccess={close} />}
      renderCard={(u, selected, select) => (
        <UserCard
          className={`transition-all ${selected ? "shadow-md scale-[1.02] border-amber" : ""}`}
        >
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold text-darkgray">{u.nome}</p>
            <span className="text-xs px-2 py-1 bg-darkgreen/10 text-darkgreen rounded-full w-fit font-bold">
              {u.programa}
            </span>
          </div>
          <Button onClick={select} variant="secondary" className="text-xs mt-4 w-full">
            Visualizar
          </Button>
        </UserCard>
      )}
      renderDetails={(user, close) => (
        <UserInformation>
          <div className="flex flex-col h-[85vh] md:h-auto max-w-3xl w-full">
            <div className="flex-1 overflow-y-auto p-1 pr-2 custom-scrollbar">
              <div className="flex-1 w-full text-left">
                <div className="flex justify-between items-start mb-2 top-0 pb-2">
                  <div>
                    <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                      {user.nome}
                    </h3>
                    <div className="h-1.5 w-20 bg-darkgreen mt-1" />
                  </div>

                  <span className="px-4 py-1.5 bg-darkgreen/10 text-darkgreen rounded-full text-sm font-bold shrink-0">
                    {user.programa}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-6 shadow-sm">
                  {/* Dados Pessoais */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                      Dados Pessoais
                    </h4>
                    <p className="text-darkgray">
                      <b>CPF:</b>{" "}
                      <span className="font-medium">{user.cpf}</span>
                    </p>
                    <p className="text-darkgray">
                      <b>Nascimento:</b>{" "}
                      <span className="font-medium">
                        {user.data_nascimento}
                      </span>
                    </p>
                    <p className="text-darkgray">
                      <b>Sexo:</b>{" "}
                      <span className="font-medium">{user.sexo}</span>
                    </p>
                  </div>

                  {/* Contato */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                      Contato
                    </h4>
                    <p className="text-darkgray">
                      <b>E-mail:</b>{" "}
                      <span className="font-medium">{user.email}</span>
                    </p>
                    <p className="text-darkgray">
                      <b>Telefone:</b>{" "}
                      <span className="font-medium">{user.telefone}</span>
                    </p>
                  </div>

                  {/* Localização */}
                  <div className="md:col-span-2 pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                      Localização
                    </h4>
                    <p className="text-darkgray">
                      <b>Endereço:</b>{" "}
                      <span className="font-medium">
                        {user.logradouro}, {user.numero}
                      </span>
                    </p>
                    <p className="text-darkgray">
                      <b>Cidade:</b>{" "}
                      <span className="font-medium">
                        {user.cidade} - {user.estado}
                      </span>
                    </p>
                    <p className="text-darkgray">
                      <b>CEP:</b>{" "}
                      <span className="font-medium">{user.cep}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <UserActions>
              <div className=" sticky bottom-0">
                <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end">
                  <DeleteUserButton
                    userId={user.id}
                    userName={user.nome}
                    onDelete={close}
                  />
                  <EditBeneficiarioButton user={user} />
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
