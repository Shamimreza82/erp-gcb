import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ExpenseService } from "../services/expense-service"
import { expenseSchema } from "../validations"
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export class ExpenseController {
  static async list(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const { data, total } = await ExpenseService.findAll({ boardId: dbUser.boardId, skip: (page - 1) * limit, take: limit, search: searchParams.get("search") || undefined })
    return paginatedResponse(data, total, page, limit)
  }

  static async create(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)

    try {
      const body = await request.json()
      const parsed = expenseSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const expense = await ExpenseService.create({ ...parsed.data, boardId: dbUser.boardId }, user.userId)
      return successResponse(expense, 201)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to create expense")
    }
  }

  static async update(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const body = await request.json()
      const parsed = expenseSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const expense = await ExpenseService.update(params.id, parsed.data, user.userId)
      return successResponse(expense)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to update expense")
    }
  }

  static async delete(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await ExpenseService.delete(params.id)
      return successResponse({ message: "Expense deleted" })
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to delete expense")
    }
  }
}
