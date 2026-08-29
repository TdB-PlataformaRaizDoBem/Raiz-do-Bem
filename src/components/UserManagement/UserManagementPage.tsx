import React from "react";
import { createPortal } from "react-dom";
import { FilterBar } from "../ui/FilterBar";
import { Button } from "../ui/Button";
import Search from "../ui/Search";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Modal } from "../ui/Modal";
import { useSearchParams } from "react-router-dom";
import { useSmartFilter } from "../../hooks/useSmartFilter";
import type { PageFilterConfig, FilterGroup } from "./FilterConfig";

type ViewMode = "cards" | "table";

const VIEW_MODE_KEY = "raiz-do-bem:view-mode";

function getInitialViewMode(): ViewMode {
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === "table" || saved === "cards") return saved;
  } catch {}
  return "cards";
}

function ViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Modo de visualização"
      className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0 h-10"
    >
      <button
        type="button"
        aria-label="Visualização em cards"
        aria-pressed={viewMode === "cards"}
        onClick={() => onChange("cards")}
        title="Cards"
        className={`flex items-center justify-center w-10 h-10 transition-colors ${
          viewMode === "cards"
            ? "bg-darkgreen text-white"
            : "bg-white text-gray-400 hover:bg-gray-50"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Visualização em tabela"
        aria-pressed={viewMode === "table"}
        onClick={() => onChange("table")}
        title="Tabela"
        className={`flex items-center justify-center w-10 h-10 transition-colors ${
          viewMode === "table"
            ? "bg-darkgreen text-white"
            : "bg-white text-gray-400 hover:bg-gray-50"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CardSlot — isola o cálculo do callback `select` por item e permite ao
// React.memo pular o re-render quando `user`, `selected` e `handleSelect`
// não mudarem (ex.: digitação na busca que não altera o item em questão).
// O renderCard precisa ser estável (useCallback no pai) para o efeito ser
// máximo; sem isso, só a estabilidade do select já ajuda.
// ---------------------------------------------------------------------------
type CardSlotProps<T> = {
  user: T;
  selected: boolean;
  handleSelect: (user: T) => void;
  renderCard: (user: T, selected: boolean, select: () => void) => React.ReactNode;
};

function CardSlotInner<T>({ user, selected, handleSelect, renderCard }: CardSlotProps<T>) {
  const select = React.useCallback(
    () => handleSelect(user),
    [user, handleSelect],
  );
  return <div>{renderCard(user, selected, select)}</div>;
}

const CardSlot = React.memo(CardSlotInner) as <T>(
  props: CardSlotProps<T>,
) => React.ReactElement | null;

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
  renderTableRow?: (user: T, selected: boolean, select: () => void) => React.ReactNode;
  tableHeaders?: string[];
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
  const hasFilters = React.Children.count(children) > 0;

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        {/* Grupo Esquerdo: Busca + Filtros */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-full md:max-w-[300px]">
            {search}
          </div>
          {hasFilters && (
            <div className="shrink-0">
              <FilterBar>{children}</FilterBar>
            </div>
          )}
        </div>

        {/* Grupo Direito: Toggle + Ações */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0 justify-end">
            {actions}
          </div>
        )}

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
  renderTableRow,
  tableHeaders,
  filterConfig,
  extraActions,
  mensagemVazio = "Nenhum registro encontrado.",
}: UserManagementPageProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const showToggle = !!renderTableRow && !!tableHeaders;
  const [viewMode, setViewMode] = React.useState<ViewMode>(
    showToggle ? getInitialViewMode() : "cards",
  );

  const handleViewModeChange = React.useCallback((mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem(VIEW_MODE_KEY, mode); } catch {}
  }, []);

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

  const handleSelect = React.useCallback(
    (user: T) => setSearchParams({ id: String(getId(user)) }),
    [getId, setSearchParams],
  );

  const handleClose = React.useCallback(() => {
    searchParams.delete("id");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    if (!selectedUser) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedUser, handleClose]);

  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (selectedUser) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [selectedUser]);

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
          showToggle || showCreateButton || extraActions ? (
            <>
              {showToggle && (
                <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
              )}
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

      {temConteudo && viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 w-full">
          {filteredItems.map((user) => {
            const id = getId(user);
            const selected = !!(selectedUser && getId(selectedUser) === id);
            return (
              <CardSlot
                key={id}
                user={user}
                selected={selected}
                handleSelect={handleSelect}
                renderCard={renderCard}
              />
            );
          })}
        </div>
      )}

      {temConteudo && viewMode === "table" && renderTableRow && tableHeaders && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((user) => {
                const id = getId(user);
                const selected = !!(selectedUser && getId(selectedUser) === id);
                const select = () => handleSelect(user);
                return (
                  <React.Fragment key={id}>
                    {renderTableRow(user, selected, select)}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-999 p-4 sm:p-6"
          onClick={handleClose}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {renderDetails(selectedUser, handleClose)}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}