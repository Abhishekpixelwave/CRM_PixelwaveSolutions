"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Check,
  Save,
  Webhook,
  Copy,
  RefreshCw,
  Trash2,
  ShoppingCart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  saveEventPushConfigAction,
  fetchWebhookEventsAction,
  clearWebhookEventsAction,
} from "./actions"

type WebhookEvent = {
  id: string
  event?: string
  tradeNo?: string
  status?: number
  receivedAt: string
  payload?: unknown
}

const RENT_STATUS_LABELS: Record<number, string> = {
  0: "Rent failed",
  1: "Rent success",
  2: "Return success",
}

export function SettingsClient({ initialConfig }: { initialConfig: any }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [pushUrl, setPushUrl] = useState(initialConfig.pushUrl || "")
  const [subscriptions, setSubscriptions] = useState<any[]>(
    initialConfig.eventSubscriptions || []
  )

  const [cabinetEvents, setCabinetEvents] = useState<WebhookEvent[]>([])
  const [rentEvents, setRentEvents] = useState<WebhookEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  const cabinetWebhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/cabinet-events`
      : "/api/webhooks/cabinet-events"

  const rentCallbackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/rent-callback`
      : "/api/webhooks/rent-callback"

  const loadEvents = useCallback(async () => {
    setEventsLoading(true)
    try {
      const data = await fetchWebhookEventsAction()
      setCabinetEvents(data.cabinet as WebhookEvent[])
      setRentEvents(data.rent as WebhookEvent[])
    } finally {
      setEventsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleToggle = (index: number, checked: boolean) => {
    const newSubs = [...subscriptions]
    newSubs[index].enable = checked
    setSubscriptions(newSubs)
  }

  const handleUrlChange = (index: number, url: string) => {
    const newSubs = [...subscriptions]
    newSubs[index].pushUrl = url
    setSubscriptions(newSubs)
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    const payload = {
      pushUrl,
      eventSubscriptions: subscriptions,
    }
    await saveEventPushConfigAction(payload)
    setSuccess(true)
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleClearEvents = async (type: "cabinet" | "rent") => {
    await clearWebhookEventsAction(type)
    await loadEvents()
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Inbound Webhook URLs
          </CardTitle>
          <CardDescription>
            Register these URLs with Bajie for cabinet events and rent order callbacks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cabinet Event Push</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={cabinetWebhookUrl}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(cabinetWebhookUrl)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ShoppingCart className="h-3.5 w-3.5" />
              Rent Order Callback
            </Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={rentCallbackUrl}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(rentCallbackUrl)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Used when creating rent orders via the Open API. Bajie POSTs status and tradeNo here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>
              Recent inbound webhook payloads received by this CMS.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadEvents}
            disabled={eventsLoading}
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${eventsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cabinet">
            <TabsList>
              <TabsTrigger value="cabinet">
                Cabinet ({cabinetEvents.length})
              </TabsTrigger>
              <TabsTrigger value="rent">Rent ({rentEvents.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="cabinet" className="mt-4 space-y-3">
              {cabinetEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No cabinet events received yet.
                </p>
              ) : (
                cabinetEvents.map((item) => (
                  <EventLogItem
                    key={item.id}
                    title={item.event || "UNKNOWN"}
                    receivedAt={item.receivedAt}
                    payload={item.payload}
                  />
                ))
              )}
              {cabinetEvents.length > 0 && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearEvents("cabinet")}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Clear cabinet log
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="rent" className="mt-4 space-y-3">
              {rentEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No rent callbacks received yet.
                </p>
              ) : (
                rentEvents.map((item) => (
                  <EventLogItem
                    key={item.id}
                    title={item.tradeNo || "Unknown trade"}
                    receivedAt={item.receivedAt}
                    badge={
                      item.status !== undefined
                        ? RENT_STATUS_LABELS[item.status] ||
                          `Status ${item.status}`
                        : undefined
                    }
                    payload={item.payload}
                  />
                ))
              )}
              {rentEvents.length > 0 && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearEvents("rent")}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Clear rent log
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Global Event Push Configuration
          </CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time notifications for cabinet and battery events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="globalPushUrl">Global Push URL</Label>
            <Input
              id="globalPushUrl"
              placeholder={cabinetWebhookUrl}
              value={pushUrl}
              onChange={(e) => setPushUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              If an event does not have a separate push URL configured, this global URL will be used.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Subscriptions</CardTitle>
          <CardDescription>
            Toggle the events you want to listen to and optionally provide custom URLs for specific events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {subscriptions.map((sub, idx) => (
              <div
                key={sub.event}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-0.5">
                  <Label className="text-base">{sub.event}</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable push notifications for {sub.event.replace(/_/g, " ").toLowerCase()} events.
                  </p>
                  <div className="mt-2 max-w-sm">
                    <Input
                      placeholder="Custom URL (optional)"
                      value={sub.pushUrl || ""}
                      onChange={(e) => handleUrlChange(idx, e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Switch
                    checked={sub.enable}
                    onCheckedChange={(checked: boolean) => handleToggle(idx, checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t px-6 py-4">
          {success && (
            <span className="flex items-center text-sm text-emerald-500">
              <Check className="mr-1 h-4 w-4" /> Saved successfully
            </span>
          )}
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function EventLogItem({
  title,
  receivedAt,
  badge,
  payload,
}: {
  title: string
  receivedAt: string
  badge?: string
  payload?: unknown
}) {
  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-medium">{title}</span>
        {badge && <Badge variant="secondary">{badge}</Badge>}
        <span className="text-xs text-muted-foreground">
          {new Date(receivedAt).toLocaleString()}
        </span>
      </div>
      <pre className="max-h-32 overflow-auto rounded-md bg-muted/50 p-2 font-mono text-xs">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  )
}
