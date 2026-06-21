import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns"

export class ReportService {
  static async getMonthlyReport(boardId: string, monthStr?: string) {
    const now = new Date()
    const targetDate = monthStr ? new Date(monthStr + "-01") : now
    const s = startOfMonth(targetDate)
    const e = endOfMonth(targetDate)

    const [invoices, payments, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: { deletedAt: null, dueDate: { gte: s, lte: e }, lease: { unit: { property: { boardId } } } },
      }),
      prisma.payment.findMany({
        where: { deletedAt: null, date: { gte: s, lte: e }, invoice: { lease: { unit: { property: { boardId } } } } },
        include: { invoice: { select: { totalAmount: true } } },
      }),
      prisma.expense.findMany({
        where: { deletedAt: null, boardId, date: { gte: s, lte: e } },
      }),
    ])

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const sourceTax = totalCollected * 0.04

    return {
      month: format(targetDate, "yyyy-MM"),
      label: format(targetDate, "MMMM yyyy"),
      totalInvoiced,
      totalCollected,
      totalOutstanding: totalInvoiced - totalCollected,
      totalExpenses,
      netProfit: totalCollected - totalExpenses,
      sourceTax,
      collectedAfterTax: totalCollected - sourceTax,
      invoiceCount: invoices.length,
      paymentCount: payments.length,
      paidInvoices: invoices.filter((i) => i.status === "PAID").length,
      unpaidInvoices: invoices.filter((i) => i.status !== "PAID").length,
    }
  }

  static async getArrearsReport(boardId: string) {
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        deletedAt: null,
        status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] },
        dueDate: { lt: new Date() },
        lease: { unit: { property: { boardId } } },
      },
      include: {
        lease: { select: { leaseNumber: true, tenant: { select: { id: true, fullName: true, phone: true } } } },
      },
      orderBy: { dueDate: "asc" },
    })

    const totalArrears = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)

    return {
      totalArrears,
      overdueCount: overdueInvoices.length,
      items: overdueInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        tenant: inv.lease?.tenant?.fullName || "Unknown",
        tenantPhone: inv.lease?.tenant?.phone || "",
        leaseNumber: inv.lease?.leaseNumber || "",
        amount: inv.totalAmount,
        paid: inv.paidAmount,
        due: inv.totalAmount - inv.paidAmount,
        dueDate: inv.dueDate,
        daysOverdue: Math.floor((Date.now() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        status: inv.status,
      })),
    }
  }

  static async getDailyReport(boardId: string) {
    const now = new Date()
    const s = startOfMonth(now) // today start
    const e = endOfMonth(now) // today end
    // For daily, use the current day
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const [todayPayments, todayInvoices, monthPayments, activeLeases, overdueInvoices] = await Promise.all([
      prisma.payment.findMany({ where: { deletedAt: null, date: { gte: dayStart, lte: dayEnd }, invoice: { lease: { unit: { property: { boardId } } } } } }),
      prisma.invoice.findMany({ where: { deletedAt: null, createdAt: { gte: dayStart, lte: dayEnd }, lease: { unit: { property: { boardId } } } } }),
      prisma.payment.aggregate({ where: { deletedAt: null, date: { gte: s, lte: e }, invoice: { lease: { unit: { property: { boardId } } } } }, _sum: { amount: true } }),
      prisma.lease.count({ where: { status: "ACTIVE", deletedAt: null, unit: { property: { boardId } } } }),
      prisma.invoice.count({ where: { deletedAt: null, status: { in: ["UNPAID", "OVERDUE"] }, dueDate: { lt: now }, lease: { unit: { property: { boardId } } } } }),
    ])

    return {
      date: format(now, "yyyy-MM-dd"),
      todayCollection: todayPayments.reduce((s, p) => s + p.amount, 0),
      todayPaymentCount: todayPayments.length,
      todayNewInvoices: todayInvoices.length,
      monthCollection: monthPayments._sum.amount || 0,
      activeLeases,
      overdueInvoices,
    }
  }

  static async getRegularIrregular(boardId: string) {
    const now = new Date()
    const threeMonthsAgo = subMonths(now, 3)

    const tenants = await prisma.user.findMany({
      where: { boardId, role: "USER", deletedAt: null },
      include: {
        leases: {
          where: { status: "ACTIVE", deletedAt: null },
          include: {
            invoices: {
              where: { deletedAt: null, dueDate: { gte: threeMonthsAgo } },
              include: { payments: { where: { deletedAt: null } } },
            },
          },
        },
      },
    })

    const items = tenants.map((t) => {
      const totalInvoiced = t.leases.reduce((s, l) => s + l.invoices.reduce((s2, i) => s2 + i.totalAmount, 0), 0)
      const totalPaid = t.leases.reduce((s, l) => s + l.invoices.reduce((s2, i) => s2 + i.payments.reduce((s3, p) => s3 + p.amount, 0), 0), 0)
      const isRegular = totalInvoiced > 0 && totalPaid >= totalInvoiced * 0.8

      return {
        tenantId: t.id,
        tenantName: t.fullName,
        tenantPhone: t.phone,
        totalInvoiced,
        totalPaid,
        outstanding: totalInvoiced - totalPaid,
        status: isRegular ? "regular" : "irregular" as const,
        leaseCount: t.leases.length,
      }
    })

    return {
      regular: items.filter((i) => i.status === "regular"),
      irregular: items.filter((i) => i.status === "irregular"),
      totalRegular: items.filter((i) => i.status === "regular").length,
      totalIrregular: items.filter((i) => i.status === "irregular").length,
    }
  }
}
