import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import { coordenadoresData } from "../../data/coordenadoresData";
import UserCard from "../../components/userCard/UserCard";
import UserInformation from "../../components/userInformation/UserInformation";
import UserActions from "../../components/userActions/UserActions";
import { Button } from "../../components/ui/Button";
import DeleteUserButton from "../../components/ui/buttonFilters/DeleteUserButton";
import { CreateCoord } from "../../components/forms/create/CreateCoord";
import EditCoordButton from "../../components/ui/buttonFilters/EditCoordButton";

export default function CoordenadorPage() {
  return (
    <UserManagementPage
      title="Gerenciamento de Coordenadores"
      users={coordenadoresData}
      getId={(u) => u.id}
      renderCreateForm={(close) => <CreateCoord onSuccess={close} />}
      renderCard={(u, selected, select) => (
        <UserCard
          className={`transition-all border-l-4 border-lightgreen p-5
            ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-xl font-bold text-darkgray leading-tight">
                {u.nomeCompleto}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500 font-medium mb-2">
                <span className="font-bold text-darkgray uppercase text-xs mr-">
                  {u.nivelAcesso}:
                </span>
                {u.email}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs lg:text-end font-black uppercase text-gray-400 tracking-widest">
              ID: #{u.idColaborador}
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
      renderDetails={(selectedCoord, close) => (
        <UserInformation>
          <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
            <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 custom-scrollbar">
              <div className="flex-1 w-full text-left">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-darkgray font-fredoka">
                      {selectedCoord.nomeCompleto}
                    </h3>
                    <div
                      className={`h-1.5 w-20 mt-1 ${selectedCoord.nivelAcesso === "admin" ? "bg-amber" : "bg-darkgreen"}`}
                    />
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                      ID Colaborador
                    </span>
                    <span className="text-lg font-mono font-bold text-darkgray">
                      #{selectedCoord.idColaborador}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="text-xs font-black uppercase text-gray-400">
                        Nível de Acesso
                      </p>
                      <p
                        className={`font-bold ${selectedCoord.nivelAcesso === "admin" ? "text-amber" : "text-darkgreen"}`}
                      >
                        {selectedCoord.nivelAcesso.toUpperCase()}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div>
                      <p className="text-xs font-black uppercase text-gray-400">
                        Contratado em
                      </p>
                      <p className="font-bold text-darkgray">
                        {selectedCoord.dataContratacao}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
                        CPF
                      </h4>
                      <p className="text-darkgray font-medium text-lg">
                        {selectedCoord.cpf}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">
                        Nascimento
                      </h4>
                      <p className="text-darkgray font-medium text-lg">
                        {selectedCoord.dataNascimento}
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber/5 p-6 rounded-2xl border border-amber/10">
                    <h4 className="text-xs font-black uppercase text-amber tracking-wider mb-3">
                      Endereço Residencial
                    </h4>
                    <p className="text-darkgray leading-relaxed text-lg">
                      {selectedCoord.logradouro}, {selectedCoord.numero} <br />
                      {selectedCoord.cidade} - {selectedCoord.estado} <br />
                      <span className="text-sm font-bold">
                        CEP: {selectedCoord.cep}
                      </span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <h4 className="text-xs font-black uppercase text-gray-400 mb-2">
                      E-mail Corporativo
                    </h4>
                    <p className="text-darkgray font-medium break-all">
                      {selectedCoord.email}
                    </p>
                    <a
                      href={`mailto:${selectedCoord.email}`}
                      className="text-xs text-darkgreen font-bold hover:underline mt-2 inline-block"
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
                  userId={selectedCoord.id}
                  userName={selectedCoord.nomeCompleto}
                  onDelete={() => close()}
                />
                <EditCoordButton user={selectedCoord} />
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
}