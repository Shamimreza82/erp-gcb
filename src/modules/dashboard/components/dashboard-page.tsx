"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DoorOpen, Users, FileText, Receipt, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/utils/format"
import { api as axios } from "@/lib/axios"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts"

const chartColors = {
  green: "hsl(142 72% 29%)",
  greenLight: "hsl(142 60% 45%)",
  orange: "hsl(35 92% 65%)",
  blue: "hsl(200 90% 55%)",
  red: "hsl(0 84.2% 60.2%)",
  purple: "hsl(270 70% 60%)",
  teal: "hsl(160 60% 45%)",
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => { const r = await axios.get("/api/dashboard"); return r.data.data },
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-20 animate-pulse rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  const statsCards = [
    ...(data?.totalBoards !== undefined ? [{ title: "Total Boards", value: data.totalBoards, icon: Building2, color: chartColors.purple }] : []),
    { title: "Properties", value: data?.totalProperties || 0, icon: Building2, color: chartColors.green },
    { title: "Total Units", value: data?.totalUnits || 0, icon: DoorOpen, color: chartColors.blue },
    { title: "Occupied", value: data?.occupiedUnits || 0, icon: DoorOpen, color: chartColors.greenLight },
    { title: "Vacant", value: data?.vacantUnits || 0, icon: DoorOpen, color: chartColors.orange },
    { title: "Active Users", value: data?.activeTenants || 0, icon: Users, color: chartColors.teal },
    { title: "Active Leases", value: data?.activeLeases || 0, icon: FileText, color: chartColors.purple },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Financial Overview Cards ── */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" /> Revenue
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(data?.monthlyRevenue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <Receipt className="h-4 w-4" /> Collected
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(data?.collectedRevenue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Receipt className="h-4 w-4" /> Outstanding
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(data?.outstandingRevenue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <Wallet className="h-4 w-4" /> Expenses
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(data?.monthlyExpenses || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm" style={{ color: (data?.netProfit || 0) >= 0 ? chartColors.green : chartColors.red }}>
              <TrendingDown className="h-4 w-4" /> Net Profit
            </div>
            <p className={`mt-1 text-2xl font-bold ${(data?.netProfit || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              {formatCurrency(data?.netProfit || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue & Expense Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue & Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill={chartColors.green} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill={chartColors.red} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Collection Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="collected" name="Collected" stroke={chartColors.greenLight} strokeWidth={2} dot={{ fill: chartColors.greenLight }} />
                <Line type="monotone" dataKey="revenue" name="Invoiced" stroke={chartColors.blue} strokeWidth={2} dot={{ fill: chartColors.blue }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Property Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Properties by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.propertyTypeData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {(data?.propertyTypeData || []).map((_: any, i: number) => (
                    <Cell key={i} fill={[chartColors.green, chartColors.blue, chartColors.orange, chartColors.purple, chartColors.teal, chartColors.red][i % 6]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Unit Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Unit Status</span>
              <span className="text-sm font-normal text-muted-foreground">
                {data?.occupancyRate || 0}% Occupied
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.unitStatusData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {(data?.unitStatusData || []).map((entry: any) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
