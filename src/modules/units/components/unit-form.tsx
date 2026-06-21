"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { unitSchema, type UnitSchema } from "../validations"
import type { UnitFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"

export function UnitForm({ initialData, onSubmit, loading }: { initialData?: UnitFormData; onSubmit: (d: UnitFormData) => Promise<void>; loading?: boolean }) {
  const { data: propertiesData } = useQuery({
    queryKey: ["properties-list"],
    queryFn: async () => { const r = await axios.get("/api/properties?limit=100"); return r.data.data },
  })

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UnitSchema>({
    resolver: zodResolver(unitSchema),
    defaultValues: initialData || { status: "VACANT", monthlyRent: 0 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Property</Label>
        <Select defaultValue={initialData?.propertyId} onValueChange={(v) => setValue("propertyId", v)}>
          <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
          <SelectContent>
            {propertiesData?.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.code} - {p.name} ({p.category})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.propertyId && <p className="text-xs text-destructive">{errors.propertyId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="unitNumber">Unit Number</Label><Input id="unitNumber" {...register("unitNumber")} placeholder="e.g. A-101" />{errors.unitNumber && <p className="text-xs text-destructive">{errors.unitNumber.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="floor">Floor</Label><Input id="floor" {...register("floor")} placeholder="e.g. 1st" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="unitType">Unit Type</Label><Input id="unitType" {...register("unitType")} placeholder="e.g. Shop, Flat" /></div>
        <div className="space-y-2"><Label htmlFor="size">Size (sq ft)</Label><Input id="size" type="number" {...register("size")} placeholder="0" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="monthlyRent">Monthly Rent</Label><Input id="monthlyRent" type="number" step="0.01" {...register("monthlyRent")} placeholder="0.00" />{errors.monthlyRent && <p className="text-xs text-destructive">{errors.monthlyRent.message}</p>}</div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select defaultValue={initialData?.status || "VACANT"} onValueChange={(v) => setValue("status", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="VACANT">Vacant</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Saving..." : initialData ? "Update Unit" : "Create Unit"}</Button>
    </form>
  )
}
