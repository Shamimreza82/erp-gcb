import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"
import type { PaymentFormData } from "../types"

export class PaymentService {
  static async findAll(params: { boardId?: string; skip?: number; take?: number; search?: string; invoiceId?: string; currentMonth?: boolean }) {
    const where: any = { deletedAt: null }
    if (params.boardId) where.invoice = { lease: { unit: { property: { boardId: params.boardId } } } }
    if (params.invoiceId) where.invoiceId = params.invoiceId
    if (params.currentMonth) {
      const now = new Date()
      where.date = { gte: startOfMonth(now), lte: endOfMonth(now) }
    }
    if (params.search) {
      where.invoice = {
        invoiceNumber: { contains: params.search, mode: "insensitive" },
      }
    }
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip: params.skip, take: params.take, orderBy: { date: "desc" },
        include: {
          invoice: {
            select: {
              invoiceNumber: true, totalAmount: true, paidAmount: true, status: true,
              lease: { select: { tenant: { select: { fullName: true } } } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ])
    return { data, total }
  }

  static async create(data: PaymentFormData, userId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: data.invoiceId } })
    if (!invoice || invoice.deletedAt) throw new Error("Invoice not found")
    if (invoice.status === "PAID") throw new Error("Invoice is already paid")

    const newPaidAmount = invoice.paidAmount + data.amount
    if (newPaidAmount > invoice.totalAmount) {
      throw new Error("Payment exceeds invoice total")
    }

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          date: new Date(data.date),
          method: data.method,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          createdBy: userId,
        },
      })

      const newStatus = newPaidAmount >= invoice.totalAmount ? "PAID" : "PARTIAL"
      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: { paidAmount: newPaidAmount, status: newStatus, updatedBy: userId },
      })

      return payment
    })
  }

  static async delete(id: string) {
    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) throw new Error("Payment not found")

    return prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id },
        data: { deletedAt: new Date() },
      })

      const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } })
      if (invoice) {
        const remainingPayments = await tx.payment.findMany({
          where: { invoiceId: payment.invoiceId, deletedAt: null },
        })
        const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0)
        const newStatus = totalPaid === 0 ? "UNPAID" : totalPaid >= invoice.totalAmount ? "PAID" : "PARTIAL"
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { paidAmount: totalPaid, status: newStatus },
        })
      }
    })
  }
}
