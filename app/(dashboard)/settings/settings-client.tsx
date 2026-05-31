"use client"

import { useState } from "react"
import { Check, Save, Webhook } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { saveEventPushConfigAction } from "./actions"

export function SettingsClient({ initialConfig }: { initialConfig: any }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [pushUrl, setPushUrl] = useState(initialConfig.pushUrl || "")
  const [subscriptions, setSubscriptions] = useState<any[]>(
    initialConfig.eventSubscriptions || []
  )

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

  return (
    <div className="max-w-4xl space-y-6">
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
              placeholder="https://your-api.com/webhooks/cabinet-events"
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
