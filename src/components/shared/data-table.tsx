"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table"
import { useState, useEffect, useRef, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Loader2, X } from "lucide-react"

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: PaginationMeta
  onPageChange?: (page: number) => void
  onSearchChange?: (value: string) => void
  loading?: boolean
  filters?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onPageChange,
  onSearchChange,
  loading,
  filters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchInput, setSearchInput] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onSearchRef = useRef(onSearchChange)
  onSearchRef.current = onSearchChange

  useEffect(() => {
    if (!debounceRef.current && !searchInput) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchRef.current?.(searchInput)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: { pageIndex: meta ? meta.page - 1 : 0, pageSize: meta?.limit || 10 },
    },
    manualPagination: true,
    pageCount: meta?.totalPages ?? -1,
  })

  const pageNumbers = useMemo(() => {
    if (!meta) return []
    const { page, totalPages } = meta
    const pages: (number | "...")[] = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...")
      }
    }
    return pages
  }, [meta])

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 pl-9 pr-9 max-w-xs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {filters}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                  {searchInput ? "No results found." : "No data yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {meta.total} result{meta.total !== 1 ? "s" : ""} · Page {meta.page} of {meta.totalPages}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(meta.page - 1)}
              disabled={meta.page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === meta.page ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onPageChange?.(p)}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
