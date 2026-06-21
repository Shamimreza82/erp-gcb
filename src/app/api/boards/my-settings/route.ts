import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)
    const board = await prisma.board.findUnique({
      where: { id: dbUser.boardId },
      select: { id: true, name: true, code: true, address: true, phone: true, email: true, taxId: true, logo: true, headerText: true, footerText: true, signature: true, signatureName: true },
    })
    return successResponse(board)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to load settings")
  }
}

export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return errorResponse("Unauthorized", 401)
  const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
  if (!dbUser?.boardId) return errorResponse("No board assigned", 403)
  try {
    const body = await request.json()
    const board = await prisma.board.update({
      where: { id: dbUser.boardId },
      data: {
        name: body.name, code: body.code, address: body.address,
        phone: body.phone, email: body.email, taxId: body.taxId,
        logo: body.logo, headerText: body.headerText, footerText: body.footerText, signature: body.signature, signatureName: body.signatureName,
      },
    })
    logActivity({ userId: user.userId, action: "UPDATE", entity: "board-settings", entityId: board.id })
    return successResponse(board)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to update settings")
  }
}
