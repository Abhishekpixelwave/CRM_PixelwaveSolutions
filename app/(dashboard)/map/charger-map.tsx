"use client"

import { useEffect, useMemo, useState } from "react"
import { useMap } from "react-leaflet"
import {
  Battery,
  BatteryLow,
  MapPin,
  Search,
  Wifi,
  WifiOff,
} from "lucide-react"
import type { LatLngExpression } from "leaflet"

import {
  Map,
  MapFullscreenControl,
  MapLayers,
  MapLayersControl,
  MapMarker,
  MapMarkerClusterGroup,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { MAP_TILE_LAYERS } from "@/lib/map-tiles"
import type { ChargerMapLocation } from "@/lib/charger-map-data"

type FilterMode = "all" | "online" | "available"

function MapFlyTo({
  target,
}: {
  target: { lat: number; lng: number } | null
}) {
  const map = useMap()

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 15, { duration: 0.75 })
    }
  }, [target, map])

  return null
}

function KioskMarkerIcon({
  available,
  online,
  selected,
}: {
  available: number
  online: boolean
  selected?: boolean
}) {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform",
        selected && "scale-110 ring-2 ring-boost ring-offset-1 ring-offset-background",
        !online && "bg-muted-foreground text-background",
        online && available > 0 && "bg-boost text-black",
        online && available === 0 && "bg-destructive text-white"
      )}
    >
      <span className="text-[10px] font-bold leading-none">{available}</span>
    </div>
  )
}

function ClusterIcon({ count }: { count: number }) {
  return (
    <div className="flex size-11 items-center justify-center rounded-full border-2 border-white bg-boost text-sm font-bold text-black shadow-lg">
      {count}
    </div>
  )
}

export function ChargerMap({
  locations,
  center,
}: {
  locations: ChargerMapLocation[]
  center: [number, number]
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterMode>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return locations.filter((loc) => {
      const matchesQuery =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q)
      const matchesFilter =
        filter === "all" ||
        (filter === "online" && loc.online) ||
        (filter === "available" && loc.online && loc.available > 0)
      return matchesQuery && matchesFilter
    })
  }, [locations, query, filter])

  const stats = useMemo(
    () => ({
      venues: filtered.length,
      available: filtered.reduce((s, l) => s + l.available, 0),
      total: filtered.reduce((s, l) => s + l.total, 0),
      online: filtered.filter((l) => l.online).length,
    }),
    [filtered]
  )

  const mapCenter: LatLngExpression = center
  const { streets, satellite, terrain } = MAP_TILE_LAYERS

  function selectLocation(loc: ChargerMapLocation) {
    setSelectedId(loc.id)
    setFlyTarget({ lat: loc.lat, lng: loc.lng })
  }

  return (
    <div className="flex h-full min-h-[520px] overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm shadow-black/[0.04] dark:shadow-black/20">
      <div className="relative min-w-0 flex-1">
        <MapLayers defaultTileLayer={streets.name}>
          <Map
            center={mapCenter}
            zoom={5}
            maxZoom={20}
            className="h-full min-h-[520px] rounded-none"
          >
            <MapTileLayer
              name={streets.name}
              url={streets.url}
              darkUrl={streets.darkUrl}
              attribution={streets.attribution}
              maxZoom={streets.maxZoom}
            />
            <MapTileLayer
              name={satellite.name}
              url={satellite.url}
              darkUrl={satellite.darkUrl}
              attribution={satellite.attribution}
              maxZoom={satellite.maxZoom}
            />
            <MapTileLayer
              name={terrain.name}
              url={terrain.url}
              darkUrl={terrain.darkUrl}
              attribution={terrain.attribution}
              maxZoom={terrain.maxZoom}
            />

            <MapFlyTo target={flyTarget} />
            <MapZoomControl position="bottom-3 right-3" />
            <MapFullscreenControl position="top-3 right-3" />
            <MapLayersControl
              position="bottom-3 left-3"
              tileLayersLabel="Map type"
              className="shadow-md"
            />

            <MapMarkerClusterGroup
              icon={(count) => <ClusterIcon count={count} />}
            >
              {filtered.map((location) => (
                <MapMarker
                  key={location.id}
                  position={[location.lat, location.lng]}
                  icon={
                    <KioskMarkerIcon
                      available={location.available}
                      online={location.online}
                      selected={selectedId === location.id}
                    />
                  }
                  iconAnchor={[18, 18]}
                  eventHandlers={{
                    click: () => selectLocation(location),
                  }}
                >
                  <MapPopup>
                    <div className="space-y-2.5 p-1">
                      <div>
                        <p className="font-semibold leading-tight">
                          {location.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {location.address}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-boost/10 text-black dark:text-boost"
                        >
                          <Battery className="h-3 w-3" />
                          {location.available} / {location.total} free
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={
                            location.online
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {location.online ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>
                  </MapPopup>
                </MapMarker>
              ))}
            </MapMarkerClusterGroup>
          </Map>
        </MapLayers>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] bg-gradient-to-b from-background/85 via-background/40 to-transparent p-3">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="border bg-background/95 shadow-sm">
              {stats.venues} venues
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1 border bg-background/95 text-black shadow-sm dark:text-boost"
            >
              <Battery className="h-3 w-3" />
              {stats.available} / {stats.total} batteries
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1 border bg-emerald-500/10 text-emerald-600 shadow-sm"
            >
              <Wifi className="h-3 w-3" />
              {stats.online} online
            </Badge>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute bottom-14 left-3 z-[1000] border shadow-md lg:hidden"
          onClick={() => setSidebarOpen((o) => !o)}
        >
          {sidebarOpen ? "Hide list" : "Show venues"}
        </Button>
      </div>

      <aside
        className={cn(
          "flex w-full shrink-0 flex-col border-l bg-card transition-all lg:w-80",
          sidebarOpen
            ? "max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-[1001] max-lg:shadow-xl"
            : "max-lg:hidden"
        )}
      >
        <div className="space-y-3 border-b p-4">
          <div>
            <h2 className="text-sm font-semibold">Venues</h2>
            <p className="text-xs text-muted-foreground">
              Select a venue to focus the map
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search venues…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "All"],
                ["online", "Online"],
                ["available", "Available"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={filter === value ? "default" : "outline"}
                className={cn(
                  "h-7 px-2.5 text-xs",
                  filter === value && "bg-boost text-black hover:bg-boost/90"
                )}
                onClick={() => setFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
              <MapPin className="h-8 w-8 opacity-40" />
              <p>No venues match your filters</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((loc) => {
                const selected = selectedId === loc.id
                const lowStock =
                  loc.online &&
                  loc.total > 0 &&
                  loc.available / loc.total <= 0.25

                return (
                  <li key={loc.id}>
                    <button
                      type="button"
                      onClick={() => selectLocation(loc)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "border-boost/50 bg-boost/10"
                          : "border-transparent hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-medium">
                          {loc.name}
                        </p>
                        {loc.online ? (
                          <Wifi className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        ) : (
                          <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {loc.address}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            !loc.online && "text-muted-foreground",
                            loc.online && loc.available > 0 && "text-boost",
                            loc.online &&
                              loc.available === 0 &&
                              "text-destructive"
                          )}
                        >
                          {loc.available} / {loc.total} batteries
                        </span>
                        {lowStock && (
                          <BatteryLow className="h-3.5 w-3.5 text-amber-500" />
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
