"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { InvoiceForm } from "./invoice-form"
import { Plus, Trash2, CreditCard, Download } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import type { Invoice, InvoiceFormData } from "../types"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

export function InvoiceList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", page, search],
    queryFn: async () => { const r = await axios.get(`/api/invoices?page=${page}&search=${search}`); return r.data },
  })

  const createMutation = useMutation({
    mutationFn: async (formData: InvoiceFormData) => { const r = await axios.post("/api/invoices", formData); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setDialogOpen(false); toast.success("Invoice created") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to create"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const r = await axios.delete(`/api/invoices/${id}`); return r.data },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setDeleteDialogOpen(false); toast.success("Invoice deleted") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to delete"),
  })

  const variantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    DRAFT: "secondary",
    UNPAID: "default",
    PARTIAL: "warning",
    PAID: "success",
    OVERDUE: "destructive",
  }

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: "invoiceNumber", header: "Invoice #" },
    { accessorKey: "lease", header: "Tenant", cell: ({ row }) => row.original.lease?.tenant?.fullName || "-" },
    { accessorKey: "totalAmount", header: "Amount", cell: ({ row }) => formatCurrency(row.getValue("totalAmount")) },
    { accessorKey: "paidAmount", header: "Paid", cell: ({ row }) => formatCurrency(row.getValue("paidAmount")) },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => formatDate(row.getValue("dueDate")) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => { const s = row.getValue("status") as string;
      const label = s === "DRAFT" ? "Draft" : s === "UNPAID" ? "Unpaid" : s === "PARTIAL" ? "Partial" : s === "PAID" ? "Paid" : s === "OVERDUE" ? "Overdue" : s
      return <Badge variant={variantMap[s] || "secondary"}>{label}</Badge> } },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => window.open(`/invoices/${row.original.id}/pdf`, "_blank")}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" asChild><a href={`/payments?invoiceId=${row.original.id}`}><CreditCard className="h-4 w-4" /></a></Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(row.original); setDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Invoices" description="Rent invoice management">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedInvoice(null) }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Create Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <InvoiceForm onSubmit={(fd) => createMutation.mutateAsync(fd)} loading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={handleSearch} loading={isLoading} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={() => selectedInvoice && deleteMutation.mutate(selectedInvoice.id)} loading={deleteMutation.isPending} />
    </div>
  )
}
