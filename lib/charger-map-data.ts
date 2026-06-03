import type { OpenDeviceListItem } from "@/lib/api-client"
import type { DashboardShop } from "@/lib/dashboard-analytics"

export type ChargerMapLocation = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  available: number
  total: number
  online: boolean
}

export function buildChargerLocations(
  openDevices: OpenDeviceListItem[],
  shops: DashboardShop[]
): ChargerMapLocation[] {
  const byShopId = new Map<string, ChargerMapLocation>()

  for (const item of openDevices) {
    const shop = item.shop
    const lat = parseFloat(shop.latitude)
    const lng = parseFloat(shop.longitude)
    if (!lat || !lng) continue

    byShopId.set(shop.id, {
      id: shop.id,
      name: shop.shopName,
      address: shop.shopAddress,
      lat,
      lng,
      available: parseInt(item.cabinet.freeNum, 10) || 0,
      total: parseInt(item.cabinet.batteryNum, 10) || 0,
      online: item.cabinet.infoStatus === "1",
    })
  }

  for (const shop of shops) {
    if (byShopId.has(shop.newID)) continue
    const lat = parseFloat(shop.latitude)
    const lng = parseFloat(shop.longitude)
    if (!lat || !lng) continue

    byShopId.set(shop.newID, {
      id: shop.newID,
      name: shop.shopName,
      address: shop.shopAddress,
      lat,
      lng,
      available: parseInt(shop.freeNum || "0", 10),
      total: parseInt(shop.batteryNum || "0", 10) || shop.cabinetNum || 0,
      online: true,
    })
  }

  return [...byShopId.values()]
}

export function getMapCenter(locations: ChargerMapLocation[]): [number, number] {
  if (locations.length === 0) return [39.8283, -98.5795]
  const lat =
    locations.reduce((sum, l) => sum + l.lat, 0) / locations.length
  const lng =
    locations.reduce((sum, l) => sum + l.lng, 0) / locations.length
  return [lat, lng]
}
