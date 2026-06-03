"use client"

import { useMemo } from "react"
import { ShoppingCart, TrendingUp } from "lucide-react"

import { LimeLineChart } from "@/components/charts/lime-line-chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  buildWeeklyMetrics,
  type DashboardOrder,
  type PeriodRange,
} from "@/lib/dashboard-analytics"

export function RentalCharts({ orders }: { orders: DashboardOrder[] }) {
  const daily = useMemo(() => {
    const emptyShops: never[] = []
    const emptyCabinets: never[] = []
    return buildWeeklyMetrics(
      emptyCabinets,
      emptyShops,
      orders,
      { region: "all", state: "all" },
      new Date(),
      "7d" as PeriodRange
    )
  }, [orders])

  const weekly = useMemo(() => {
    const byWeek = new Map<string, number>()
    for (const order of orders) {
      const d = new Date(order.startTime)
      const weekStart = new Date(d)
      const day = weekStart.getDay()
      weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1))
      const key = weekStart.toISOString().slice(0, 10)
      byWeek.set(key, (byWeek.get(key) || 0) + 1)
    }
    const sorted = [...byWeek.entries()].sort(([a], [b]) => a.localeCompare(b))
    return sorted.slice(-4).map(([date, value]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value,
    }))
  }, [orders])

  const dailyTotal = daily.rentals.reduce((s, d) => s + d.value, 0)
  const weeklyTotal = weekly.reduce((s, d) => s + d.value, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4 text-boost" />
            Daily rentals
          </CardTitle>
          <CardDescription>{dailyTotal} rentals past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <LimeLineChart data={daily.rentals} height={220} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-boost" />
            Weekly rentals
          </CardTitle>
          <CardDescription>{weeklyTotal} rentals last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <LimeLineChart data={weekly} height={220} />
        </CardContent>
      </Card>
    </div>
  )
}
