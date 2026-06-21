"use client"

import { useQuery } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatCurrency } from "@/utils/format"
import { DoorOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function PropertyDetail({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => { const r = await axios.get(`/api/properties/${id}`); return r.data.data },
  })

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Property not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/properties"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div><h1 className="text-2xl font-bold">{data.name}</h1><p className="text-sm text-muted-foreground">{data.code}</p></div>
        <Badge variant={data.status === "ACTIVE" ? "success" : "secondary"}>{data.status}</Badge>
        <Badge variant="outline">{data.category}</Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span>{data.code}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{data.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{data.category}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span>{data.address || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{data.status}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDate(data.createdAt)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Units</CardTitle></CardHeader>
          <CardContent>
            {data.units?.length === 0 ? <p className="text-sm text-muted-foreground">No units yet</p> : (
              <div className="space-y-2">
                {data.units?.map((unit: any) => (
                  <div key={unit.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{unit.unitNumber}</span>
                      <span className="text-sm text-muted-foreground">{unit.floor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(unit.monthlyRent)}</span>
                      <Badge variant={unit.status === "VACANT" ? "secondary" : "success"}>{unit.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
