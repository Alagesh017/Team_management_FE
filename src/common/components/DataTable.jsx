import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { cn } from "../../core/utils/utils"

export function DataTable({
  data,
  columns,
  filterColumn,
  filterPlaceholder,
  onEdit,
  onDelete,
  rowComponent,
  tbodyRef,
  tbodyProps,
  embedded = false,
  pageSize = 10,
  /** false = grow with rows and let the page scroll; string = custom max-height */
  maxBodyHeight = "calc(100vh - 17rem)",
}) {
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: { pageSize },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const hasSelectionColumn = table
    .getAllColumns()
    .some((column) => column.id === "select" && column.getIsVisible())

  const filteredCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const pageRows = table.getRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * currentPageSize + 1
  const to = filteredCount === 0 ? 0 : pageIndex * currentPageSize + pageRows

  const filterLabel = filterPlaceholder
    ?? (filterColumn ? `Search by ${filterColumn.replace(/_/g, " ")}…` : "Search…")

  return (
    <div className={cn("w-full", embedded ? "space-y-0" : "space-y-3")}>
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          embedded && "border-b border-slate-100 px-4 py-3 md:px-5"
        )}
      >
        {filterColumn ? (
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={filterLabel}
              value={(table.getColumn(filterColumn)?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn(filterColumn)?.setFilterValue(event.target.value)
              }
              className="h-9 border-slate-200 bg-slate-50/80 pl-9 text-sm shadow-none focus-visible:bg-white"
            />
          </div>
        ) : (
          <div />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
              Columns
              <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.columnDef.meta?.displayName || column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-col bg-white",
          embedded ? "border-0 shadow-none" : "rounded-xl border border-slate-200 shadow-sm"
        )}
      >
        <div
          className={cn(
            "min-h-0 overflow-x-auto",
            maxBodyHeight === false
              ? "overflow-y-visible"
              : "overflow-y-auto overscroll-contain"
          )}
          style={
            maxBodyHeight !== false && maxBodyHeight
              ? { maxHeight: maxBodyHeight }
              : undefined
          }
        >
        <Table className="min-w-max">
          <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-slate-200 bg-slate-50/90 hover:bg-slate-50/90"
              >
                {rowComponent ? (
                  <TableHead className="h-10 w-10 bg-slate-50/90 px-2" />
                ) : null}
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody ref={tbodyRef} {...tbodyProps}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => {
                const RowComponent = rowComponent || TableRow

                const cellElements = row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-3 py-2.5 text-sm text-slate-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))

                if (rowComponent) {
                  return (
                    <RowComponent key={row.id} row={row} index={index}>
                      {cellElements}
                    </RowComponent>
                  )
                }

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    {cellElements}
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={rowComponent ? columns.length + 1 : columns.length}
                  className="h-28 px-3 text-center text-sm text-slate-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5 shrink-0">
          <p className="text-xs font-medium text-slate-500">
            {hasSelectionColumn ? (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of {filteredCount} row(s)
                selected · Showing {from}–{to} of {filteredCount}
              </>
            ) : (
              <>Showing {from}–{to} of {filteredCount} entries</>
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:inline">
              Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-slate-200 bg-white px-3 text-xs"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-slate-200 bg-white px-3 text-xs"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
