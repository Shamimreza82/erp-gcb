import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollText } from "lucide-react"

export default function ActivityLogsPage() {
  return (
    <div>
      <PageHeader title="Activity Logs" description="System audit trail" />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
          <ScrollText className="h-12 w-12" />
          <p className="text-lg font-medium">Coming soon</p>
          <p className="text-sm">This feature will be available in the next update.</p>
        </CardContent>
      </Card>
    </div>
  )
}
