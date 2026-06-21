"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { StatusFilter, type StatusOption } from "@/components/shared/status-filter"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { InvoiceForm } from "./invoice-form"
import { Plus, Trash2, CreditCard, Download, Zap, Loader2, AlertCircle } from "lucide-react"
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
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [batchMonth, setBatchMonth] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const queryClient = useQueryClient()

  const statusParam = statusFilter === "all" ? undefined : statusFilter
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", page, search, statusFilter],
    queryFn: async () => {
      let url = `/api/invoices?page=${page}&search=${search}`
      if (statusParam) url += `&status=${statusParam}`
      const r = await axios.get(url)
      return r.data
    },
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

  const batchMutation = useMutation({
    mutationFn: async (month: string) => { const r = await axios.post("/api/invoices/generate-batch", { month }); return r.data.data },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      setBatchDialogOpen(false)
      toast.success(`${res.created} invoices created, ${res.skipped} skipped (already exist)`)
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Batch generation failed"),
  })

  const lateFeeMutation = useMutation({
    mutationFn: async (amount?: number) => { const r = await axios.post("/api/invoices/apply-late-fees", { amount: amount || 100 }); return r.data.data },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast.success(`Late fees applied to ${res.updated} overdue invoices`)
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to apply late fees"),
  })

  const statusOptions: StatusOption[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "DRAFT" },
    { label: "Unpaid", value: "UNPAID" },
    { label: "Partial", value: "PARTIAL" },
    { label: "Paid", value: "PAID" },
    { label: "Overdue", value: "OVERDUE" },
  ]

  const variantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    DRAFT: "secondary", UNPAID: "default", PARTIAL: "warning", PAID: "success", OVERDUE: "destructive",
  }

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: "invoiceNumber", header: "Invoice #" },
    { accessorKey: "lease", header: "User", cell: ({ row }) => row.original.lease?.tenant?.fullName || "-" },
    { accessorKey: "totalAmount", header: "Amount", cell: ({ row }) => formatCurrency(row.getValue("totalAmount")) },
    { accessorKey: "paidAmount", header: "Paid", cell: ({ row }) => formatCurrency(row.getValue("paidAmount")) },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => formatDate(row.getValue("dueDate")) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={variantMap[row.original.status] || "secondary"}>{row.original.status}</Badge> },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild><a href={`/payments?invoiceId=${row.original.id}`}><CreditCard className="h-4 w-4" /></a></Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(row.original); setDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Invoices" description="Rent invoice management">
        <div className="flex items-center gap-2">
          <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Zap className="h-4 w-4" /> Generate All</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate Invoices for All Active Leases</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batchMonth">Month</Label>
                  <Input id="batchMonth" type="month" value={batchMonth} onChange={(e) => setBatchMonth(e.target.value)} />
                </div>
                <p className="text-sm text-muted-foreground">
                  This will create invoices for all active leases. Existing invoices for this month will be skipped.
                </p>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={() => batchMutation.mutate(batchMonth)} disabled={!batchMonth || batchMutation.isPending}>
                    {batchMutation.isPending ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Generating...</> : "Generate"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => lateFeeMutation.mutate(undefined as any)} disabled={lateFeeMutation.isPending}>
            <AlertCircle className="h-4 w-4" /> Apply Late Fees
          </Button>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedInvoice(null) }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Create Invoice</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
              <InvoiceForm onSubmit={(fd) => createMutation.mutateAsync(fd)} loading={createMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <DataTable
        columns={columns}
        data={data?.data || []}
        meta={data?.meta}
        onPageChange={setPage}
        onSearchChange={handleSearch}
        loading={isLoading}
        filters={
          <StatusFilter
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1) }}
            variant="dropdown"
          />
        }
      />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={() => selectedInvoice && deleteMutation.mutate(selectedInvoice.id)} loading={deleteMutation.isPending} />
    </div>
  )
}
