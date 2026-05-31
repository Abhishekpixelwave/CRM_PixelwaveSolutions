"use client";

import {
  Map,
  MapTileLayer,
  MapMarker,
} from "@/components/ui/map";
import { MapPinIcon } from "lucide-react";
import type { LatLngExpression } from "leaflet";

interface ShopMiniMapProps {
  lat: number;
  lng: number;
  shopName: string;
}

export function ShopMiniMap({ lat, lng, shopName }: ShopMiniMapProps) {
  if (!lat || !lng) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-muted/50 text-xs text-muted-foreground">
        No location data
      </div>
    );
  }

  const center: LatLngExpression = [lat, lng];

  return (
    <Map
      center={center}
      zoom={14}
      maxZoom={18}
      className="z-0 min-h-0 h-full w-full rounded-lg"
    >
      <MapTileLayer />
      <MapMarker
        position={center}
        icon={
          <MapPinIcon className="size-6 fill-primary text-primary" />
        }
        iconAnchor={[12, 24]}
      />
    </Map>
  );
}
