"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/modules/auth/hooks/use-auth-store"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    }
    return () => unsub()
  }, [])

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, hydrated, router])

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
