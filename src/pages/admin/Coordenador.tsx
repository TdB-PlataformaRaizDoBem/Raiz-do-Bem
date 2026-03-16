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
      title="Coordenador"
      users={coordenadoresData}
      getId={(u) => u.id}
      renderCreateForm={(close) => <CreateCoord onSuccess={close} />}
      renderCard={(u, selected, select) => (
        <UserCard
          className={`
            transition-all duration-300 ease-in-out
            ${
              selected
                ? "shadow-[0_0_12px_-4px_rgba(251,191,36,0.55)] transform scale-[1.03]"
                : "hover:shadow-sm"
            }
          `}
        >
          <div className="flex flex-col gap-4 justify-center">
            <p className="text-lg lg:text-xl font-bold text-darkgray leading-tight break-words">
              {u.nome}
            </p>

            <p className="text-sm text-gray-500 font-medium">{u.email}</p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end justify-between lg:h-full py-1">
            <p className="text-[10px] lg:text-xs uppercase tracking-wider text-gray-400 font-bold">
              {u.cidade} - {u.estado}
            </p>

            <Button
              onClick={select}
              variant="secondary"
              className="w-full lg:w-auto text-xs py-2 px-4"
            >
              Visualizar Conta
            </Button>
          </div>
        </UserCard>
      )}
      renderDetails={(selectedCoord, close) => (
        <UserInformation>
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col mb-6 relative">
              <span className="font-bold text-2xl text-darkgray">
                {selectedCoord.nome}
              </span>

              <div className="h-1 w-20 bg-darkgreen mt-2 rounded-full" />
            </div>

            <section className="flex flex-col gap-3">
              <h4 className="text-lg uppercase tracking-widest text-amber font-bold mt-6">
                Informações Pessoais
              </h4>

              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm">
                  <b>Email:</b> {selectedCoord.email}
                </p>

                <p className="text-sm">
                  <b>Data de Contratação:</b> {selectedCoord.data_contratacao}
                </p>
              </div>
            </section>

            <section className="flex flex-col gap-3 mb-6">
              <h4 className="text-lg uppercase tracking-widest text-amber font-bold mt-6">
                Endereço
              </h4>

              <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm">
                  <b>Logradouro:</b> {selectedCoord.logradouro},{" "}
                  {selectedCoord.numero}
                </p>

                <p className="text-sm">
                  <b>Cidade:</b> {selectedCoord.cidade}
                </p>

                <p className="text-sm">
                  <b>Estado:</b> {selectedCoord.estado}
                </p>

                <p className="text-sm">
                  <b>CEP:</b> {selectedCoord.cep}
                </p>
              </div>
            </section>
          </div>

          <UserActions>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <DeleteUserButton
                userId={selectedCoord.id}
                userName={selectedCoord.nome}
                onDelete={() => {
                  close();
                }}
              />

              <EditCoordButton user={selectedCoord}/>

              <Button variant="primary" onClick={close}>
                Fechar
              </Button>
            </div>
          </UserActions>
        </UserInformation>
      )}
    />
  );
}
