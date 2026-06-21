import { NextRequest } from "next/server"
import { RegisterController } from "@/modules/auth/controllers/register-controller"

export async function POST(request: NextRequest) {
  return RegisterController.register(request)
}
