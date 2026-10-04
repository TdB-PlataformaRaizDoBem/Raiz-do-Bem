interface PaginationProps {
  /** Página atual (começa em 1) */
  page: number;
  totalPages: number;
  totalItems: number;
  /** Primeiro e último item exibidos (1-based) */
  from: number;
  to: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** Ex.: 1 … 4 5 6 … 12 — sempre mostra primeira, última e vizinhas da atual. */
function buildPages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push("ellipsis-start");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("ellipsis-end");

  pages.push(totalPages);
  return pages;
}

const baseBtn =
  "flex items-center justify-center min-w-10 h-10 px-3 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/50 focus-visible:ring-offset-2";

export function Pagination({
  page,
  totalPages,
  totalItems,
  from,
  to,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const pages = buildPages(page, totalPages);

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between w-full"
    >
      <p role="status" aria-live="polite" className="text-sm text-gray-500">
        Mostrando {from}–{to} de {totalItems}
      </p>

      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Página anterior"
            className={`${baseBtn} border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white`}
          >
            Anterior
          </button>
        </li>

        {pages.map((item) =>
          typeof item === "string" ? (
            <li key={item} aria-hidden="true" className="px-1 text-gray-400">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Página ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`${baseBtn} ${
                  item === page
                    ? "border-darkgreen bg-darkgreen text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Próxima página"
            className={`${baseBtn} border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white`}
          >
            Próxima
          </button>
        </li>
      </ul>
    </nav>
  );
}
