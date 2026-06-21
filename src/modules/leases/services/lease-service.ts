import { prisma } from "@/lib/prisma"
import type { LeaseFormData } from "../types"

export class LeaseService {
  static async findAll(params: { boardId?: string; skip?: number; take?: number; search?: string }) {
    const where: any = { deletedAt: null }
    if (params.boardId) where.unit = { property: { boardId: params.boardId } }
    if (params.search) {
      where.OR = [
        { leaseNumber: { contains: params.search, mode: "insensitive" } },
        { tenant: { fullName: { contains: params.search, mode: "insensitive" } } },
      ]
    }
    const [data, total] = await Promise.all([
      prisma.lease.findMany({
        where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" },
        include: {
          tenant: { select: { id: true, fullName: true, phone: true } },
          unit: { select: { id: true, unitNumber: true, property: { select: { name: true, category: true } } } },
        },
      }),
      prisma.lease.count({ where }),
    ])
    return { data, total }
  }

  static async findById(id: string) {
    return prisma.lease.findFirst({
      where: { id, deletedAt: null },
      include: {
        tenant: true,
        unit: { include: { property: true } },
        invoices: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      },
    })
  }

  static async create(data: LeaseFormData, userId: string) {
    const unit = await prisma.unit.findUnique({ where: { id: data.unitId } })
    if (!unit || unit.deletedAt) throw new Error("Unit not found")
    if (unit.status === "OCCUPIED") throw new Error("Unit is already occupied")

    const count = await prisma.lease.count({ where: { deletedAt: null } })
    const leaseNumber = `LSE-${String(count + 1).padStart(4, "0")}`

    return prisma.lease.create({
      data: {
        leaseNumber,
        tenantId: data.tenantId,
        unitId: data.unitId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        monthlyRent: data.monthlyRent,
        securityDeposit: data.securityDeposit,
        notes: data.notes,
        status: "PENDING_CEO_APPROVAL",
        createdBy: userId,
      },
    })
  }

  static async approve(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const lease = await tx.lease.update({
        where: { id },
        data: { status: "ACTIVE", approvedBy: userId, approvedAt: new Date() },
      })
      await tx.unit.update({
        where: { id: lease.unitId },
        data: { status: "OCCUPIED" },
      })
      return lease
    })
  }

  static async reject(id: string) {
    return prisma.lease.update({
      where: { id },
      data: { status: "REJECTED" },
    })
  }

  static async terminate(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const lease = await tx.lease.update({
        where: { id },
        data: { status: "TERMINATED", updatedBy: userId },
      })
      await tx.unit.update({
        where: { id: lease.unitId },
        data: { status: "VACANT", updatedBy: userId },
      })
      return lease
    })
  }

  static async delete(id: string) {
    return prisma.lease.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
