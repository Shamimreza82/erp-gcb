import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { paginatedResponse, errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return errorResponse("Unauthorized", 401)

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true, role: true } })
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const entity = searchParams.get("entity") || undefined
  const action = searchParams.get("action") || undefined

  const where: any = {}
  if (entity) where.entity = entity
  if (action) where.action = action

  // Super Admin sees all logs. Board users see only their board's user logs.
  if (user.role !== "SUPER_ADMIN") {
    const boardUsers = await prisma.user.findMany({ where: { boardId: dbUser?.boardId }, select: { id: true } })
    where.userId = { in: boardUsers.map((u) => u.id) }
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { fullName: true, email: true, role: true } } },
    }),
    prisma.activityLog.count({ where }),
  ])

  return paginatedResponse(logs, total, page, limit)
}
