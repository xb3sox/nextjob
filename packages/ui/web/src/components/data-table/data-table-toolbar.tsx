"use client";

import * as React from "react";
import { z } from "zod";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";

import { Button } from "#components/button";
import { Icons } from "#components/icons";
import { Input } from "#components/input";

import { DataTableDateFilter } from "./data-table-date-filter";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableSliderFilter } from "./data-table-slider-filter";
import { DataTableViewOptions } from "./data-table-view-options";

import type { Icon } from "#components/icons";
import type { DataTableFeatures } from "./data-table-features";
import type { Column, ReactTable, RowData } from "@tanstack/react-table";

interface DataTableToolbarProps<
  TData extends RowData,
> extends React.ComponentProps<"div"> {
  table: ReactTable<DataTableFeatures, TData>;
}

function getTextFilterValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const [first] = value;
    if (typeof first === "string" || typeof first === "number") {
      return String(first);
    }
  }
  return "";
}

export function DataTableToolbar<TData extends RowData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  "use no memo";

  const { t } = useTranslation("common");
  const isFiltered = table.state.columnFilters.length > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table],
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex w-full items-start justify-between gap-2", className)}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            size="sm"
            onClick={onReset}
          >
            <Icons.X />
            {t("reset")}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
interface DataTableToolbarFilterProps<TData extends RowData> {
  column: Column<DataTableFeatures, TData>;
}

const optionSchema = z
  .object({
    label: z.string(),
    value: z.any(),
    count: z.number().optional(),
    icon: z.unknown().optional(),
  })
  .transform((opt) => {
    let parsedIcon: Icon | undefined;
    if (typeof opt.icon === "string" && opt.icon in Icons) {
      parsedIcon = Icons[opt.icon as keyof typeof Icons] as Icon;
    } else if (typeof opt.icon === "function") {
      parsedIcon = opt.icon as Icon;
    }
    return { ...opt, icon: parsedIcon };
  });

const metaSchema = z.object({
  variant: z
    .enum([
      "text",
      "number",
      "range",
      "date",
      "dateRange",
      "select",
      "multiSelect",
    ])
    .optional(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  unit: z.string().optional(),
  range: z.tuple([z.number(), z.number()]).optional(),
  options: z.array(optionSchema).optional(),
});

function parseMeta(meta: unknown): {
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
  options: { label: string; value: string; count?: number; icon?: Icon }[];
} {
  const result = metaSchema.safeParse(meta ?? {});
  if (!result.success) {
    return { options: [] };
  }
  const { variant, label, placeholder, unit, options } = result.data;
  return {
    variant,
    label,
    placeholder,
    unit,
    options: options ?? [],
  };
}

function DataTableToolbarFilter<TData extends RowData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  "use no memo";

  const { variant, label, placeholder, unit, options } = parseMeta(
    column.columnDef.meta,
  );

  if (!variant) return null;

  switch (variant) {
    case "text":
      return (
        <Input
          placeholder={placeholder ?? label}
          value={getTextFilterValue(column.getFilterValue())}
          onChange={(event) => column.setFilterValue(event.target.value)}
          className="h-9 w-52 lg:w-72"
        />
      );

    case "number":
      return (
        <div className="relative">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={placeholder ?? label}
            value={getTextFilterValue(column.getFilterValue())}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className={cn("h-8 w-[120px]", unit ? "pr-8" : undefined)}
          />
          {unit && (
            <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
              {unit}
            </span>
          )}
        </div>
      );

    case "range":
      return (
        <DataTableSliderFilter column={column} title={label ?? column.id} />
      );

    case "date":
    case "dateRange":
      return (
        <DataTableDateFilter
          column={column}
          title={label ?? column.id}
          multiple={variant === "dateRange"}
        />
      );

    case "select":
    case "multiSelect":
      return (
        <DataTableFacetedFilter
          column={column}
          title={label ?? column.id}
          options={options}
          multiple={variant === "multiSelect"}
        />
      );

    default:
      return null;
  }
}
