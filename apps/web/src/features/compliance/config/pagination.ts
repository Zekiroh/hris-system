import { useMemo, useState } from "react";

export const COMPLIANCE_TABLE_PAGE_SIZE = 10;

export const useComplianceTablePagination = <T,>(
  items: readonly T[],
  resetKey?: unknown,
) => {
  const [pageState, setPageState] = useState({
    currentPage: 1,
    source: items,
    resetKey,
  });
  const totalPages = Math.max(
    1,
    Math.ceil(items.length / COMPLIANCE_TABLE_PAGE_SIZE),
  );
  const sourceChanged =
    pageState.source !== items || !Object.is(pageState.resetKey, resetKey);
  const currentPage = sourceChanged ? 1 : pageState.currentPage;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const pageItems = useMemo(
    () =>
      items.slice(
        (safePage - 1) * COMPLIANCE_TABLE_PAGE_SIZE,
        safePage * COMPLIANCE_TABLE_PAGE_SIZE,
      ),
    [items, safePage],
  );

  return {
    currentPage: safePage,
    totalPages,
    pageItems,
    goToPreviousPage: () =>
      setPageState({
        currentPage: Math.max(1, safePage - 1),
        source: items,
        resetKey,
      }),
    goToNextPage: () =>
      setPageState({
        currentPage: Math.min(totalPages, safePage + 1),
        source: items,
        resetKey,
      }),
  };
};
