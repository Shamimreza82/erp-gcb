"use client"

import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import type { ColumnDef } from "@tanstack/react-table"
import { api as axios } from "@/lib/axios"

export function MyPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => { const r = await axios.get("/api/my/payments"); return r.data.data },
  })

  const columns: ColumnDef<any>[] = [
    { accessorKey: "invoice.invoiceNumber", header: "Invoice", cell: ({ row }) => row.original.invoice?.invoiceNumber || "-" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.getValue("amount")) },
    { accessorKey: "method", header: "Method", cell: ({ row }) => <Badge variant="secondary">{(row.getValue("method") as string).replace("_", " ")}</Badge> },
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.getValue("date")) },
    { accessorKey: "referenceNumber", header: "Reference" },
  ]

  if (!data || data.length === 0) {
    return (
      <div>
        <PageHeader title="My Payments" description="Your payment history" />
        <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
          <CreditCard className="h-16 w-16" />
          <p className="text-lg font-medium">No payments yet</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="My Payments" description="Your payment history" />
      <DataTable columns={columns} data={data || []} loading={isLoading} />
    </div>
  )
}
