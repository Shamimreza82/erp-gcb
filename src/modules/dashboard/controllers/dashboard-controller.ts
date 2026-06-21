import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { DashboardService } from "../services/dashboard-service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export class DashboardController {
  static async getStats(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true, role: true } })

    // Tenants see their personal dashboard (single lease/user data)
    if (dbUser?.role === "TENANT") {
      const lease = await prisma.lease.findFirst({
        where: { tenantId: user.userId, status: "ACTIVE", deletedAt: null },
      })
      const invoiceCount = await prisma.invoice.count({ where: { tenantId: user.userId, deletedAt: null } })
      const paymentCount = await prisma.payment.count({ where: { invoice: { tenantId: user.userId }, deletedAt: null } })

      return successResponse({
        totalProperties: lease ? 1 : 0,
        totalUnits: lease ? 1 : 0,
        occupiedUnits: lease ? 1 : 0,
        vacantUnits: 0,
        activeTenants: 1,
        activeLeases: lease ? 1 : 0,
        monthlyRevenue: 0,
        collectedRevenue: 0,
        outstandingRevenue: 0,
        monthlyExpenses: 0,
        netProfit: 0,
        trendData: [],
        propertyTypeData: [],
        unitStatusData: [],
        collectionRate: 0,
        occupancyRate: lease ? 100 : 0,
      })
    }

    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)
    const stats = await DashboardService.getStats(dbUser.boardId)
    return successResponse(stats)
  }
}
