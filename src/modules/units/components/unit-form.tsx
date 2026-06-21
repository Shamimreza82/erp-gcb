"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { unitSchema, type UnitSchema } from "../validations"
import type { UnitFormData } from "../types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertySearchSelect } from "@/modules/properties/components/property-search-select"

const unitTypes = [
  { value: "SHOP", label: "Shop" },
  { value: "OFFICE", label: "Office" },
  { value: "FLAT", label: "Flat" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "ROOM", label: "Room" },
  { value: "OTHER", label: "Other" },
] as const

export function UnitForm({ initialData, onSubmit, loading }: { initialData?: UnitFormData; onSubmit: (d: UnitFormData) => Promise<void>; loading?: boolean }) {
  const predefinedValues = unitTypes.map(t => t.value)
  const initialType = initialData?.unitType && predefinedValues.includes(initialData.unitType as any) ? initialData.unitType : initialData?.unitType ? "OTHER" : undefined
  const [selectedType, setSelectedType] = useState(initialType || "")
  const [customType, setCustomType] = useState(initialData?.unitType && !predefinedValues.includes(initialData.unitType as any) ? initialData.unitType : "")
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UnitSchema>({
    resolver: zodResolver(unitSchema),
    defaultValues: { status: "VACANT", monthlyRent: 0, ...initialData, unitType: (initialData?.unitType && predefinedValues.includes(initialData.unitType as any)) ? initialData.unitType : "" },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <PropertySearchSelect
        value={initialData?.propertyId}
        onChange={(v) => setValue("propertyId", v)}
        error={errors.propertyId?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="unitNumber">Unit Number</Label><Input id="unitNumber" {...register("unitNumber")} placeholder="e.g. A-101" />{errors.unitNumber && <p className="text-xs text-destructive">{errors.unitNumber.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="floor">Floor</Label><Input id="floor" {...register("floor")} placeholder="e.g. 1st" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Unit Type</Label>
          <Select value={selectedType} onValueChange={(v) => {
            setSelectedType(v)
            if (v !== "OTHER") {
              setValue("unitType", v)
              setCustomType("")
            } else {
              setValue("unitType", "")
            }
          }}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {unitTypes.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedType === "OTHER" && (
            <Input
              placeholder="Enter custom type"
              value={customType}
              onChange={(e) => {
                setCustomType(e.target.value)
                setValue("unitType", e.target.value)
              }}
              className="mt-2"
            />
          )}
        </div>
        <div className="space-y-2"><Label htmlFor="size">Size (sq ft)</Label><Input id="size" type="number" {...register("size", { valueAsNumber: true })} placeholder="0" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="monthlyRent">Monthly Rent</Label><Input id="monthlyRent" type="number" step="0.01" {...register("monthlyRent", { valueAsNumber: true })} placeholder="0.00" />{errors.monthlyRent && <p className="text-xs text-destructive">{errors.monthlyRent.message}</p>}</div>
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
