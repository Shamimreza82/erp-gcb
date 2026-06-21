import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return errorResponse("Unauthorized", 401)

  try {
    const { paramsToSign } = await request.json()
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!)
    return NextResponse.json({ signature, timestamp: paramsToSign.timestamp })
  } catch (_error) {
    return errorResponse("Failed to generate signature")
  }
}
