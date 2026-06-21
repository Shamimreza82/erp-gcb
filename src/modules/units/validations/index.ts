import { z } from "zod"
export const unitSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.string().optional(),
  unitType: z.string().optional(),
  monthlyRent: z.coerce.number().min(0, "Rent must be positive"),
  size: z.coerce.number().min(0).optional(),
  status: z.enum(["VACANT", "OCCUPIED", "RESERVED"]),
})
export type UnitSchema = z.infer<typeof unitSchema>
