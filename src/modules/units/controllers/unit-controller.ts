import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { UnitService } from "../services/unit-service"
import { unitSchema } from "../validations"
import { successResponse, errorResponse, notFoundResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export class UnitController {
  static async list(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined
    const propertyId = searchParams.get("propertyId") || undefined
    const { data, total } = await UnitService.findAll({ boardId: dbUser.boardId, skip: (page - 1) * limit, take: limit, search, propertyId })
    return paginatedResponse(data, total, page, limit)
  }

  static async getById(request: NextRequest, { params }: { params: { id: string } }) {
    const unit = await UnitService.findById(params.id)
    if (!unit) return notFoundResponse("Unit")
    return successResponse(unit)
  }

  static async create(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const body = await request.json()
      const parsed = unitSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const unit = await UnitService.create(parsed.data, user.userId)
      return successResponse(unit, 201)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to create unit")
    }
  }

  static async update(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const body = await request.json()
      const parsed = unitSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const unit = await UnitService.update(params.id, parsed.data, user.userId)
      return successResponse(unit)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to update unit")
    }
  }

  static async delete(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await UnitService.delete(params.id)
      return successResponse({ message: "Unit deleted" })
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to delete unit")
    }
  }
}
