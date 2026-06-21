import { z } from "zod"

export const invoiceSchema = z.object({
  leaseId: z.string().min(1, "Lease is required"),
  rentAmount: z.coerce.number().min(0, "Rent must be positive"),
  utilityCharges: z.coerce.number().min(0).default(0),
  serviceCharges: z.coerce.number().min(0).default(0),
  lateFee: z.coerce.number().min(0).default(0),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
})

export type InvoiceSchema = z.infer<typeof invoiceSchema>
