"use client"

import { useQuery } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PropertyFeeManager } from "./property-fee-manager"

export function FeesPage({ propertyId }: { propertyId: string }) {
  const { data: property } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => { const r = await axios.get(`/api/properties/${propertyId}`); return r.data.data },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/properties/${propertyId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Service Charges</h1>
          <p className="text-sm text-muted-foreground">
            {property ? `${property.name} (${property.code})` : "Loading..."}
          </p>
        </div>
      </div>
      <PropertyFeeManager propertyId={propertyId} />
    </div>
  )
}
