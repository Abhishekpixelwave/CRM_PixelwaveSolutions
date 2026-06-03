import type { DashboardOrder } from "./dashboard-analytics"

export const CELLULAR_COST_PER_KIOSK_MONTH = 20
export const STRIPE_PERCENT = 0.029
export const STRIPE_FIXED = 0.3

export function getTodayDateString(reference = new Date()) {
  return reference.toISOString().slice(0, 10)
}

export function computeDailyRevenue(
  orders: DashboardOrder[],
  date = getTodayDateString()
) {
  return orders
    .filter((o) => o.startTime.startsWith(date))
    .reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0)
}

export function computePeriodRevenue(
  orders: DashboardOrder[],
  dates: string[]
) {
  const set = new Set(dates)
  return orders
    .filter((o) => set.has(o.startTime.slice(0, 10)))
    .reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0)
}

export function computeStripeFees(revenue: number, transactionCount: number) {
  if (transactionCount === 0) return 0
  return revenue * STRIPE_PERCENT + transactionCount * STRIPE_FIXED
}

export function computeDailyCellularCost(kioskCount: number) {
  return (CELLULAR_COST_PER_KIOSK_MONTH * kioskCount) / 30
}

export function computeCostsForPeriod(
  orders: DashboardOrder[],
  dates: string[],
  kioskCount: number
) {
  const dateSet = new Set(dates)
  const periodOrders = orders.filter((o) =>
    dateSet.has(o.startTime.slice(0, 10))
  )
  const revenue = periodOrders.reduce(
    (sum, o) => sum + parseFloat(o.amount || "0"),
    0
  )
  const days = dates.length || 1
  const cellular = computeDailyCellularCost(kioskCount) * days
  const stripe = computeStripeFees(revenue, periodOrders.length)

  return {
    revenue,
    cellular,
    stripe,
    total: cellular + stripe,
    transactionCount: periodOrders.length,
  }
}
