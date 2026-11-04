/* eslint-disable react-hooks/rules-of-hooks */
import { useLocalDataTable } from "./local";
import { useSearchParamsDataTable } from "./search-params";

import type { UseLocalDataTableProps } from "./local";
import type { UseSearchParamsDataTableProps } from "./search-params";
import type { QueryKey, useQuery } from "@tanstack/react-query";
import type { ReactTable, RowData } from "@tanstack/react-table";
import type { DataTableFeatures } from "@workspace/ui-web/data-table/data-table-features";

export function useDataTable<
  TData extends RowData,
  TQueryFnData extends { data?: TData[]; total?: number },
  TQueryKey extends QueryKey,
>(
  props: UseLocalDataTableProps<TData, TQueryFnData, TQueryKey>,
): {
  table: ReactTable<DataTableFeatures, TData>;
  query: ReturnType<typeof useQuery<TQueryFnData>>;
};
export function useDataTable<TData extends RowData>(
  props: UseSearchParamsDataTableProps<TData>,
): { table: ReactTable<DataTableFeatures, TData> };

export function useDataTable<
  TData extends RowData,
  TQueryFnData extends { data?: TData[]; total?: number },
  TQueryKey extends QueryKey,
>(
  props:
    | UseLocalDataTableProps<TData, TQueryFnData, TQueryKey>
    | UseSearchParamsDataTableProps<TData>,
) {
  if (props.persistance === "local") {
    return useLocalDataTable(props);
  }
  return useSearchParamsDataTable(props);
}
