export interface UnitFormData {
  propertyId: string
  unitNumber: string
  floor?: string
  unitType?: string
  monthlyRent: number
  size?: number
  status: "VACANT" | "OCCUPIED" | "RESERVED"
}

export interface Unit extends UnitFormData {
  id: string
  createdAt: string
  updatedAt: string
  property?: { id: string; code: string; name: string; category: string }
}
