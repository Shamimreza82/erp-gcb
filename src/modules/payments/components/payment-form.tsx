"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentSchema, type PaymentSchema } from "../validations"
import type { PaymentFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { api as axios } from "@/lib/axios"

interface PaymentFormProps {
  defaultInvoiceId?: string
  onSubmit: (data: PaymentFormData) => Promise<void>
  loading?: boolean
}

export function PaymentForm({ defaultInvoiceId, onSubmit, loading }: PaymentFormProps) {
  const { data: invoices } = useQuery({
    queryKey: ["invoices-unpaid"],
    queryFn: async () => {
      const res = await axios.get("/api/invoices?limit=100")
      return res.data.data?.filter((i: any) => i.status !== "PAID" && i.status !== "DRAFT")
    },
  })

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], method: "CASH", invoiceId: defaultInvoiceId || "" },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!defaultInvoiceId && (
        <div className="space-y-2">
          <Label>Invoice</Label>
          <Select onValueChange={(v) => setValue("invoiceId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select invoice" />
            </SelectTrigger>
            <SelectContent>
              {invoices?.map((inv: any) => (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {inv.lease?.tenant?.fullName} ({inv.totalAmount - inv.paidAmount} due)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.invoiceId && <p className="text-xs text-destructive">{errors.invoiceId.message}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" step="0.01" {...register("amount")} placeholder="0.00" />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select defaultValue="CASH" onValueChange={(v) => setValue("method", v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="referenceNumber">Reference #</Label>
          <Input id="referenceNumber" {...register("referenceNumber")} placeholder="Optional ref" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" {...register("notes")} placeholder="Optional notes" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Recording..." : "Record Payment"}
      </Button>
    </form>
  )
}
