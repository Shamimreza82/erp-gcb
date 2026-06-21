import { z } from "zod"

export const leaseSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  unitId: z.string().min(1, "Unit is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  monthlyRent: z.coerce.number().min(0, "Rent must be positive"),
  securityDeposit: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
})

export type LeaseSchema = z.infer<typeof leaseSchema>
