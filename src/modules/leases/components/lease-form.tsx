"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leaseSchema, type LeaseSchema } from "../validations"
import type { LeaseFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"

interface LeaseFormProps {
  initialData?: LeaseFormData
  onSubmit: (data: LeaseFormData) => Promise<void>
  loading?: boolean
}

export function LeaseForm({ initialData, onSubmit, loading }: LeaseFormProps) {
  const { data: tenants } = useQuery({
    queryKey: ["tenants-for-lease"],
    queryFn: async () => { const r = await axios.get("/api/users?role=USER&limit=100"); return r.data.data },
  })

  const { data: units } = useQuery({
    queryKey: ["units-vacant"],
    queryFn: async () => { const r = await axios.get("/api/units?limit=100"); return r.data.data?.filter((u: any) => u.status === "VACANT") },
  })

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LeaseSchema>({
    resolver: zodResolver(leaseSchema),
    defaultValues: initialData || { monthlyRent: 0, securityDeposit: 0 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>User (Tenant)</Label>
        <Select defaultValue={initialData?.tenantId} onValueChange={(v) => setValue("tenantId", v)}>
          <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
          <SelectContent>
            {tenants?.map((t: any) => (<SelectItem key={t.id} value={t.id}>{t.fullName} ({t.phone})</SelectItem>))}
          </SelectContent>
        </Select>
        {errors.tenantId && <p className="text-xs text-destructive">{errors.tenantId.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Unit</Label>
        <Select defaultValue={initialData?.unitId} onValueChange={(v) => setValue("unitId", v)}>
          <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
          <SelectContent>
            {units?.map((u: any) => (
              <SelectItem key={u.id} value={u.id}>{u.unitNumber} - {u.property?.name} ({u.monthlyRent} BDT)</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.unitId && <p className="text-xs text-destructive">{errors.unitId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" {...register("startDate")} />{errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" {...register("endDate")} />{errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="monthlyRent">Monthly Rent</Label><Input id="monthlyRent" type="number" step="0.01" {...register("monthlyRent")} />{errors.monthlyRent && <p className="text-xs text-destructive">{errors.monthlyRent.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="securityDeposit">Security Deposit</Label><Input id="securityDeposit" type="number" step="0.01" {...register("securityDeposit")} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Input id="notes" {...register("notes")} placeholder="Optional notes" /></div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Lease"}</Button>
    </form>
  )
}
