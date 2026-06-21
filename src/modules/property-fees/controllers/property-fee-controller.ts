import { NextRequest } from "next/server"
import { PropertyFeeService } from "../services/property-fee-service"
import { propertyFeeSchema, propertyFeeUpdateSchema } from "../validations"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export class PropertyFeeController {
  static async list(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const property = await prisma.property.findUnique({ where: { id: params.id } })
      if (!property) return notFoundResponse("Property")
      const fees = await PropertyFeeService.findByProperty(params.id)
      return successResponse(fees)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to fetch fees")
    }
  }

  static async create(request: NextRequest, { params }: { params: { id: string } }) {
    const property = await prisma.property.findUnique({ where: { id: params.id } })
    if (!property) return notFoundResponse("Property")
    try {
      const body = await request.json()
      const parsed = propertyFeeSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const fee = await PropertyFeeService.create({ ...parsed.data, propertyId: params.id })
      return successResponse(fee, 201)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to create fee")
    }
  }

  static async update(request: NextRequest, { params }: { params: { id: string; feeId: string } }) {
    try {
      const body = await request.json()
      const parsed = propertyFeeUpdateSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const fee = await PropertyFeeService.update(params.feeId, parsed.data)
      return successResponse(fee)
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to update fee")
    }
  }

  static async remove(request: NextRequest, { params }: { params: { id: string; feeId: string } }) {
    try {
      await PropertyFeeService.remove(params.feeId)
      return successResponse({ message: "Fee removed" })
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to remove fee")
    }
  }
}
