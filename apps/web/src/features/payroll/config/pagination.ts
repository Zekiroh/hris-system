import { useMemo, useState } from 'react';

export const PAYROLL_TABLE_PAGE_SIZE = 10;

export const usePayrollTablePagination = <T,>(items: readonly T[]) => {
    const [pageState, setPageState] = useState({
        currentPage: 1,
        source: items,
    });
    const totalPages = Math.max(1, Math.ceil(items.length / PAYROLL_TABLE_PAGE_SIZE));
    const sourceChanged = pageState.source !== items;
    const currentPage = sourceChanged ? 1 : pageState.currentPage;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    const pageItems = useMemo(
        () => items.slice((safePage - 1) * PAYROLL_TABLE_PAGE_SIZE, safePage * PAYROLL_TABLE_PAGE_SIZE),
        [items, safePage]
    );

    return {
        currentPage: safePage,
        totalPages,
        pageItems,
        goToPreviousPage: () => setPageState({
            currentPage: Math.max(1, safePage - 1),
            source: items,
        }),
        goToNextPage: () => setPageState({
            currentPage: Math.min(totalPages, safePage + 1),
            source: items,
        }),
    };
};
