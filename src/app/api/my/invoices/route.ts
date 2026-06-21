import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authUser = getUserFromRequest(request)
  if (!authUser) return errorResponse("Unauthorized", 401)

  const invoices = await prisma.invoice.findMany({
    where: { tenantId: authUser.userId, deletedAt: null },
    include: {
      lease: {
        select: {
          leaseNumber: true,
          unit: { select: { unitNumber: true, property: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return successResponse(invoices)
}
