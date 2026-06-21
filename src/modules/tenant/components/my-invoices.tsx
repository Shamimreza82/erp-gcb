"use client"

import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Receipt } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import { api as axios } from "@/lib/axios"

export function MyInvoices() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-invoices"],
    queryFn: async () => { const r = await axios.get("/api/my/invoices"); return r.data.data },
  })

  const variantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    PAID: "success", UNPAID: "default", PARTIAL: "warning", OVERDUE: "destructive", DRAFT: "secondary",
  }

  const columns: ColumnDef<any>[] = [
    { accessorKey: "invoiceNumber", header: "Invoice #" },
    { accessorKey: "lease.leaseNumber", header: "Lease", cell: ({ row }) => row.original.lease?.leaseNumber || "-" },
    { accessorKey: "totalAmount", header: "Amount", cell: ({ row }) => formatCurrency(row.getValue("totalAmount")) },
    { accessorKey: "paidAmount", header: "Paid", cell: ({ row }) => formatCurrency(row.getValue("paidAmount")) },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => formatDate(row.getValue("dueDate")) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => {
      const s = row.original.status
      const label = s === "PAID" ? "Paid" : s === "UNPAID" ? "Unpaid" : s === "PARTIAL" ? "Partial" : s === "OVERDUE" ? "Overdue" : s === "DRAFT" ? "Draft" : s
      return <Badge variant={variantMap[s] || "secondary"}>{label}</Badge>
    } },
  ]

  if (!data || data.length === 0) {
    return (
      <div>
        <PageHeader title="My Invoices" description="Your rent invoices" />
        <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
          <Receipt className="h-16 w-16" />
          <p className="text-lg font-medium">No invoices yet</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="My Invoices" description="Your rent invoices" />
      <DataTable columns={columns} data={data || []} loading={isLoading} />
    </div>
  )
}
