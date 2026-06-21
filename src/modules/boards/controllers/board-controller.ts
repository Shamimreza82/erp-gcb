import { NextRequest } from "next/server"
import { BoardService } from "../services/board-service"
import { successResponse, errorResponse, notFoundResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"
import { logActivity, logError } from "@/lib/activity-logger"

export class BoardController {
  static async list(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined
    const { data, total } = await BoardService.findAll({ skip: (page - 1) * limit, take: limit, search })
    return paginatedResponse(data, total, page, limit)
  }

  static async getById(request: NextRequest, { params }: { params: { id: string } }) {
    const board = await BoardService.findById(params.id)
    if (!board) return notFoundResponse("Board")
    return successResponse(board)
  }

  static async create(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user || user.role !== "SUPER_ADMIN") return errorResponse("Forbidden", 403)
    try {
      const body = await request.json()
      const board = await BoardService.create(body)
      await logActivity({ userId: user.userId, action: "CREATE", entity: "board", entityId: board.id, details: { name: board.name, code: board.code } })
      return successResponse(board, 201)
    } catch (error) {
      logError("board", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to create board")
    }
  }

  static async update(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    if (!user || user.role !== "SUPER_ADMIN") return errorResponse("Forbidden", 403)
    try {
      const body = await request.json()
      const board = await BoardService.update(params.id, body)
      await logActivity({ userId: user.userId, action: "UPDATE", entity: "board", entityId: params.id })
      return successResponse(board)
    } catch (error) {
      logError("board", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to update board")
    }
  }

  static async delete(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    if (!user || user.role !== "SUPER_ADMIN") return errorResponse("Forbidden", 403)
    try {
      await BoardService.delete(params.id)
      await logActivity({ userId: user.userId, action: "DELETE", entity: "board", entityId: params.id })
      return successResponse({ message: "Board deleted" })
    } catch (error) {
      logError("board", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to delete board")
    }
  }
}
