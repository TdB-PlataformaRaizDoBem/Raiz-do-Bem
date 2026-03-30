import React from "react";
import { FilterBar } from "../ui/FilterBar";
import { Button } from "../ui/Button";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Modal } from "../ui/Modal";
import { getUser } from "../../hooks/useUser";

type UserManagementPageProps<T> = {
  title: string;
  users: T[];
  getId: (user: T) => string | number;
  renderCard: (
    user: T,
    selected: boolean,
    select: () => void,
  ) => React.ReactNode;
  renderDetails: (user: T, close: () => void) => React.ReactNode;
  renderCreateForm?: (close: () => void) => React.ReactNode;
};

export function UserManagementPage<T>({
  title,
  users,
  getId,
  renderCard,
  renderDetails,
  renderCreateForm,
}: UserManagementPageProps<T>) {
  const [selectedUser, setSelectedUser] = React.useState<T | null>(null);
  const [open, setOpen] = React.useState(false);

  // Validação de usuário
  const loggedUser = getUser();
  const isAdmin = loggedUser?.role === "admin";
  const isCoord = loggedUser?.role === "coordenador";

  //verificar se é pág de beneficiários
  const isBeneficiarioPage = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes("beneficiario");

  // botão de criar conta livre para apenas admin e coordenadores com beneficiário
  const showCreateButton = isAdmin || (isCoord && isBeneficiarioPage);

  useScrollLock(!!selectedUser);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full px-4 lg:px-8">
      <FilterBar
        searchLabel="Opções e Filtros:"
        searchPlaceholder={`Pesquisar ${title.toLowerCase()}...`}
      >
        <Button>Todos</Button>

        {showCreateButton && renderCreateForm && (
          <Button variant="primary" onClick={() => setOpen(true)}>
            Criar Conta
          </Button>
        )}

        {open && showCreateButton && renderCreateForm && (
          <Modal open={open} onClose={() => setOpen(false)}>
            {renderCreateForm(() => setOpen(false))}
          </Modal>
        )}
      </FilterBar>

      <div
        className={`grid gap-8 items-start w-full transition-all duration-300 ${
          selectedUser ? "xl:grid-cols-[1fr_450px]" : "grid-cols-1"
        }`}
      >
        <div
          className={`grid gap-6 w-full transition-all duration-300 ${
            selectedUser
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
          }`}
        >
          {users.map((user) => {
            const id = getId(user);
            const selected = selectedUser && getId(selectedUser) === id;

            return (
              <div key={id}>
                {renderCard(user, !!selected, () => setSelectedUser(user))}
              </div>
            );
          })}
        </div>

        {selectedUser && (
          <div className="hidden xl:flex flex-col gap-4 xl:sticky xl:top-24 h-fit w-full">
            {renderDetails(selectedUser, () => setSelectedUser(null))}
          </div>
        )}

        {selectedUser && (
          <div className="xl:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
              onClick={() => setSelectedUser(null)}
            />

            <div
              className="
                fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                w-[92%] max-w-[500px] 
                max-h-[85vh] 
                overflow-hidden 
                xl:static xl:translate-x-0 xl:translate-y-0
                xl:w-full xl:max-w-none xl:max-h-none
                xl:overflow-visible
                "
            >
              {renderDetails(selectedUser, () => setSelectedUser(null))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
