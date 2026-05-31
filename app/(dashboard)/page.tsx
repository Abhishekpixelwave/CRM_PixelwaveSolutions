import {
  HardDrive,
  Store,
  ShoppingCart,
  Battery,
  Wifi,
  WifiOff,
  TrendingUp,
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
  type OpenDeviceListItem,
} from "@/lib/api-client"

export default async function OverviewPage() {
  const [deviceResponse, shopResponse, orderResponse] = await Promise.all([
    getOpenDeviceList(),
    getShopList(),
    getOrderList(),
  ])

  const devices = (deviceResponse as { list?: OpenDeviceListItem[] }).list || []
  const shops =
    (shopResponse as { data?: Array<{ businessStatus?: number }> }).data || []
  const orders =
    (
      orderResponse as {
        data?: Array<{
          orderId: string
          shopName: string
          amount: string
          status: string
        }>
      }
    ).data || []

  const onlineDevices = devices.filter(
    (d) => d.cabinet.infoStatus === "1"
  ).length
  const offlineDevices = devices.length - onlineDevices
  const activeOrders = orders.filter((o) => o.status === "renting").length
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.amount), 0)
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
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor your Boost charging network at a glance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Devices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Devices
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
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

        {/* Total Shops */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Shops
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

        {/* Active Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {orders.length} total orders
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalRevenue.toFixed(2)}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              From {orders.length} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Battery Overview + Recent Orders */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Battery Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Battery className="h-4 w-4" />
              Battery Status
            </CardTitle>
            <CardDescription>
              Overall battery availability across all devices
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
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${availabilityPercent}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {availabilityPercent.toFixed(0)}% available for rent
              </p>
            </div>

            {/* Per-device breakdown */}
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
                          ? "bg-emerald-500"
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

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest rental orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-mono text-xs">
                      {order.orderId}
                    </TableCell>
                    <TableCell className="text-sm">{order.shopName}</TableCell>
                    <TableCell className="text-sm">¥{order.amount}</TableCell>
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
