"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertySchema, type PropertySchema } from "../validations"
import type { PropertyFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PropertyFormProps {
  initialData?: PropertyFormData
  onSubmit: (data: PropertyFormData) => Promise<void>
  loading?: boolean
}

const categories = [
  { value: "SHOP", label: "Shop" },
  { value: "LAND", label: "Land" },
  { value: "HOUSE", label: "House" },
  { value: "FLAT", label: "Flat" },
  { value: "MARKET", label: "Market" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "OTHER", label: "Other" },
] as const

export function PropertyForm({ initialData, onSubmit, loading }: PropertyFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PropertySchema>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || { status: "ACTIVE", category: "SHOP" },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Property Code</Label>
          <Input id="code" {...register("code")} placeholder="e.g. SHOP-001" />
          {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={initialData?.status || "ACTIVE"} onValueChange={(v) => setValue("status", v as any)}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Property Name</Label>
          <Input id="name" {...register("name")} placeholder="Enter property name" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select defaultValue={initialData?.category || "SHOP"} onValueChange={(v) => setValue("category", v as any)}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} placeholder="Enter address" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} placeholder="Enter description" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : initialData ? "Update Property" : "Create Property"}
      </Button>
    </form>
  )
}
