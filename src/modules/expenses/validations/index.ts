import { z } from "zod"

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["MAINTENANCE", "UTILITY", "CLEANING", "SECURITY", "MISCELLANEOUS"]),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
})

export type ExpenseSchema = z.infer<typeof expenseSchema>
