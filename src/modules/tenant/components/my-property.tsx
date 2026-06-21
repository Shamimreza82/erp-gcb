"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, DoorOpen, Calendar, DollarSign, FileText } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import { api as axios } from "@/lib/axios"

export function MyProperty() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-property"],
    queryFn: async () => { const r = await axios.get("/api/my/property"); return r.data.data },
  })

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
        <Building2 className="h-16 w-16" />
        <p className="text-lg font-medium">No property assigned yet</p>
        <p className="text-sm">Contact the board office for property allocation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">My Property</h1>
        <Badge variant="success">Active</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{data.unit?.property?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span>{data.unit?.property?.code}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Category</span><Badge variant="outline">{data.unit?.property?.category}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span>{data.unit?.property?.address || "-"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary" />
              Unit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span className="font-medium">{data.unit?.unitNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Floor</span><span>{data.unit?.floor || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{data.unit?.unitType || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span>{data.unit?.size ? `${data.unit.size} sqft` : "-"}</span></div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Lease Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Lease #</span><span className="font-medium">{data.leaseNumber}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="success">Active</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground"><Calendar className="mr-1 inline h-3 w-3" />Start</span><span>{formatDate(data.startDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground"><Calendar className="mr-1 inline h-3 w-3" />End</span><span>{formatDate(data.endDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground"><DollarSign className="mr-1 inline h-3 w-3" />Monthly Rent</span><span className="font-semibold text-primary">{formatCurrency(data.monthlyRent)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Security Deposit</span><span>{formatCurrency(data.securityDeposit)}</span></div>
            </div>
            {data.notes && <p className="mt-2 text-muted-foreground">Notes: {data.notes}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
