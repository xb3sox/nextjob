import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTable } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";

import { useDebounceCallback } from "@workspace/shared/hooks";
import {
  features,
  type DataTableFeatures,
} from "@workspace/ui-web/data-table/data-table-features";

import { DEBOUNCE_MS, getFiltersFromColumnFilters } from "./common";

import type { CommonProps } from "./common";
import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";
import type {
  ColumnFiltersState,
  ColumnVisibilityState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  TableOptions,
  Updater,
} from "@tanstack/react-table";

export interface UseLocalDataTableProps<
  TData extends RowData,
  TQueryFnData extends { data?: TData[]; total?: number },
  TQueryKey extends QueryKey,
>
  extends
    CommonProps,
    Omit<
      TableOptions<DataTableFeatures, TData>,
      "data" | "state" | "features"
    > {
  persistance: "local";
  query: (params: {
    page: number;
    perPage: number;
    sorting: SortingState;
    filters: Record<string, string | string[] | null>;
  }) => UseQueryOptions<TQueryFnData, Error, TQueryFnData, TQueryKey>;
}

export function useLocalDataTable<
  TData extends RowData,
  TQueryFnData extends { data?: TData[]; total?: number },
  TQueryKey extends QueryKey,
>(props: UseLocalDataTableProps<TData, TQueryFnData, TQueryKey>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    props.initialState?.rowSelection ?? {},
  );

  const [sorting, setSorting] = useState<SortingState>(
    props.initialState?.sorting ?? [],
  );

  const [page, setPage] = useState(
    (props.initialState?.pagination?.pageIndex ?? 0) + 1,
  );
  const [perPage, setPerPage] = useState(
    props.initialState?.pagination?.pageSize ?? 10,
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    props.initialState?.columnFilters ?? [],
  );
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(props.initialState?.columnVisibility ?? {});

  const filterableColumns = useMemo(() => {
    return props.columns.filter((column) => column.enableColumnFilter);
  }, [props.columns]);

  const [filters, setFilters] = useState<
    Record<string, string | string[] | null>
  >(getFiltersFromColumnFilters({ columnFilters, filterableColumns }));

  const debouncedSetFilters = useDebounceCallback(
    (values: Record<string, string | string[] | null>) => {
      setPage(1);
      setFilters(values);
    },
    DEBOUNCE_MS,
  );
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: perPage,
    }),
    [page, perPage],
  );

  const onPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
      setPage(newPagination.pageIndex + 1);
      setPerPage(newPagination.pageSize);
    },
    [pagination, setPage, setPerPage],
  );

  const onSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      setSorting(
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue,
      );
    },
    [sorting, setSorting],
  );

  const onColumnFiltersChange = useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      setColumnFilters((prev) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue;

        debouncedSetFilters(
          getFiltersFromColumnFilters({
            columnFilters: next,
            previousColumnFilters: prev,
            filterableColumns,
          }),
        );
        return next;
      });
    },
    [debouncedSetFilters, filterableColumns],
  );

  const params = useMemo(
    () => ({
      page,
      perPage,
      sorting,
      filters,
    }),
    [page, perPage, sorting, filters],
  );

  const query = useQuery({
    ...props.query(params),
    enabled: !!props.query,
    placeholderData: keepPreviousData,
  });

  const pageCount = useMemo(() => {
    return Math.ceil((query.data?.total ?? 0) / perPage);
  }, [query.data?.total, perPage]);

  const table = useTable({
    features,
    data: query.data?.data ?? [],
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
    },
    enableRowSelection: true,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    ...props,
  });

  return { table, query };
}
