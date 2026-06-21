import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div>
      <PageHeader title="Maintenance" description="Maintenance request tracking" />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
          <Wrench className="h-12 w-12" />
          <p className="text-lg font-medium">Coming soon</p>
          <p className="text-sm">This feature will be available in the next update.</p>
        </CardContent>
      </Card>
    </div>
  )
}
