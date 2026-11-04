"use client";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/dropdown-menu";
import { Icons } from "#components/icons";

import type { DataTableFeatures } from "./data-table-features";
import type { Column, RowData } from "@tanstack/react-table";

interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue = unknown,
> extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue = unknown>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  "use no memo";

  const { t } = useTranslation("common");

  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "hover:bg-accent focus:ring-ring data-[state=open]:bg-accent [&_svg]:text-muted-foreground -ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 focus:ring-1 focus:outline-none [&_svg]:size-4 [&_svg]:shrink-0",
          className,
        )}
        {...props}
      >
        {title}
        {column.getCanSort() &&
          (column.getIsSorted() === "desc" ? (
            <Icons.ChevronDown />
          ) : column.getIsSorted() === "asc" ? (
            <Icons.ChevronUp />
          ) : (
            <Icons.ChevronsUpDown />
          ))}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-28 font-normal">
        {column.getCanSort() && (
          <>
            <DropdownMenuCheckboxItem
              className="[&_svg]:text-muted-foreground relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
              checked={column.getIsSorted() === "asc"}
              onClick={() => column.toggleSorting(false)}
            >
              <Icons.ChevronUp />
              {t("asc")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className="[&_svg]:text-muted-foreground relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
              checked={column.getIsSorted() === "desc"}
              onClick={() => column.toggleSorting(true)}
            >
              <Icons.ChevronDown />
              {t("desc")}
            </DropdownMenuCheckboxItem>
            {column.getIsSorted() && (
              <DropdownMenuItem
                className="[&_svg]:text-muted-foreground pl-2"
                onClick={() => column.clearSorting()}
              >
                <Icons.X />
                {t("reset")}
              </DropdownMenuItem>
            )}
          </>
        )}
        {column.getCanSort() && column.getCanHide() && (
          <DropdownMenuSeparator />
        )}
        {column.getCanHide() && (
          <DropdownMenuCheckboxItem
            className="[&_svg]:text-muted-foreground relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
            checked={!column.getIsVisible()}
            onClick={() => column.toggleVisibility(false)}
          >
            <Icons.EyeOff />
            {t("hide")}
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
