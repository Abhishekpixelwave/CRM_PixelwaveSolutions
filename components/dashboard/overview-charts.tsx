"use client"

import { useMemo, useState } from "react"
import { Receipt, Signal, CreditCard } from "lucide-react"

import { LimeLineChart } from "@/components/charts/lime-line-chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildWeeklyMetrics,
  type DashboardAnalytics,
  type LocationFilter,
  type PeriodRange,
} from "@/lib/dashboard-analytics"
import { computeCostsForPeriod } from "@/lib/dashboard-costs"
import { stateToRegion } from "@/lib/shop-location"
import { HardDrive, ShoppingCart, TrendingUp } from "lucide-react"

export function OverviewCharts({
  analytics,
  kioskCount,
}: {
  analytics: DashboardAnalytics
  kioskCount: number
}) {
  const [filter, setFilter] = useState<LocationFilter>({
    region: "all",
    state: "all",
  })
  const [period, setPeriod] = useState<PeriodRange>("7d")

  const metrics = useMemo(
    () =>
      buildWeeklyMetrics(
        analytics.cabinets,
        analytics.shops,
        analytics.orders,
        filter,
        new Date(),
        period
      ),
    [analytics, filter, period]
  )

  const costs = useMemo(
    () =>
      computeCostsForPeriod(
        analytics.orders,
        metrics.periodDates,
        kioskCount
      ),
    [analytics.orders, metrics.periodDates, kioskCount]
  )

  const availableStates = useMemo(() => {
    if (filter.region === "all") return analytics.states
    return analytics.states.filter(
      (s) => stateToRegion(s) === filter.region
    )
  }, [analytics.states, filter.region])

  const periodRevenueTotal = metrics.revenue.reduce((s, d) => s + d.value, 0)
  const periodRentalsTotal = metrics.rentals.reduce((s, d) => s + d.value, 0)
  const periodLabel = period === "wtd" ? "Week to date" : "Past 7 days"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold">Network Analytics</h2>
          <p className="text-sm text-muted-foreground">
            {periodLabel} — filter by region or state
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as PeriodRange)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Past 7 days</SelectItem>
              <SelectItem value="wtd">Week to date</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filter.region}
            onValueChange={(region) =>
              setFilter((f) => ({ ...f, region, state: "all" }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {analytics.regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filter.state}
            onValueChange={(state) => setFilter((f) => ({ ...f, state }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {availableStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4 text-boost" />
              Kiosks
            </CardTitle>
            <CardDescription>
              {metrics.machineTotal} total in selected area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LimeLineChart data={metrics.machines} height={220} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-boost" />
              Daily Revenue
            </CardTitle>
            <CardDescription>
              ${periodRevenueTotal.toFixed(2)} {period === "wtd" ? "WTD" : "this week"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LimeLineChart
              data={metrics.revenue}
              valuePrefix="$"
              height={220}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4 text-boost" />
              Daily Rentals
            </CardTitle>
            <CardDescription>
              {periodRentalsTotal} rentals {period === "wtd" ? "WTD" : "this week"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LimeLineChart data={metrics.rentals} height={220} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-boost" />
            Costs
          </CardTitle>
          <CardDescription>
            Operating costs for {periodLabel.toLowerCase()} ({metrics.periodDates.length}{" "}
            {metrics.periodDates.length === 1 ? "day" : "days"})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Signal className="h-4 w-4" />
                Cellular ($20 / kiosk / mo)
              </div>
              <p className="mt-2 text-2xl font-bold">${costs.cellular.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {kioskCount} kiosks · prorated daily
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Stripe fees
              </div>
              <p className="mt-2 text-2xl font-bold">${costs.stripe.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                2.9% + $0.30 · {costs.transactionCount} transactions
              </p>
            </div>
            <div className="rounded-lg border border-boost/20 bg-boost/5 p-4">
              <div className="text-sm text-muted-foreground">Total costs</div>
              <p className="mt-2 text-2xl font-bold">${costs.total.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                Net after costs: ${(costs.revenue - costs.total).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
