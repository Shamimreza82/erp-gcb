import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { PropertyService } from "../services/property-service"
import { propertySchema } from "../validations"
import { successResponse, errorResponse, notFoundResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"
import { logActivity, logError } from "@/lib/activity-logger"

export class PropertyController {
  static async list(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    let boardId: string | undefined = dbUser?.boardId || undefined
    if (user.role === "SUPER_ADMIN") boardId = undefined
    if (!boardId && user.role !== "SUPER_ADMIN") return errorResponse("No board assigned", 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined
    const { data, total } = await PropertyService.findAll({ boardId, skip: (page - 1) * limit, take: limit, search })
    return paginatedResponse(data, total, page, limit)
  }

  static async getById(request: NextRequest, { params }: { params: { id: string } }) {
    const property = await PropertyService.findById(params.id)
    if (!property) return notFoundResponse("Property")
    return successResponse(property)
  }

  static async create(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })

    try {
      const body = await request.json()
      const parsed = propertySchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const boardId = user.role === "SUPER_ADMIN" ? (body.boardId || dbUser?.boardId) : dbUser?.boardId
      if (!boardId) return errorResponse("No board assigned", 403)
      const property = await PropertyService.create({ ...parsed.data, boardId }, user.userId)
      await logActivity({ userId: user.userId, action: "CREATE", entity: "property", entityId: property.id, details: { code: property.code, name: property.name } })
      return successResponse(property, 201)
    } catch (error) {
      logError("property", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to create property")
    }
  }

  static async update(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const body = await request.json()
      const parsed = propertySchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const property = await PropertyService.update(params.id, parsed.data, user.userId)
      await logActivity({ userId: user.userId, action: "UPDATE", entity: "property", entityId: params.id })
      return successResponse(property)
    } catch (error) {
      logError("property", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to update property")
    }
  }

  static async delete(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    try {
      await PropertyService.delete(params.id)
      await logActivity({ userId: user?.userId, action: "DELETE", entity: "property", entityId: params.id })
      return successResponse({ message: "Property deleted" })
    } catch (error) {
      logError("property", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to delete property")
    }
  }
}
