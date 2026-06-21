import { prisma } from "@/lib/prisma"
import type { InvoiceFormData } from "../types"

export class InvoiceService {
  static async findAll(params: { boardId: string; skip?: number; take?: number; search?: string }) {
    const where: any = { deletedAt: null, lease: { unit: { property: { boardId: params.boardId } } } }
    if (params.search) {
      where.OR = [
        { invoiceNumber: { contains: params.search, mode: "insensitive" } },
        { lease: { tenant: { fullName: { contains: params.search, mode: "insensitive" } } } },
      ]
    }
    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" },
        include: { lease: { select: { leaseNumber: true, tenant: { select: { id: true, fullName: true, phone: true } }, unit: { select: { unitNumber: true, property: { select: { name: true, category: true } } } } } } },
      }),
      prisma.invoice.count({ where }),
    ])
    return { data, total }
  }

  static async findById(id: string) {
    return prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: { lease: { include: { tenant: true, unit: { include: { property: true } } } }, payments: { where: { deletedAt: null }, orderBy: { date: "desc" } } },
    })
  }

  static async create(data: InvoiceFormData & { tenantId: string }, userId: string) {
    const count = await prisma.invoice.count()
    const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`
    const totalAmount = data.rentAmount + (data.utilityCharges || 0) + (data.serviceCharges || 0) + (data.lateFee || 0)
    return prisma.invoice.create({
      data: {
        invoiceNumber, tenantId: data.tenantId, leaseId: data.leaseId,
        rentAmount: data.rentAmount, utilityCharges: data.utilityCharges || 0,
        serviceCharges: data.serviceCharges || 0, lateFee: data.lateFee || 0,
        totalAmount, dueDate: new Date(data.dueDate), notes: data.notes, createdBy: userId,
      },
    })
  }

  static async delete(id: string) {
    return prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
