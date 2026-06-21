"use client"

import { useForm } from "react-hook-form"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { ImageUpload } from "@/components/shared/image-upload"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"
import { Loader2, Save } from "lucide-react"

interface BoardSettings {
  name: string
  code: string
  address: string
  phone: string
  email: string
  taxId: string
  logo: string
  headerText: string
  footerText: string
  signature: string
  signatureName: string
}

export function BoardSettings() {
  const { data, isLoading } = useQuery({
    queryKey: ["board-settings"],
    queryFn: async () => { const r = await axios.get("/api/boards/my-settings"); return r.data.data },
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BoardSettings>()

  const mutation = useMutation({
    mutationFn: async (formData: BoardSettings) => { const r = await axios.put("/api/boards/my-settings", formData); return r.data },
    onSuccess: () => { toast.success("Settings saved") },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to save"),
  })

  useEffect(() => {
    if (data) {
      reset({
        name: data.name || "", code: data.code || "", address: data.address || "",
        phone: data.phone || "", email: data.email || "", taxId: data.taxId || "",
        logo: data.logo || "", headerText: data.headerText || "",
        footerText: data.footerText || "", signature: data.signature || "",
        signatureName: data.signatureName || "",
      })
    }
  }, [data, reset])

  const signature = watch("signature")
  const logo = watch("logo")

  if (isLoading) return <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>

  return (
    <div>
      <PageHeader title="Board Settings" description="Configure board branding for reports and documents" />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader><CardTitle className="text-base">Board Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Board Name</Label>
                  <Input id="name" {...register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Board Code</Label>
                  <Input id="code" {...register("code")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register("address")} placeholder="Board address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register("phone")} placeholder="Board phone" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="Board email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / Source Tax Info</Label>
                  <Input id="taxId" {...register("taxId")} placeholder="e.g. 4% Source Tax applicable" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader><CardTitle className="text-base">Branding & Documents</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <ImageUpload value={logo} onChange={(url) => setValue("logo", url)} folder="erp-gcb/logo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headerText">Report Header Text</Label>
                  <Input id="headerText" {...register("headerText")} placeholder="e.g. Gazipur Cantonment Board - Official Report" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerText">Report Footer Text</Label>
                  <Input id="footerText" {...register("footerText")} placeholder="e.g. This is a computer generated document" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signature">
            <Card>
              <CardHeader><CardTitle className="text-base">Signature</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signatureName">Signatory Name</Label>
                  <Input id="signatureName" {...register("signatureName")} placeholder="e.g. Executive Engineer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signature">Signature Image</Label>
                  <ImageUpload value={signature} onChange={(url) => setValue("signature", url)} folder="erp-gcb/signature" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
