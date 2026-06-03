import { Map } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { getOpenDeviceList, getShopList } from "@/lib/api-client"
import { getApiToken } from "@/lib/get-api-token"
import {
  buildChargerLocations,
  getMapCenter,
} from "@/lib/charger-map-data"
import type { DashboardShop } from "@/lib/dashboard-analytics"
import type { OpenDeviceListItem } from "@/lib/api-client"
import { ChargerMapWrapper } from "./charger-map-wrapper"

export default async function MapPage() {
  const token = await getApiToken()
  const [openRes, shopRes] = await Promise.all([
    getOpenDeviceList({}, token),
    getShopList(token),
  ])

  const openDevices =
    (openRes as { list?: OpenDeviceListItem[] }).list || []
  const shops = ((shopRes as { data?: DashboardShop[] }).data ||
    []) as DashboardShop[]

  const locations = buildChargerLocations(openDevices, shops)
  const center = getMapCenter(locations)
  const totalAvailable = locations.reduce((s, l) => s + l.available, 0)
  const totalChargers = locations.reduce((s, l) => s + l.total, 0)
  const onlineCount = locations.filter((l) => l.online).length

  return (
    <div
      className="flex min-h-0 flex-col gap-4"
      style={{ height: "calc(100vh - 7rem)" }}
    >
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Map className="h-6 w-6" />
            Network Map
          </h1>
          <p className="text-sm text-muted-foreground">
            Google-style map with streets, satellite, and terrain views
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{locations.length} venues</Badge>
          <Badge
            variant="secondary"
            className="bg-boost/10 text-black dark:text-boost"
          >
            {totalAvailable} / {totalChargers} batteries available
          </Badge>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
            {onlineCount} online
          </Badge>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ChargerMapWrapper locations={locations} center={center} />
      </div>
    </div>
  )
}
