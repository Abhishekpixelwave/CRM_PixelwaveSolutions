import { Settings } from "lucide-react"
import { SettingsClient } from "./settings-client"
import { AppearanceSettings } from "@/components/appearance-settings"
import { fetchEventPushConfigAction } from "./actions"

export default async function SettingsPage() {
  const response = await fetchEventPushConfigAction()
  const initialConfig = (response as any).data || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Settings className="h-6 w-6 text-foreground" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system configurations and external integrations.
          </p>
        </div>
      </div>
      
      <AppearanceSettings />
      <SettingsClient initialConfig={initialConfig} />
    </div>
  )
}
