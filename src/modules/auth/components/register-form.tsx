"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterSchema } from "../validations/register"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"
import Link from "next/link"
import { useState } from "react"

export function RegisterForm() {
  const [done, setDone] = useState(false)

  const { data: boards } = useQuery({
    queryKey: ["public-boards"],
    queryFn: async () => { const r = await axios.get("/api/boards/public"); return r.data.data },
  })

  const { register, handleSubmit, setValue, formState: { errors }, setError } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const mutation = useMutation({
    mutationFn: async (data: RegisterSchema) => {
      const res = await axios.post("/api/auth/register", data)
      return res.data
    },
    onSuccess: () => { setDone(true); toast.success("Registration successful") },
    onError: (err: any) => { const msg = err.response?.data?.error || "Registration failed"; setError("email", { message: msg }); toast.error(msg) },
  })

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <CheckCircle className="h-16 w-16 text-primary" />
            <CardTitle className="text-2xl">Registration successful</CardTitle>
            <CardDescription>Your account has been created. Please login.</CardDescription>
            <Button asChild className="mt-4"><Link href="/login">Go to Login</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Register under your Cantonment Board</CardDescription>
        </CardHeader>

        {mutation.isError && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {(mutation.error as any)?.response?.data?.error || "Registration failed"}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Your Board</Label>
              <Select onValueChange={(v) => setValue("boardId", v)}>
                <SelectTrigger><SelectValue placeholder="Choose your Cantonment Board" /></SelectTrigger>
                <SelectContent>
                  {boards?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      <span className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        {b.name} ({b.code})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.boardId && <p className="text-xs text-destructive">{errors.boardId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Your full name" />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="your@email.com" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} placeholder="017XXXXXXXX" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} placeholder="Min 6 characters" />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nidNumber">NID Number (optional)</Label>
                <Input id="nidNumber" {...register("nidNumber")} placeholder="National ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (optional)</Label>
                <Input id="address" {...register("address")} placeholder="Your address" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>) : "Create Account"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
