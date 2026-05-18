import React from "react";
import { FilterBar } from "../ui/FilterBar";
import { Button } from "../ui/Button";
import Search from "../ui/Search";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Modal } from "../ui/Modal";
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
  extraActions?: React.ReactNode;
  mensagemVazio?: string;
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

        {/* Chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        <div className="w-full lg:w-auto shrink-0">
          {React.Children.count(children) > 0 && (
            <FilterBar>{children}</FilterBar>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

          {actions && (
            <div className="shrink-0 flex items-center gap-2 sm:justify-end justify-start">
              {actions}
            </div>
          )}
          
          <div className="flex-1 w-full lg:w-[340px] order-first sm:order-none">
            {search}
          </div>

        </div>
      </div>
    </div>
  );
}

type EmptyStateVariant = "lista-vazia" | "filtro-sem-resultado";

function EmptyState({
  variant,
  mensagemVazio,
  onClearFilters,
  showCreateButton,
  onCreate,
}: {
  variant: EmptyStateVariant;
  mensagemVazio: string;
  onClearFilters: () => void;
  showCreateButton: boolean;
  onCreate: () => void;
}) {
  if (variant === "filtro-sem-resultado") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-700 text-base font-semibold">
            Nenhum resultado encontrado
          </p>
          <p className="text-gray-400 text-sm">
            Nenhum registro corresponde aos filtros ou busca ativos.
          </p>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-bold text-darkgreen hover:underline transition-colors"
        >
          Limpar filtros e busca
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-gray-700 text-base font-semibold">{mensagemVazio}</p>
        {showCreateButton && (
          <p className="text-gray-400 text-sm">
            Use o botão acima para adicionar o primeiro registro.
          </p>
        )}
      </div>

      {showCreateButton && (
        <Button variant="primary" onClick={onCreate}>
          Criar agora
        </Button>
      )}
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
  extraActions,
  mensagemVazio = "Nenhum registro encontrado.",
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

  // O botão de criar agora depende apenas da existência da prop que renderiza o formulário
  const showCreateButton = !!renderCreateForm;

  useScrollLock(!!selectedUser);

  const listaOriginalVazia = users.length === 0;
  const filtroSemResultado =
    filteredItems.length === 0 && !listaOriginalVazia && hasActiveFilters;
  const temConteudo = filteredItems.length > 0;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full px-4 lg:px-8">
      <Toolbar
        search={
          <Search
            placeholder={`Pesquisar ${title.toLowerCase()}...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
        actions={
          showCreateButton || extraActions ? (
            <>
              {showCreateButton && (
                <Button variant="primary" onClick={() => setOpen(true)}>
                  Criar Conta
                </Button>
              )}
              {extraActions}
            </>
          ) : undefined
        }
      >
        {/* Grupos de filtro */}
        {config.groups.map((group) => (
          <FilterGroupSelect
            key={group.key}
            group={group}
            activeValue={activeFilters[group.key] ?? ""}
            onToggle={(val) => toggleFilter(group.key, val)}
          />
        ))}

        {hasActiveFilters && (
          <div className="flex flex-col justify-end pb-0.5">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-black transition-colors whitespace-nowrap"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </Toolbar>

      {open && showCreateButton && renderCreateForm && (
        <Modal open={open} onClose={() => setOpen(false)}>
          {renderCreateForm(() => setOpen(false))}
        </Modal>
      )}

      {hasActiveFilters && (
        <p className="text-sm text-gray-500 -mt-4">
          {filteredItems.length === 0
            ? "Nenhum resultado encontrado."
            : `${filteredItems.length} resultado${filteredItems.length !== 1 ? "s" : ""} encontrado${filteredItems.length !== 1 ? "s" : ""}.`}
        </p>
      )}

      {listaOriginalVazia && (
        <EmptyState
          variant="lista-vazia"
          mensagemVazio={mensagemVazio}
          onClearFilters={clearAll}
          showCreateButton={showCreateButton}
          onCreate={() => setOpen(true)}
        />
      )}

      {filtroSemResultado && (
        <EmptyState
          variant="filtro-sem-resultado"
          mensagemVazio={mensagemVazio}
          onClearFilters={clearAll}
          showCreateButton={showCreateButton}
          onCreate={() => setOpen(true)}
        />
      )}

      {temConteudo && (
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