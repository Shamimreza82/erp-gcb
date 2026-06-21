import { z } from "zod"

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.coerce.number().min(1, "Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  method: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_BANKING"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

export type PaymentSchema = z.infer<typeof paymentSchema>
