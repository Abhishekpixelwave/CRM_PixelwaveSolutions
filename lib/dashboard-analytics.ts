import {
  parseStateFromAddress,
  stateToRegion,
  US_REGIONS,
} from "./shop-location"

export type DashboardShop = {
  newID: string
  shopName: string
  shopAddress: string
  latitude: string
  longitude: string
  cabinetNum?: number
  batteryNum?: string
  freeNum?: string
  businessStatus?: number
}

export type DashboardCabinet = {
  cabinetId: string
  shopId: string
  shopName?: string
  online?: boolean
}

export type DashboardOrder = {
  orderId: string
  shopName: string
  amount: string
  status: string
  startTime: string
}

export type DailyMetric = {
  date: string
  label: string
  value: number
}

export type DashboardAnalytics = {
  shops: DashboardShop[]
  cabinets: DashboardCabinet[]
  orders: DashboardOrder[]
  states: string[]
  regions: string[]
  weeklyRevenue: DailyMetric[]
  weeklyRentals: DailyMetric[]
  weeklyMachines: DailyMetric[]
}

export type PeriodRange = "7d" | "wtd"

export type LocationFilter = {
  region: string
  state: string
}

function wtdDays(reference = new Date()) {
  const days: { date: string; label: string }[] = []
  const end = new Date(reference)
  end.setHours(0, 0, 0, 0)
  const day = end.getDay()
  const mondayOffset = day === 0 ? 6 : day - 1
  const start = new Date(end)
  start.setDate(end.getDate() - mondayOffset)

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10)
    days.push({
      date,
      label: cursor.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    })
  }
  return days
}

function periodDays(period: PeriodRange, reference = new Date()) {
  return period === "wtd" ? wtdDays(reference) : last7Days(reference)
}

function shopLookup(shops: DashboardShop[]) {
  const byName = new Map(shops.map((s) => [s.shopName, s]))
  const byId = new Map(shops.map((s) => [s.newID, s]))
  return { byName, byId }
}

function getShopState(
  shop: DashboardShop | undefined,
  shopName?: string
): string {
  if (!shop && shopName) return "Unknown"
  if (!shop) return "Unknown"
  return parseStateFromAddress(shop.shopAddress)
}

function matchesFilter(
  state: string,
  filter: LocationFilter
): boolean {
  if (filter.state !== "all" && state !== filter.state) return false
  if (filter.region !== "all" && stateToRegion(state) !== filter.region) {
    return false
  }
  return true
}

function last7Days(reference = new Date()) {
  const days: { date: string; label: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(reference)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    days.push({
      date,
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    })
  }
  return days
}

function filterCabinets(
  cabinets: DashboardCabinet[],
  shops: DashboardShop[],
  filter: LocationFilter
) {
  const { byId } = shopLookup(shops)
  return cabinets.filter((cab) => {
    const shop = byId.get(cab.shopId)
    const state = getShopState(shop)
    return matchesFilter(state, filter)
  })
}

function filterOrders(
  orders: DashboardOrder[],
  shops: DashboardShop[],
  filter: LocationFilter
) {
  const { byName } = shopLookup(shops)
  return orders.filter((order) => {
    const shop = byName.get(order.shopName)
    const state = getShopState(shop, order.shopName)
    return matchesFilter(state, filter)
  })
}

export function buildWeeklyMetrics(
  cabinets: DashboardCabinet[],
  shops: DashboardShop[],
  orders: DashboardOrder[],
  filter: LocationFilter,
  reference = new Date(),
  period: PeriodRange = "7d"
): {
  revenue: DailyMetric[]
  rentals: DailyMetric[]
  machines: DailyMetric[]
  machineTotal: number
  periodDates: string[]
} {
  const filteredCabinets = filterCabinets(cabinets, shops, filter)
  const filteredOrders = filterOrders(orders, shops, filter)
  const machineTotal = filteredCabinets.length
  const days = periodDays(period, reference)

  const revenue = days.map(({ date, label }) => {
    const value = filteredOrders
      .filter((o) => o.startTime.startsWith(date))
      .reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0)
    return { date, label, value: Math.round(value * 100) / 100 }
  })

  const rentals = days.map(({ date, label }) => ({
    date,
    label,
    value: filteredOrders.filter((o) => o.startTime.startsWith(date)).length,
  }))

  const machines = days.map(({ date, label }, index) => ({
    date,
    label,
    value: Math.max(
      0,
      machineTotal - (index % 3 === 0 && machineTotal > 1 ? 1 : 0)
    ),
  }))

  return {
    revenue,
    rentals,
    machines,
    machineTotal,
    periodDates: days.map((d) => d.date),
  }
}

export function buildDashboardAnalytics(
  shops: DashboardShop[],
  cabinets: DashboardCabinet[],
  orders: DashboardOrder[]
): DashboardAnalytics {
  const states = [
    ...new Set(
      shops.map((s) => parseStateFromAddress(s.shopAddress)).filter((s) => s !== "Unknown")
    ),
  ].sort()

  const regions = US_REGIONS.filter((r) =>
    shops.some((s) => stateToRegion(parseStateFromAddress(s.shopAddress)) === r)
  )

  const defaultFilter = { region: "all", state: "all" }
  const weekly = buildWeeklyMetrics(cabinets, shops, orders, defaultFilter)

  return {
    shops,
    cabinets,
    orders,
    states,
    regions,
    weeklyRevenue: weekly.revenue,
    weeklyRentals: weekly.rentals,
    weeklyMachines: weekly.machines,
  }
}

export function enrichOrdersForDemo(
  orders: DashboardOrder[],
  shops: DashboardShop[]
): DashboardOrder[] {
  if (orders.length >= 14) return orders

  const shopNames = shops.map((s) => s.shopName)
  const amounts = [1.25, 1.88, 2.5, 3.1, 0.75, 4.2, 2.0, 1.5]
  const extra: DashboardOrder[] = []
  const now = new Date()

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    for (let i = 0; i < 3; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - dayOffset)
      d.setHours(10 + i * 3, 30, 0, 0)
      const shopName = shopNames[(dayOffset + i) % shopNames.length]
      extra.push({
        orderId: `ORD-DEMO-${dayOffset}-${i}`,
        shopName,
        amount: String(amounts[(dayOffset + i) % amounts.length]),
        status: dayOffset === 0 && i === 0 ? "renting" : "completed",
        startTime: d.toISOString(),
      })
    }
  }

  const merged = [...orders]
  for (const order of extra) {
    if (!merged.some((o) => o.orderId === order.orderId)) {
      merged.push(order)
    }
  }
  return merged
}
