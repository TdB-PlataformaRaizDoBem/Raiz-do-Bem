import React from "react";
import { FilterBar } from "../ui/FilterBar";
import { Button } from "../ui/Button";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Modal } from "../ui/Modal";
import { CreateCoord } from "../forms/create/CreateCoord";

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
};

export function UserManagementPage<T>({
  title,
  users,
  getId,
  renderCard,
  renderDetails,
}: UserManagementPageProps<T>) {
  const [selectedUser, setSelectedUser] = React.useState<T | null>(null);
  const [open, setOpen] = React.useState(false);

  useScrollLock(!!selectedUser);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full px-4 lg:px-8">
      <FilterBar
        searchLabel="Opções e Filtros:"
        searchPlaceholder={`Pesquisar ${title.toLowerCase()}...`}
      >
        <Button>Todos</Button>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Criar Conta
        </Button>

        {open && (
          <Modal open={open} onClose={() => setOpen(false)}>
            <CreateCoord onSuccess={() => setOpen(false)} />
          </Modal>
        )}
      </FilterBar>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-8 items-start">
        <div className="flex flex-col gap-4 w-full max-w-[900px] xl:mx-0">
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

        <div className="flex flex-col gap-4 xl:sticky xl:top-24 h-fit">
          {selectedUser && (
            <>
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
                onClick={() => setSelectedUser(null)}
              />

              <div
                className="
                fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                w-[92%] lg:w-[40%] max-h-[90vh] overflow-y-auto bg-white
                rounded-2xl shadow-2xl
                xl:static xl:translate-x-0 xl:translate-y-0
                xl:w-full xl:max-w-none xl:max-h-none
                xl:shadow-none
                xl:bg-transparent xl:overflow-visible
                "
              >
                {renderDetails(selectedUser, () => setSelectedUser(null))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
