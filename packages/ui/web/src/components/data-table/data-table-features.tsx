import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";

export interface DataTableColumnMeta {
  variant?:
    | "text"
    | "number"
    | "range"
    | "date"
    | "dateRange"
    | "select"
    | "multiSelect";
  label?: string;
  placeholder?: string;
  unit?: string;
  range?: [number, number];
  options?: {
    label: string;
    value: string;
    count?: number;
    icon?: unknown;
  }[];
}

export const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  columnFacetingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof features;
