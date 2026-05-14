import React from "react";
import { FilterBar } from "../ui/FilterBar";
import { Button } from "../ui/Button";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Modal } from "../ui/Modal";
import { getUser } from "../../hooks/useUser";
import { useSearchParams } from "react-router-dom";
import { useSmartFilter } from "../../hooks/useSmartFilter";
import type { PageFilterConfig } from "./FilterConfig";
import type { FilterGroup } from "./FilterConfig";

type UserManagementPageProps<T> = {
  title: string;
  users: T[];
  getId: (user: T) => string | number;
  renderCard: (
    user: T,
    selected: boolean,
    select: () => void
  ) => React.ReactNode;
  renderDetails: (user: T, close: () => void) => React.ReactNode;
  renderCreateForm?: (close: () => void) => React.ReactNode;
  filterConfig?: PageFilterConfig<T>;
};

/** Botões de filtro de um único grupo */
function FilterGroupButtons({
  group,
  activeValue,
  onToggle,
}: {
  group: FilterGroup;
  activeValue: string;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {group.options.map((opt) => {
        const isActive = activeValue === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen
              ${
                isActive
                  ? "bg-darkgreen text-white border-darkgreen shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-darkgreen hover:text-darkgreen"
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function UserManagementPage<T>({
  title,
  users,
  getId,
  renderCard,
  renderDetails,
  renderCreateForm,
  filterConfig,
}: UserManagementPageProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = React.useState(false);

  // Configuração default sem grupos (só busca por texto genérica)
  const defaultConfig: PageFilterConfig<T> = React.useMemo(
    () => ({
      groups: [],
      predicate: () => true,
    }),
    []
  );

  const config = filterConfig ?? defaultConfig;

  const {
    filteredItems,
    searchText,
    setSearchText,
    activeFilters,
    toggleFilter,
    clearAll,
    hasActiveFilters,
  } = useSmartFilter(users, config);

  const selectedId = searchParams.get("id");

  const selectedUser = React.useMemo(() => {
    if (!selectedId) return null;
    return users.find((user) => String(getId(user)) === selectedId) || null;
  }, [selectedId, users, getId]);

  // Quando o item selecionado não está na lista filtrada, mantém na lista original
  const handleSelect = (user: T) => {
    setSearchParams({ id: String(getId(user)) });
  };

  const handleClose = () => {
    searchParams.delete("id");
    setSearchParams(searchParams);
  };

  // Permissões
  const loggedUser = getUser();
  const isAdmin = loggedUser?.role === "admin";
  const isCoord = loggedUser?.role === "coordenador";

  const isBeneficiarioPage = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes("beneficiario");

  const showCreateButton = isAdmin || (isCoord && isBeneficiarioPage);

  useScrollLock(!!selectedUser);

  const emptyAfterFilter =
    filteredItems.length === 0 && users.length > 0 && hasActiveFilters;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full px-4 lg:px-8">
      {/* ── FilterBar com filtros inteligentes ── */}
      <FilterBar
        searchPlaceholder={`Pesquisar ${title.toLowerCase()}...`}
        searchValue={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
      >
        {/* Grupos de filtros específicos da página */}
        {config.groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
              {group.label}
            </span>
            <FilterGroupButtons
              group={group}
              activeValue={activeFilters[group.key] ?? ""}
              onToggle={(val) => toggleFilter(group.key, val)}
            />
          </div>
        ))}

        {/* Botão "Limpar filtros" aparece quando algum filtro está ativo */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="self-end px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
          >
            Limpar filtros
          </button>
        )}

        {/* Botão de criar conta */}
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

      {/* Contador de resultados quando filtrado */}
      {hasActiveFilters && (
        <p className="text-sm text-gray-500 -mt-2">
          {filteredItems.length === 0
            ? "Nenhum resultado encontrado."
            : `${filteredItems.length} resultado${filteredItems.length !== 1 ? "s" : ""} encontrado${filteredItems.length !== 1 ? "s" : ""}.`}
        </p>
      )}

      {emptyAfterFilter ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <p className="text-gray-400 text-lg font-medium">
            Nenhum resultado para os filtros selecionados.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-bold text-darkgreen hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
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
            {filteredItems.map((user) => {
              const id = getId(user);
              const selected = selectedUser && getId(selectedUser) === id;

              return (
                <div key={id}>
                  {renderCard(user, !!selected, () => handleSelect(user))}
                </div>
              );
            })}
          </div>

          {selectedUser && (
            <div className="hidden xl:flex flex-col gap-4 xl:sticky xl:top-24 h-fit w-full">
              {renderDetails(selectedUser, handleClose)}
            </div>
          )}

          {selectedUser && (
            <div className="xl:hidden">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
                onClick={handleClose}
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
                {renderDetails(selectedUser, handleClose)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
