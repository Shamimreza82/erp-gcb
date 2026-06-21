import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const authUser = getUserFromRequest(request)
  if (!authUser) return errorResponse("Unauthorized", 401)

  const dbUser = await prisma.user.findUnique({ where: { id: authUser.userId }, select: { boardId: true } })
  const boardId = dbUser?.boardId

  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role") || undefined
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || undefined

  const where: any = { deletedAt: null }
  if (boardId) where.boardId = boardId
  if (role) where.role = role
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, fullName: true, phone: true, role: true, boardId: true, isActive: true, createdAt: true },
      orderBy: { fullName: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return paginatedResponse(users, total, page, limit)
}
