"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, DoorOpen, Calendar, DollarSign, FileText, MapPin, Ruler } from "lucide-react"
import { formatDate, formatCurrency } from "@/utils/format"
import { api as axios } from "@/lib/axios"

export function MyProperty() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-property"],
    queryFn: async () => { const r = await axios.get("/api/my/property"); return r.data.data },
  })

  if (isLoading) return <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>

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

      <Card>
        <CardHeader><CardTitle>Property & Lease Details</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell rowSpan={4} className="align-top font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Property
                  </div>
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell className="font-medium">{data.unit?.property?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>{data.unit?.property?.code}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell><Badge variant="outline">{data.unit?.property?.category}</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</div></TableCell>
                <TableCell>{data.unit?.property?.address || "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell rowSpan={4} className="align-top font-medium">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-primary" />
                    Unit
                  </div>
                </TableCell>
                <TableCell>Unit Number</TableCell>
                <TableCell className="font-medium">{data.unit?.unitNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Floor</TableCell>
                <TableCell>{data.unit?.floor || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>{data.unit?.unitType || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><div className="flex items-center gap-1"><Ruler className="h-3 w-3" /> Size</div></TableCell>
                <TableCell>{data.unit?.size ? `${data.unit.size} sqft` : "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell rowSpan={6} className="align-top font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Lease
                  </div>
                </TableCell>
                <TableCell>Lease Number</TableCell>
                <TableCell className="font-medium">{data.leaseNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell><Badge variant="success">Active</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Start Date</div></TableCell>
                <TableCell>{formatDate(data.startDate)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> End Date</div></TableCell>
                <TableCell>{formatDate(data.endDate)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><div className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Monthly Rent</div></TableCell>
                <TableCell className="font-semibold text-primary">{formatCurrency(data.monthlyRent)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Security Deposit</TableCell>
                <TableCell>{formatCurrency(data.securityDeposit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {data.notes && (
            <div className="border-t px-6 py-3 text-sm text-muted-foreground">
              <span className="font-medium">Notes:</span> {data.notes}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
