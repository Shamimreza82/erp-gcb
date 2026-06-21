"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { expenseSchema, type ExpenseSchema } from "../validations"
import type { ExpenseFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExpenseFormProps {
  initialData?: ExpenseFormData
  onSubmit: (data: ExpenseFormData) => Promise<void>
  loading?: boolean
}

export function ExpenseForm({ initialData, onSubmit, loading }: ExpenseFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || { date: new Date().toISOString().split("T")[0], category: "MAINTENANCE", amount: 0 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Expense Title</Label>
        <Input id="title" {...register("title")} placeholder="Enter title" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select defaultValue={initialData?.category || "MAINTENANCE"} onValueChange={(v) => setValue("category", v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="CLEANING">Cleaning</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
              <SelectItem value="MISCELLANEOUS">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" step="0.01" {...register("amount")} placeholder="0.00" />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" {...register("notes")} placeholder="Optional notes" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : initialData ? "Update Expense" : "Add Expense"}
      </Button>
    </form>
  )
}
