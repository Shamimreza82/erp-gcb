export interface PropertyFeeFormData {
  name: string
  amount: number // default monthly rate
  yearlyOverrides?: Record<string, number> // { "2026": 500 } — monthly rate per year
  isActive?: boolean
}

export interface PropertyFee extends PropertyFeeFormData {
  id: string
  propertyId: string
  createdAt: string
  updatedAt: string
}
