"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { formatCurrency, formatDate } from "@/utils/format"
import { api as axios } from "@/lib/axios"
import { cn } from "@/utils/cn"
import { TrendingUp, TrendingDown, AlertCircle, Users, Clock, DollarSign } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

type Tab = "monthly" | "arrears" | "daily" | "regular"

export function ReportsPage() {
  const [tab, setTab] = useState<Tab>("monthly")
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7))

  // Monthly report
  const { data: monthly, isLoading: monthLoading } = useQuery({
    queryKey: ["report-monthly", reportMonth],
    queryFn: async () => { const r = await axios.get(`/api/reports/monthly?month=${reportMonth}`); return r.data.data },
    enabled: tab === "monthly",
  })

  // Arrears report
  const { data: arrears, isLoading: arrearsLoading } = useQuery({
    queryKey: ["report-arrears"],
    queryFn: async () => { const r = await axios.get("/api/reports/arrears"); return r.data.data },
    enabled: tab === "arrears",
  })

  // Daily report
  const { data: daily, isLoading: dailyLoading } = useQuery({
    queryKey: ["report-daily"],
    queryFn: async () => { const r = await axios.get("/api/reports/daily"); return r.data.data },
    enabled: tab === "daily",
  })

  // Regular/Irregular
  const { data: regIrreg, isLoading: regLoading } = useQuery({
    queryKey: ["report-regular"],
    queryFn: async () => { const r = await axios.get("/api/reports/regular-irregular"); return r.data.data },
    enabled: tab === "regular",
  })

  const tabs = [
    { key: "monthly" as Tab, label: "Monthly Report" },
    { key: "arrears" as Tab, label: "Arrears" },
    { key: "daily" as Tab, label: "Daily View" },
    { key: "regular" as Tab, label: "Payment Status" },
  ]

  const arrearsColumns: ColumnDef<any>[] = [
    { accessorKey: "invoiceNumber", header: "Invoice" },
    { accessorKey: "tenant", header: "User" },
    { accessorKey: "due", header: "Due", cell: ({ row }) => formatCurrency(row.original.due) },
    { accessorKey: "daysOverdue", header: "Days Overdue", cell: ({ row }) => <Badge variant={row.original.daysOverdue > 30 ? "destructive" : "warning"}>{row.original.daysOverdue}d</Badge> },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => formatDate(row.original.dueDate) },
    { accessorKey: "status", header: "Status" },
  ]

  const regularColumns: ColumnDef<any>[] = [
    { accessorKey: "tenantName", header: "User" },
    { accessorKey: "totalInvoiced", header: "Invoiced", cell: ({ row }) => formatCurrency(row.original.totalInvoiced) },
    { accessorKey: "totalPaid", header: "Paid", cell: ({ row }) => formatCurrency(row.original.totalPaid) },
    { accessorKey: "outstanding", header: "Outstanding", cell: ({ row }) => formatCurrency(row.original.outstanding) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "regular" ? "success" : "destructive"}>{row.original.status}</Badge> },
    { accessorKey: "leaseCount", header: "Leases" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="MIS Reports & Analysis" />

      <div className="flex gap-1 rounded-lg border p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Monthly Report ── */}
      {tab === "monthly" && (
        <div className="space-y-4">
          <div className="w-48">
            <Label htmlFor="rmonth">Month</Label>
            <Input id="rmonth" type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
          </div>
          {monthLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : monthly && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-emerald-600"><TrendingUp className="h-4 w-4" /> Invoiced</div><p className="text-xl font-bold">{formatCurrency(monthly.totalInvoiced)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-emerald-600"><DollarSign className="h-4 w-4" /> Collected</div><p className="text-xl font-bold">{formatCurrency(monthly.totalCollected)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-amber-600"><AlertCircle className="h-4 w-4" /> Outstanding</div><p className="text-xl font-bold">{formatCurrency(monthly.totalOutstanding)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-destructive"><TrendingDown className="h-4 w-4" /> Expenses</div><p className="text-xl font-bold">{formatCurrency(monthly.totalExpenses)}</p></CardContent></Card>
            </div>
          )}
          {monthly && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Source Tax & Net</CardTitle></CardHeader>
              <CardContent className="grid gap-4 text-sm md:grid-cols-3">
                <div><span className="text-muted-foreground">Source Tax (4%):</span> <span className="font-medium">{formatCurrency(monthly.sourceTax)}</span></div>
                <div><span className="text-muted-foreground">Collected after Tax:</span> <span className="font-medium">{formatCurrency(monthly.collectedAfterTax)}</span></div>
                <div><span className="text-muted-foreground">Net Profit:</span> <span className="font-medium">{formatCurrency(monthly.netProfit)}</span></div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Arrears ── */}
      {tab === "arrears" && (
        <div className="space-y-4">
          {arrearsLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : arrears && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Arrears</p><p className="text-2xl font-bold text-destructive">{formatCurrency(arrears.totalArrears)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Overdue Invoices</p><p className="text-2xl font-bold text-amber-600">{arrears.overdueCount}</p></CardContent></Card>
            </div>
          )}
          {arrears && arrears.items?.length > 0 && (
            <DataTable columns={arrearsColumns} data={arrears.items} />
          )}
          {arrears && arrears.items?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No overdue invoices. Everything is up to date!</p>
          )}
        </div>
      )}

      {/* ── Daily View ── */}
      {tab === "daily" && (
        <div className="space-y-4">
          {dailyLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : daily && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Today's Collection</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(daily.todayCollection)}</p><p className="text-xs text-muted-foreground">{daily.todayPaymentCount} payments</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Month Collection</p><p className="text-2xl font-bold">{formatCurrency(daily.monthCollection)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Overdue Invoices</p><p className="text-2xl font-bold text-destructive">{daily.overdueInvoices}</p><p className="text-xs text-muted-foreground">{daily.activeLeases} active leases</p></CardContent></Card>
            </div>
          )}
        </div>
      )}

      {/* ── Regular / Irregular ── */}
      {tab === "regular" && (
        <div className="space-y-4">
          {regLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : regIrreg && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Regular Users</p><p className="text-2xl font-bold text-emerald-600">{regIrreg.totalRegular}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Irregular Users</p><p className="text-2xl font-bold text-destructive">{regIrreg.totalIrregular}</p></CardContent></Card>
            </div>
          )}
          {regIrreg?.irregular?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm text-destructive">Irregular Users</CardTitle></CardHeader>
              <CardContent>
                <DataTable columns={regularColumns} data={regIrreg.irregular} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
