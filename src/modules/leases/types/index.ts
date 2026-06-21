export interface LeaseFormData {
  tenantId: string
  unitId: string
  startDate: string
  endDate?: string
  monthlyRent: number
  securityDeposit: number
  notes?: string
}

export interface Lease extends LeaseFormData {
  id: string
  leaseNumber: string
  status: "PENDING_CEO_APPROVAL" | "ACTIVE" | "TERMINATED" | "EXPIRED" | "REJECTED"
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  tenant?: { id: string; fullName: string; phone: string }
  unit?: { id: string; unitNumber: string; property?: { name: string; category: string } }
}
