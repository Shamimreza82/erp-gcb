import { prisma } from "@/lib/prisma"
import type { UnitFormData } from "../types"

export class UnitService {
  static async findAll(params: { boardId: string; skip?: number; take?: number; search?: string; propertyId?: string }) {
    const where: any = { deletedAt: null, property: { boardId: params.boardId } }
    if (params.search) where.OR = [{ unitNumber: { contains: params.search, mode: "insensitive" } }]
    if (params.propertyId) where.propertyId = params.propertyId
    const [data, total] = await Promise.all([
      prisma.unit.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" }, include: { property: { select: { id: true, code: true, name: true, category: true } } } }),
      prisma.unit.count({ where }),
    ])
    return { data, total }
  }

  static async findById(id: string) {
    return prisma.unit.findFirst({ where: { id, deletedAt: null }, include: { property: { select: { id: true, code: true, name: true, category: true } } } })
  }

  static async create(data: UnitFormData, userId: string) {
    return prisma.unit.create({ data: { ...data, createdBy: userId } })
  }

  static async update(id: string, data: UnitFormData, userId: string) {
    return prisma.unit.update({ where: { id }, data: { ...data, updatedBy: userId } })
  }

  static async delete(id: string) {
    return prisma.unit.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
