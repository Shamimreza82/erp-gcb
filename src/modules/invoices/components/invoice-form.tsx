"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { invoiceSchema, type InvoiceSchema } from "../validations"
import type { InvoiceFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"
import { useEffect } from "react"

export function InvoiceForm({ onSubmit, loading }: { onSubmit: (d: InvoiceFormData) => Promise<void>; loading?: boolean }) {
  const { data: leases } = useQuery({
    queryKey: ["leases-active"],
    queryFn: async () => { const r = await axios.get("/api/leases?limit=100"); return r.data.data?.filter((l: any) => l.status === "ACTIVE" || l.status === "PENDING_CEO_APPROVAL") },
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { rentAmount: 0, utilityCharges: 0, serviceCharges: 0, lateFee: 0 },
  })

  const selectedLeaseId = watch("leaseId")
  const selectedLease = leases?.find((l: any) => l.id === selectedLeaseId)

  useEffect(() => { if (selectedLease) setValue("rentAmount", selectedLease.monthlyRent) }, [selectedLease, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Lease</Label>
        <Select onValueChange={(v) => setValue("leaseId", v)}>
          <SelectTrigger><SelectValue placeholder="Select lease" /></SelectTrigger>
          <SelectContent>
            {leases?.map((l: any) => (<SelectItem key={l.id} value={l.id}>{l.leaseNumber} - {l.tenant?.fullName}</SelectItem>))}
          </SelectContent>
        </Select>
        {errors.leaseId && <p className="text-xs text-destructive">{errors.leaseId.message}</p>}
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2"><Label htmlFor="rentAmount">Rent</Label><Input id="rentAmount" type="number" step="0.01" {...register("rentAmount")} />{errors.rentAmount && <p className="text-xs text-destructive">{errors.rentAmount.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="utilityCharges">Utility</Label><Input id="utilityCharges" type="number" step="0.01" {...register("utilityCharges")} /></div>
        <div className="space-y-2"><Label htmlFor="serviceCharges">Service</Label><Input id="serviceCharges" type="number" step="0.01" {...register("serviceCharges")} /></div>
        <div className="space-y-2"><Label htmlFor="lateFee">Late Fee</Label><Input id="lateFee" type="number" step="0.01" {...register("lateFee")} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" type="date" {...register("dueDate")} />{errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Input id="notes" {...register("notes")} /></div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Generate Invoice"}</Button>
    </form>
  )
}
