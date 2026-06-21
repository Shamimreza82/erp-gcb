import { prisma } from "@/lib/prisma"
import type { PropertyFeeFormData } from "../types"

export class PropertyFeeService {
  static async findByProperty(propertyId: string) {
    return prisma.propertyFee.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    })
  }

  static async create(data: PropertyFeeFormData & { propertyId: string }) {
    return prisma.propertyFee.create({ data })
  }

  static async update(id: string, data: Partial<PropertyFeeFormData>) {
    return prisma.propertyFee.update({ where: { id }, data })
  }

  static async remove(id: string) {
    return prisma.propertyFee.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
