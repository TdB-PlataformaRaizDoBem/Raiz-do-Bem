import { useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 12;

/** Paginação no cliente; `resetKey` volta à página 1 e a página nunca passa da última. */
export function usePagination<T>(
  items: T[],
  pageSize: number = DEFAULT_PAGE_SIZE,
  resetKey = "",
) {
  const [page, setPage] = useState(1);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  // Ajuste de estado durante o render (evita um render extra com página inválida).
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // Lista pode encolher (exclusão, filtro): nunca passa da última página.
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return {
    page: currentPage,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    from,
    to,
  };
}
