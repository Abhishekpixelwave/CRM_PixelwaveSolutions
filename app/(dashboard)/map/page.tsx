import { Map } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getOpenDeviceList,
  getShopList,
} from "@/lib/api-client"
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
  const shops = ((shopRes as { data?: DashboardShop[] }).data || []) as DashboardShop[]

  const locations = buildChargerLocations(openDevices, shops)
  const center = getMapCenter(locations)
  const totalAvailable = locations.reduce((s, l) => s + l.available, 0)
  const totalChargers = locations.reduce((s, l) => s + l.total, 0)
  const onlineCount = locations.filter((l) => l.online).length

  return (
    <div className="flex min-h-0 flex-col gap-4" style={{ height: "calc(100vh - 7rem)" }}>
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Map className="h-6 w-6" />
            Charger Map
          </h1>
          <p className="text-sm text-muted-foreground">
            Live network view — same Open API data as the mobile app
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{locations.length} locations</Badge>
          <Badge variant="secondary" className="bg-boost/10 text-black dark:text-boost">
            {totalAvailable} / {totalChargers} available
          </Badge>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
            {onlineCount} online
          </Badge>
        </div>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardHeader className="shrink-0 pb-3">
          <CardTitle className="text-base">All charging stations</CardTitle>
          <CardDescription>
            Tap a pin for place name and available charger count
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 pb-4">
          <ChargerMapWrapper locations={locations} center={center} />
        </CardContent>
      </Card>

      <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {locations.map((loc) => (
          <Card key={loc.id} className="py-3">
            <CardContent className="px-4 py-0">
              <p className="truncate text-sm font-medium">{loc.name}</p>
              <p className="truncate text-xs text-muted-foreground">{loc.address}</p>
              <p className="mt-1 text-sm font-semibold text-boost">
                {loc.available} of {loc.total} chargers free
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
