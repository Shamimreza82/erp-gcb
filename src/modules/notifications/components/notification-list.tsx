"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck } from "lucide-react"
import { timeAgo } from "@/utils/format"
import { toast } from "sonner"
import { api as axios } from "@/lib/axios"

export function NotificationList() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axios.get("/api/notifications")
      return res.data.data
    },
    refetchInterval: 30000,
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/notifications/mark-all-read")
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("All notifications marked as read")
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {data?.unreadCount > 0 && <Badge>{data.unreadCount}</Badge>}
        </CardTitle>
        {data?.unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : data?.notifications?.length === 0 ? (
          <div className="text-sm text-muted-foreground">No notifications</div>
        ) : (
          <div className="space-y-2">
            {data?.notifications?.map((notif: any) => (
              <div
                key={notif.id}
                className={`flex items-start justify-between rounded-lg border p-3 transition-colors ${!notif.isRead ? "bg-muted/50" : ""}`}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
