"use client"

import { useMemo, useState } from "react"
import { Battery, MapPinIcon } from "lucide-react"
import type { LatLngExpression } from "leaflet"

import {
  Map,
  MapMarker,
  MapMarkerClusterGroup,
  MapPopup,
  MapTileLayer,
} from "@/components/ui/map"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ChargerMapLocation } from "@/lib/charger-map-data"

export function ChargerMap({
  locations,
  center,
}: {
  locations: ChargerMapLocation[]
  center: [number, number]
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q)
    )
  }, [locations, query])

  const mapCenter: LatLngExpression = center

  return (
    <div className="relative h-full min-h-[480px] overflow-hidden rounded-xl border">
      <div className="absolute top-3 left-3 z-[1000] w-64">
        <Input
          placeholder="Search locations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-background/95 shadow-md backdrop-blur"
        />
      </div>
      <div className="absolute top-3 right-3 z-[1000] rounded-lg border bg-background/95 px-3 py-2 text-xs shadow-md backdrop-blur">
        <span className="font-medium text-boost">{filtered.length}</span>{" "}
        locations ·{" "}
        {filtered.reduce((s, l) => s + l.available, 0)} chargers available
      </div>

      <Map center={mapCenter} zoom={4} maxZoom={18} className="h-full min-h-[480px]">
        <MapTileLayer />
        <MapMarkerClusterGroup>
          {filtered.map((location) => (
            <MapMarker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={
                <MapPinIcon
                  className={`size-7 ${location.online ? "fill-boost text-boost" : "fill-muted-foreground text-muted-foreground"}`}
                />
              }
              iconAnchor={[14, 28]}
            >
              <MapPopup>
                <div className="space-y-2 p-1">
                  <p className="font-semibold leading-tight">{location.name}</p>
                  <p className="text-xs text-muted-foreground">{location.address}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-boost/10 text-black dark:text-boost"
                    >
                      <Battery className="h-3 w-3" />
                      {location.available} / {location.total} available
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
    </div>
  )
}
