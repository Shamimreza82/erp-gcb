import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { LeaseService } from "../services/lease-service"
import { leaseSchema } from "../validations"
import { successResponse, errorResponse, notFoundResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export class LeaseController {
  static async list(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const { data, total } = await LeaseService.findAll({ boardId: dbUser.boardId, skip: (page - 1) * limit, take: limit, search: searchParams.get("search") || undefined })
    return paginatedResponse(data, total, page, limit)
  }

  static async getById(request: NextRequest, { params }: { params: { id: string } }) {
    const lease = await LeaseService.findById(params.id)
    if (!lease) return notFoundResponse("Lease")
    return successResponse(lease)
  }

  static async create(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const body = await request.json()
      const parsed = leaseSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const lease = await LeaseService.create(parsed.data, user.userId)
      return successResponse(lease, 201)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to create lease")
    }
  }

  static async approve(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const lease = await LeaseService.approve(params.id, user.userId)
      return successResponse(lease)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to approve lease")
    }
  }

  static async reject(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const lease = await LeaseService.reject(params.id)
      return successResponse(lease)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to reject lease")
    }
  }

  static async terminate(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const lease = await LeaseService.terminate(params.id, user.userId)
      return successResponse(lease)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to terminate lease")
    }
  }

  static async delete(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await LeaseService.delete(params.id)
      return successResponse({ message: "Lease deleted" })
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to delete lease")
    }
  }
}
