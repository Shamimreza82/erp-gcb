import { NextRequest } from "next/server"
import { RegisterService } from "../services/register-service"
import { registerSchema } from "../validations/register"
import { successResponse, errorResponse } from "@/lib/api-response"
import { logError } from "@/lib/activity-logger"

export class RegisterController {
  static async register(request: NextRequest) {
    try {
      const body = await request.json()
      const parsed = registerSchema.safeParse(body)
      if (!parsed.success) {
        return errorResponse(parsed.error.errors[0].message)
      }
      const user = await RegisterService.register(parsed.data)
      return successResponse({ message: "Registration successful. Please login.", user }, 201)
    } catch (error) {
      logError("auth", error)
      console.error("[auth] Register error:", error)
      return errorResponse(error instanceof Error ? error.message : "Registration failed")
    }
  }
}
