import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authUser = getUserFromRequest(request)
  if (!authUser) return errorResponse("Unauthorized", 401)

  const payments = await prisma.payment.findMany({
    where: { invoice: { tenantId: authUser.userId }, deletedAt: null },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          totalAmount: true,
          lease: { select: { leaseNumber: true } },
        },
      },
    },
    orderBy: { date: "desc" },
    take: 50,
  })

  return successResponse(payments)
}
