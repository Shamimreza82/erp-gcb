import { prisma } from "@/lib/prisma"
import { endOfMonth } from "date-fns"
import type { InvoiceFormData } from "../types"

export class InvoiceService {
  static async findAll(params: { boardId?: string; skip?: number; take?: number; search?: string; status?: string; dueMonth?: string }) {
    const where: any = { deletedAt: null }
    if (params.boardId) where.lease = { unit: { property: { boardId: params.boardId } } }
    if (params.search) {
      where.OR = [
        { invoiceNumber: { contains: params.search, mode: "insensitive" } },
        { lease: { tenant: { fullName: { contains: params.search, mode: "insensitive" } } } },
      ]
    }
    if (params.status) {
      const statuses = params.status.split(",")
      where.status = { in: statuses }
    }
    if (params.dueMonth) {
      const [year, month] = params.dueMonth.split("-").map(Number)
      const start = new Date(year, month - 1, 1)
      const end = endOfMonth(start)
      where.dueDate = { gte: start, lte: end }
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
    const otherCharges = data.otherCharges || 0
    const totalAmount = data.rentAmount + (data.utilityCharges || 0) + (data.serviceCharges || 0) + otherCharges + (data.lateFee || 0)
    const createPayload: any = {
      invoiceNumber, tenantId: data.tenantId, leaseId: data.leaseId,
      rentAmount: data.rentAmount, utilityCharges: data.utilityCharges || 0,
      serviceCharges: data.serviceCharges || 0, otherCharges,
      chargeDetails: data.chargeDetails || undefined,
      lateFee: data.lateFee || 0,
      totalAmount, dueDate: new Date(data.dueDate), notes: data.notes, createdBy: userId,
    }
    return prisma.invoice.create({ data: createPayload })
  }

  static async generateBatch(boardId: string, month: string, userId: string) {
    const [yearStr, monthStr] = month.split("-")
    const year = parseInt(yearStr)
    const monthNum = parseInt(monthStr)
    const dueDate = endOfMonth(new Date(year, monthNum - 1, 1))

    const activeLeases = await prisma.lease.findMany({
      where: { status: "ACTIVE", deletedAt: null, unit: { property: { boardId } } },
      include: { tenant: { select: { id: true } }, unit: { select: { propertyId: true } } },
    })

    const propertyIds = [...new Set(activeLeases.map(l => l.unit.propertyId))]
    const feesByProperty: Record<string, any[]> = {}
    if (propertyIds.length > 0) {
      const allFees = await prisma.propertyFee.findMany({
        where: { propertyId: { in: propertyIds }, isActive: true, deletedAt: null },
      })
      for (const fee of allFees) {
        if (!feesByProperty[fee.propertyId]) feesByProperty[fee.propertyId] = []
        feesByProperty[fee.propertyId].push(fee)
      }
    }

    const monthKey = String(monthNum).padStart(2, "0")

    let created = 0
    let skipped = 0

    for (const lease of activeLeases) {
      const existing = await prisma.invoice.findFirst({
        where: {
          leaseId: lease.id,
          dueDate: { gte: new Date(year, monthNum - 1, 1), lte: dueDate },
          deletedAt: null,
        },
      })
      if (existing) { skipped++; continue }

      const fees = feesByProperty[lease.unit.propertyId] || []
      const chargeDetails = fees.map((f: any) => ({
        name: f.name,
        amount: f.yearlyOverrides?.[yearStr] ?? f.amount,
      }))
      const otherCharges = chargeDetails.reduce((sum: number, f: any) => sum + f.amount, 0)

      const count = await prisma.invoice.count()
      const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`

      const createPayload: any = {
        invoiceNumber, tenantId: lease.tenantId, leaseId: lease.id,
        rentAmount: lease.monthlyRent, utilityCharges: 0, serviceCharges: 0,
        otherCharges, chargeDetails,
        lateFee: 0, totalAmount: lease.monthlyRent + otherCharges,
        dueDate, createdBy: userId,
      }
      await prisma.invoice.create({ data: createPayload })
      created++
    }

    return { created, skipped, totalLeases: activeLeases.length }
  }

  static async applyLateFees(boardId: string, lateFeeAmount: number = 100) {
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        deletedAt: null,
        status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] },
        dueDate: { lt: new Date() },
        lease: { unit: { property: { boardId } } },
      },
    })

    let updated = 0
    for (const inv of overdueInvoices) {
      const daysOverdue = Math.floor((Date.now() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysOverdue > 0 && inv.lateFee === 0) {
        const fee = lateFeeAmount * Math.ceil(daysOverdue / 30)
        await prisma.invoice.update({
          where: { id: inv.id },
          data: {
            lateFee: fee,
            totalAmount: inv.rentAmount + inv.utilityCharges + inv.serviceCharges + inv.otherCharges + fee,
            status: "OVERDUE",
          },
        })
        updated++
      }
    }
    return { updated, total: overdueInvoices.length }
  }

  static async delete(id: string) {
    return prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
