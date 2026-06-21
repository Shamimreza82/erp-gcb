import { z } from "zod"

export const propertySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  category: z.enum(["SHOP", "LAND", "HOUSE", "FLAT", "MARKET", "WAREHOUSE", "OTHER"]),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"]),
})

export type PropertySchema = z.infer<typeof propertySchema>
