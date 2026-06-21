import { z } from "zod"

export const propertyFeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  yearlyOverrides: z.record(z.string(), z.coerce.number().min(0)).optional(),
  isActive: z.boolean().optional().default(true),
})

export const propertyFeeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.coerce.number().min(0).optional(),
  yearlyOverrides: z.record(z.string(), z.coerce.number().min(0)).optional(),
  isActive: z.boolean().optional(),
})

export type PropertyFeeSchema = z.infer<typeof propertyFeeSchema>
