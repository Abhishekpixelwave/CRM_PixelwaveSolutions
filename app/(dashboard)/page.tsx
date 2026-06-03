import Link from "next/link"
import {
  HardDrive,
  Store,
  ShoppingCart,
  Battery,
  Wifi,
  WifiOff,
  TrendingUp,
  HandCoins,
  ArrowRight,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getOpenDeviceList,
  getOrderList,
  getShopList,
  getAllDevicePage,
  type OpenDeviceListItem,
} from "@/lib/api-client"
import { getApiToken } from "@/lib/get-api-token"
import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { ShareRevenueButton } from "@/components/share-revenue-button"
import { fetchRevenueShareAction } from "@/app/(dashboard)/revenue-share/actions"
import {
  buildDashboardAnalytics,
  enrichOrdersForDemo,
  type DashboardCabinet,
  type DashboardOrder,
  type DashboardShop,
} from "@/lib/dashboard-analytics"
import { computeDailyRevenue } from "@/lib/dashboard-costs"

export default async function OverviewPage() {
  const token = await getApiToken()
  const [deviceResponse, shopResponse, orderResponse, cabinetResponse] =
    await Promise.all([
      getOpenDeviceList({}, token),
      getShopList(token),
      getOrderList({}, token),
      getAllDevicePage({}, token),
    ])

  const devices = (deviceResponse as { list?: OpenDeviceListItem[] }).list || []
  const shops = ((shopResponse as { data?: DashboardShop[] }).data ||
    []) as DashboardShop[]
  const orders = enrichOrdersForDemo(
    ((orderResponse as { data?: DashboardOrder[] }).data ||
      []) as DashboardOrder[],
    shops
  )
  const cabinets = (
    (cabinetResponse as { data?: { list?: DashboardCabinet[] } }).data?.list ||
    []
  ) as DashboardCabinet[]

  const analytics = buildDashboardAnalytics(shops, cabinets, orders)
  const revenueShare = await fetchRevenueShareAction()

  const onlineDevices = devices.filter(
    (d) => d.cabinet.infoStatus === "1"
  ).length
  const offlineDevices = devices.length - onlineDevices
  const activeRentals = orders.filter((o) => o.status === "renting").length
  const dailyRevenue = computeDailyRevenue(orders)
  const totalBatteries = devices.reduce(
    (sum, d) => sum + parseInt(d.cabinet.batteryNum),
    0
  )
  const availableBatteries = devices.reduce(
    (sum, d) => sum + parseInt(d.cabinet.freeNum),
    0
  )
  const availabilityPercent =
    totalBatteries > 0 ? (availableBatteries / totalBatteries) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor your Boost charging network at a glance
          </p>
        </div>
        <ShareRevenueButton pendingAmount={revenueShare.summary.totalPending} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Kiosks
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cabinets.length}</div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Wifi className="h-3 w-3" /> {onlineDevices} online
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <WifiOff className="h-3 w-3" /> {offlineDevices} offline
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Venues
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shops.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {shops.filter((s) => s.businessStatus === 1).length} open,{" "}
              {shops.filter((s) => s.businessStatus !== 1).length} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Rentals
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {orders.length} total rentals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Daily Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dailyRevenue.toFixed(2)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Today&apos;s rental revenue</p>
          </CardContent>
        </Card>
      </div>

      <Link href="/revenue-share">
        <Card className="transition-colors hover:border-boost/40 hover:bg-boost/5">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-boost/15">
                <HandCoins className="h-5 w-5 text-boost" />
              </div>
              <div>
                <p className="font-medium">Share revenue with clients</p>
                <p className="text-sm text-muted-foreground">
                  ${revenueShare.summary.totalPending.toFixed(2)} pending ·{" "}
                  {revenueShare.summary.totalPartnerShare.toFixed(2)} shared with partners
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-boost">
              Manage payouts <ArrowRight className="h-4 w-4" />
            </span>
          </CardContent>
        </Card>
      </Link>

      <OverviewCharts analytics={analytics} kioskCount={cabinets.length} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Battery className="h-4 w-4" />
              Available Batteries
            </CardTitle>
            <CardDescription>
              Charger availability across all kiosks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">
                  {availableBatteries} / {totalBatteries}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-boost transition-all"
                  style={{ width: `${availabilityPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {availabilityPercent.toFixed(0)}% available for rent
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {devices.map((device) => (
                <div
                  key={device.shop.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        device.cabinet.infoStatus === "1"
                          ? "bg-boost"
                          : "bg-destructive"
                      }`}
                    />
                    <span className="truncate text-xs">
                      {device.shop.shopName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {device.cabinet.freeNum}/{device.cabinet.batteryNum}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Recent Rentals
            </CardTitle>
            <CardDescription>Latest rental activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rental ID</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 8).map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-mono text-xs">
                      {order.orderId}
                    </TableCell>
                    <TableCell className="text-sm">{order.shopName}</TableCell>
                    <TableCell className="text-sm">${order.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "renting" ? "default" : "secondary"
                        }
                        className={
                          order.status === "renting"
                            ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                            : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                        }
                      >
                        {order.status === "renting" ? "Renting" : "Completed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
