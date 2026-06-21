import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authUser = getUserFromRequest(request)
  if (!authUser) return errorResponse("Unauthorized", 401)

  const lease = await prisma.lease.findFirst({
    where: { tenantId: authUser.userId, status: "ACTIVE", deletedAt: null },
    include: {
      unit: {
        include: { property: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return successResponse(lease)
}
