"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { PaymentForm } from "./payment-form"
import { Plus, Trash2 } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import type { PaymentRecord, PaymentFormData } from "../types"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

export function PaymentList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
  const [currentMonth, setCurrentMonth] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["payments", page, search, currentMonth],
    queryFn: async () => {
      let url = `/api/payments?page=${page}&search=${search}`
      if (currentMonth) url += "&currentMonth=true"
      const res = await axios.get(url)
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (formData: PaymentFormData) => {
      const res = await axios.post("/api/payments", formData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      setDialogOpen(false)
      toast.success("Payment recorded successfully")
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to record"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/payments/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      setDeleteDialogOpen(false)
      toast.success("Payment deleted")
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to delete"),
  })

  const columns: ColumnDef<PaymentRecord>[] = [
    {
      accessorKey: "invoice",
      header: "Invoice",
      cell: ({ row }) => row.original.invoice?.invoiceNumber || "-",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("amount")),
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue("method") as string
        return <Badge variant="secondary">{method.replace("_", " ")}</Badge>
      },
    },
    { accessorKey: "referenceNumber", header: "Reference" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => { setSelectedPayment(row.original); setDeleteDialogOpen(true) }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Payments" description="Payment records & management">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedPayment(null) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <PaymentForm onSubmit={(formData) => createMutation.mutateAsync(formData)} loading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="mb-4 flex gap-1 rounded-lg border p-1">
        <button onClick={() => { setCurrentMonth(false); setPage(1) }} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${!currentMonth ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>All</button>
        <button onClick={() => { setCurrentMonth(true); setPage(1) }} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${currentMonth ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>This Month</button>
      </div>
      <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} onSearchChange={handleSearch} loading={isLoading} />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedPayment && deleteMutation.mutate(selectedPayment.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
