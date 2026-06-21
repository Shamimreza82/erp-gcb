"use client"

import { useEffect, useRef, useCallback } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
}

const CLOUD_NAME = "dljmjf792"
const API_KEY = "957654246192937"

export function ImageUpload({ value, onChange, folder = "erp-gcb" }: ImageUploadProps) {
  const widgetRef = useRef<any>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (scriptLoadedRef.current || document.querySelector('script[src*="upload-widget.cloudinary.com"]')) return

    const script = document.createElement("script")
    script.src = "https://upload-widget.cloudinary.com/global/all.js"
    script.async = true
    script.onload = () => { scriptLoadedRef.current = true }
    document.body.appendChild(script)

    return () => {
      widgetRef.current?.destroy()
    }
  }, [])

  const openWidget = useCallback(() => {
    if (!window.cloudinary) {
      toast.error("Upload widget is still loading. Please try again.")
      return
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        apiKey: API_KEY,
        uploadSignature: (callback: any, paramsToSign: any) => {
          axios
            .post("/api/upload", { paramsToSign })
            .then((r) => callback(r.data.signature))
            .catch(() => callback(null, { status: "Error", statusText: "Failed to get signature" }))
        },
        folder,
      },
      (error: any, result: any) => {
        if (error) {
          const msg = error.statusText || "Upload failed"
          toast.error(msg)
          console.error("[ImageUpload]", msg, error)
          return
        }
        if (result?.event === "success") {
          onChange(result.info.secure_url)
          toast.success("Image uploaded")
        }
      },
    )

    widgetRef.current = widget
    widget.open()
  }, [folder, onChange])

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Uploaded image" className="h-20 w-auto rounded border object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow transition-colors hover:bg-destructive/90"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={openWidget}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      )}
    </div>
  )
}
