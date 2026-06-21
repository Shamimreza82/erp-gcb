import { NextRequest } from "next/server"
import { AuthController } from "@/modules/auth/controllers/auth-controller"

export async function GET(request: NextRequest) {
  return AuthController.me(request)
}
