import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export class DashboardService {
  static async getStats(boardId: string) {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const baseWhere = { deletedAt: null, boardId }
    const [totalProperties, totalUnits, occupiedUnits, vacantUnits, activeTenants, activeLeases, monthlyInvoices, monthlyPayments, monthlyExpenses] = await Promise.all([
      prisma.property.count({ where: baseWhere }),
      prisma.unit.count({ where: { deletedAt: null, property: { boardId } } }),
      prisma.unit.count({ where: { status: "OCCUPIED", deletedAt: null, property: { boardId } } }),
      prisma.unit.count({ where: { status: "VACANT", deletedAt: null, property: { boardId } } }),
      prisma.user.count({ where: { boardId, role: "USER", deletedAt: null } }),
      prisma.lease.count({ where: { status: "ACTIVE", deletedAt: null, unit: { property: { boardId } } } }),
      prisma.invoice.findMany({ where: { deletedAt: null, createdAt: { gte: monthStart, lte: monthEnd }, lease: { unit: { property: { boardId } } } } }),
      prisma.payment.findMany({ where: { deletedAt: null, date: { gte: monthStart, lte: monthEnd }, invoice: { lease: { unit: { property: { boardId } } } } } }),
      prisma.expense.findMany({ where: { deletedAt: null, boardId, date: { gte: monthStart, lte: monthEnd } } }),
    ])

    const monthlyRevenue = monthlyInvoices.reduce((s, inv) => s + inv.totalAmount, 0)
    const collectedRevenue = monthlyPayments.reduce((s, p) => s + p.amount, 0)
    const monthlyExpensesTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0)

    // ── Monthly trend (last 6 months) ──
    const trendData: { month: string; revenue: number; expenses: number; collected: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i)
      const s = startOfMonth(d)
      const e = endOfMonth(d)
      const [inv, exp, pay] = await Promise.all([
        prisma.invoice.aggregate({ where: { deletedAt: null, createdAt: { gte: s, lte: e }, lease: { unit: { property: { boardId } } } }, _sum: { totalAmount: true } }),
        prisma.expense.aggregate({ where: { deletedAt: null, boardId, date: { gte: s, lte: e } }, _sum: { amount: true } }),
        prisma.payment.aggregate({ where: { deletedAt: null, date: { gte: s, lte: e }, invoice: { lease: { unit: { property: { boardId } } } } }, _sum: { amount: true } }),
      ])
      trendData.push({
        month: format(d, "MMM yy"),
        revenue: inv._sum.totalAmount || 0,
        expenses: exp._sum.amount || 0,
        collected: pay._sum.amount || 0,
      })
    }

    // ── Property type breakdown ──
    const propertyTypes = await prisma.property.groupBy({
      by: ["category"],
      where: { boardId, deletedAt: null },
      _count: true,
    })

    const propertyTypeData = propertyTypes.map((p) => ({
      name: p.category,
      value: p._count,
    }))

    // ── Unit status breakdown ──
    const unitStatusData = [
      { name: "Occupied", value: occupiedUnits, color: "hsl(142 72% 29%)" },
      { name: "Vacant", value: vacantUnits, color: "hsl(35 92% 65%)" },
      {
        name: "Reserved",
        value: await prisma.unit.count({ where: { status: "RESERVED", deletedAt: null, property: { boardId } } }),
        color: "hsl(200 90% 55%)",
      },
    ]

    return {
      totalProperties, totalUnits, occupiedUnits, vacantUnits, activeTenants, activeLeases,
      monthlyRevenue, collectedRevenue,
      outstandingRevenue: monthlyRevenue - collectedRevenue,
      monthlyExpenses: monthlyExpensesTotal,
      netProfit: collectedRevenue - monthlyExpensesTotal,
      trendData,
      propertyTypeData,
      unitStatusData,
      collectionRate: monthlyRevenue > 0 ? Math.round((collectedRevenue / monthlyRevenue) * 100) : 0,
      occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
    }
  }
}
