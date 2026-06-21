"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { ExpenseForm } from "./expense-form"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import type { Expense, ExpenseFormData } from "../types"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

export function ExpenseList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page, search],
    queryFn: async () => { const r = await axios.get(`/api/expenses?page=${page}&search=${search}`); return r.data },
  })

  const createMutation = useMutation({
    mutationFn: async (formData: ExpenseFormData) => { const r = await axios.post("/api/expenses", formData); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expenses"] }); setDialogOpen(false); toast.success("Expense added") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create"),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExpenseFormData }) => { const r = await axios.put(`/api/expenses/${id}`, data); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expenses"] }); setDialogOpen(false); setSelectedExpense(null); toast.success("Expense updated") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const r = await axios.delete(`/api/expenses/${id}`); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expenses"] }); setDeleteDialogOpen(false); toast.success("Expense deleted") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to delete"),
  })

  const columns: ColumnDef<Expense>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <Badge variant="secondary">{(row.getValue("category") as string).replace("_", " ")}</Badge> },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.getValue("amount")) },
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.getValue("date")) },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedExpense(row.original); setDialogOpen(true) }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedExpense(row.original); setDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Expenses" description="Expense tracking">
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setSelectedExpense(null) }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add Expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{selectedExpense ? "Edit Expense" : "Add Expense"}</DialogTitle></DialogHeader>
            <ExpenseForm
              initialData={selectedExpense || undefined}
              onSubmit={(fd) => selectedExpense ? updateMutation.mutateAsync({ id: selectedExpense.id, data: fd }) : createMutation.mutateAsync(fd)}
              loading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={handleSearch} loading={isLoading} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={() => selectedExpense && deleteMutation.mutate(selectedExpense.id)} loading={deleteMutation.isPending} />
    </div>
  )
}
