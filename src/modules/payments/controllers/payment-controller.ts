import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { PaymentService } from "../services/payment-service"
import { paymentSchema } from "../validations"
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export class PaymentController {
  static async list(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined
    const invoiceId = searchParams.get("invoiceId") || undefined
    const { data, total } = await PaymentService.findAll({ boardId: dbUser.boardId, skip: (page - 1) * limit, take: limit, search, invoiceId })
    return paginatedResponse(data, total, page, limit)
  }

  static async create(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const body = await request.json()
      const parsed = paymentSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const payment = await PaymentService.create(parsed.data, user.userId)
      return successResponse(payment, 201)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to record payment")
    }
  }

  static async delete(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await PaymentService.delete(params.id)
      return successResponse({ message: "Payment deleted" })
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to delete payment")
    }
  }
}
