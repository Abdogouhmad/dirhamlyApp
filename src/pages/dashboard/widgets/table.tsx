"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 8 } },
  });

  const typeValue =
    (table.getColumn("tx_type")?.getFilterValue() as string) ?? "all";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Type filter */}
        <Select
          value={typeValue}
          onValueChange={(val) => {
            table
              .getColumn("tx_type")
              ?.setFilterValue(val === "all" ? undefined : val);
          }}
        >
          <SelectTrigger className="w-40 h-10 rounded-xl bg-white/[0.03] border-white/10 backdrop-blur-md">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="backdrop-blur-2xl">
            <SelectItem value="all">All transactions</SelectItem>
            <SelectItem value="income">Income only</SelectItem>
            <SelectItem value="expense">Expenses only</SelectItem>
          </SelectContent>
        </Select>

        {/* Category search */}
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search transactions..."
            value={
              (table.getColumn("category")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("category")?.setFilterValue(e.target.value)
            }
            className="h-10 text-sm pl-10 rounded-xl bg-white/[0.03] border-white/10 backdrop-blur-md"
          />
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Result count */}
        <span className="ml-auto text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
          {table.getFilteredRowModel().rows.length} total
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.01] backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-white/5 hover:bg-transparent bg-white/[0.02]"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/5 hover:bg-white/[0.03] transition-all duration-200 group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 text-[13px] font-medium">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground/60 text-sm italic"
                >
                  No transactions match your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground/60 font-medium">
          Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
