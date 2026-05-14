import React from "react";
import { FilterBar } from "../ui/FilterBar";
import { Button } from "../ui/Button";
import Search from "../ui/Search";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Modal } from "../ui/Modal";
import { getUser } from "../../hooks/useUser";
import { useSearchParams } from "react-router-dom";
import { useSmartFilter } from "../../hooks/useSmartFilter";
import type { PageFilterConfig, FilterGroup } from "./FilterConfig";

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
  filterConfig?: PageFilterConfig<T>;
};

function FilterGroupSelect({
  group,
  activeValue,
  onToggle,
}: {
  group: FilterGroup;
  activeValue: string;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      <label className="text-xs font-medium text-gray-500">{group.label}</label>

      <div className="relative">
        <select
          value={activeValue}
          onChange={(e) => onToggle(e.target.value)}
          className="
            w-full
            h-10
            px-3 pr-10

            bg-white

            border border-gray-300
            rounded-md

            text-sm text-gray-700

            appearance-none
            outline-none

            transition-all duration-200

            hover:border-gray-400
            focus:border-gray-500
          "
        >
          <option value="">Todos</option>

          {group.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Arrow */}
        <div
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2

            pointer-events-none
            text-gray-400
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Toolbar({
  children,
  search,
  actions,
}: {
  children?: React.ReactNode;
  search: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="w-full mb-6">
      <div
        className="
          flex flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
        "
      >
        {/* Filtros */}
        <div className="shrink-0">
          {React.Children.count(children) > 0 && (
            <FilterBar>{children}</FilterBar>
          )}
        </div>

        {/* Direita */}
        <div
          className="
            flex items-center
            gap-3
            w-full
            lg:w-auto
          "
        >
           {/* CTA */}
          {actions && (
            <div className="shrink-0">
              {actions}
            </div>
          )}
          
          {/* Search */}
          <div className="flex-1 lg:w-[340px]">
            {search}
          </div>
        </div>
      </div>
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

  const defaultConfig: PageFilterConfig<T> = React.useMemo(
    () => ({ groups: [], predicate: () => true }),
    [],
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
    return users.find((u) => String(getId(u)) === selectedId) ?? null;
  }, [selectedId, users, getId]);

  const handleSelect = (user: T) =>
    setSearchParams({ id: String(getId(user)) });

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
      {/* ── Toolbar: layout da barra de ação ── */}
      <Toolbar
        search={
          <Search
            placeholder={`Pesquisar ${title.toLowerCase()}...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
        actions={
          showCreateButton && renderCreateForm ? (
            <Button variant="primary" onClick={() => setOpen(true)}>
              Criar Conta
            </Button>
          ) : undefined
        }
      >
        {/* Grupos de filtro — passados como children para FilterBar via Toolbar */}
        {config.groups.map((group) => (
          <FilterGroupSelect
            key={group.key}
            group={group}
            activeValue={activeFilters[group.key] ?? ""}
            onToggle={(val) => toggleFilter(group.key, val)}
          />
        ))}

        {/* Limpar filtros — só aparece quando há filtro ativo */}
        {hasActiveFilters && (
          <div className="flex flex-col justify-end pb-0.5">
            <button
              type="button"
              onClick={clearAll}
              className="
                text-sm
                text-gray-500
                hover:text-black
                transition-colors
                whitespace-nowrap
              "
            >
              Limpar filtros
            </button>
          </div>
        )}
      </Toolbar>

      {/* Modal de criar */}
      {open && showCreateButton && renderCreateForm && (
        <Modal open={open} onClose={() => setOpen(false)}>
          {renderCreateForm(() => setOpen(false))}
        </Modal>
      )}

      {/* Contador de resultados */}
      {hasActiveFilters && (
        <p className="text-sm text-gray-500 -mt-4">
          {filteredItems.length === 0
            ? "Nenhum resultado encontrado."
            : `${filteredItems.length} resultado${filteredItems.length !== 1 ? "s" : ""} encontrado${filteredItems.length !== 1 ? "s" : ""}.`}
        </p>
      )}

      {/* ── Conteúdo principal ── */}
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
          {/* Cards */}
          <div
            className={`grid gap-6 w-full transition-all duration-300 ${
              selectedUser
                ? "grid-cols-1"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
            }`}
          >
            {filteredItems.map((user) => {
              const id = getId(user);
              const selected = !!(selectedUser && getId(selectedUser) === id);
              return (
                <div key={id}>
                  {renderCard(user, selected, () => handleSelect(user))}
                </div>
              );
            })}
          </div>

          {/* Detalhe — desktop sticky */}
          {selectedUser && (
            <div className="hidden xl:flex flex-col gap-4 xl:sticky xl:top-24 h-fit w-full">
              {renderDetails(selectedUser, handleClose)}
            </div>
          )}

          {/* Detalhe — mobile modal */}
          {selectedUser && (
            <div className="xl:hidden">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={handleClose}
              />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-[500px] max-h-[85vh] overflow-hidden">
                {renderDetails(selectedUser, handleClose)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
