"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginSchema } from "../validations"
import { useAuthStore } from "../hooks/use-auth-store"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

export function LoginForm() {
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@erp.com", password: "123456" },
  })

  const accounts = [
    { label: "Super Admin", email: "admin@erp.com" },
    { label: "CEO", email: "ceo@gcb.gov.bd" },
    { label: "Manager", email: "manager@gcb.gov.bd" },
    { label: "Finance", email: "finance@gcb.gov.bd" },
    { label: "Tenant", email: "tenant@gcb.gov.bd" },
  ]

  const loginMutation = useMutation({
    mutationFn: async (data: LoginSchema) => {
      const res = await axios.post("/api/auth/login", data)
      return res.data
    },
    onSuccess: (res) => {
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token)
        localStorage.setItem("auth-storage", JSON.stringify({
          state: { user: res.data.user, token: res.data.token, isAuthenticated: true },
          version: 0,
        }))
        toast.success("Login successful")
        setTimeout(() => { window.location.href = "/" }, 100)
      }
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || "Login failed"
      setError("email", { message })
      toast.error(message)
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
          <div className="mt-2 space-y-1 rounded-md bg-muted p-2 text-xs">
            <p className="font-medium text-muted-foreground">Demo Accounts <span className="font-normal">(password: 123456)</span></p>
            {accounts.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => setValue("email", a.email)}
                className="flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="text-foreground">{a.label}</span>
                <span>{a.email}</span>
              </button>
            ))}
          </div>
        </CardHeader>
        {loginMutation.isError && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {loginMutation.error instanceof Error
              ? (loginMutation.error as any).response?.data?.error || "Login failed"
              : "Login failed"}
          </div>
        )}
        <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@erp.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                "Sign in"
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
