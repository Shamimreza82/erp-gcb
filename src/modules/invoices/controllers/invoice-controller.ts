import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { InvoiceService } from "../services/invoice-service"
import { invoiceSchema } from "../validations"
import { successResponse, errorResponse, notFoundResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

export class InvoiceController {
  static async list(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const { data, total } = await InvoiceService.findAll({ boardId: dbUser.boardId, skip: (page - 1) * limit, take: limit, search: searchParams.get("search") || undefined })
    return paginatedResponse(data, total, page, limit)
  }

  static async getById(request: NextRequest, { params }: { params: { id: string } }) {
    const invoice = await InvoiceService.findById(params.id)
    if (!invoice) return notFoundResponse("Invoice")
    return successResponse(invoice)
  }

  static async create(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const body = await request.json()
      const parsed = invoiceSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)

      const lease = await prisma.lease.findUnique({ where: { id: parsed.data.leaseId } })
      if (!lease) return errorResponse("Lease not found")

      const invoice = await InvoiceService.create({ ...parsed.data, tenantId: lease.tenantId }, user.userId)
      return successResponse(invoice, 201)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to create invoice")
    }
  }

  static async delete(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await InvoiceService.delete(params.id)
      return successResponse({ message: "Invoice deleted" })
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to delete invoice")
    }
  }
}
