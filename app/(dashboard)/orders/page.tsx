import { ShoppingCart } from "lucide-react"
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
import { getOrderList, getShopList } from "@/lib/api-client"
import { getApiToken } from "@/lib/get-api-token"
import { ShareRevenueButton } from "@/components/share-revenue-button"
import { fetchRevenueShareAction } from "@/app/(dashboard)/revenue-share/actions"
import { RentalCharts } from "@/components/rentals/rental-charts"
import { enrichOrdersForDemo, type DashboardOrder, type DashboardShop } from "@/lib/dashboard-analytics"
import {
  CreateRentOrderDialog,
  OrderDetailDialog,
  CloseOrderButton,
} from "./order-dialogs"

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getDuration(start: string, end?: string) {
  if (!start) return "N/A"
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : new Date()
  const diffMs = endDate.getTime() - startDate.getTime()
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

export default async function OrdersPage() {
  const token = await getApiToken()
  const [response, shopRes, revenueShare] = await Promise.all([
    getOrderList({}, token),
    getShopList(token),
    fetchRevenueShareAction(),
  ])
  const shops = ((shopRes as { data?: DashboardShop[] }).data || []) as DashboardShop[]
  const orders = enrichOrdersForDemo(
    ((response as { data?: DashboardOrder[] }).data || []) as DashboardOrder[],
    shops
  )

  const activeRentals = orders.filter((o) => o.status === "renting").length
  const completedRentals = orders.filter((o) => o.status === "completed").length
  const totalRevenue = orders.reduce(
    (sum, o) => sum + parseFloat(String(o.amount || "0")),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Rentals
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage kiosk rentals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{activeRentals}</strong> active
            </span>
            <span>
              <strong className="text-foreground">{completedRentals}</strong>{" "}
              completed
            </span>
            <span>
              <strong className="text-foreground">
                ${totalRevenue.toFixed(2)}
              </strong>{" "}
              revenue
            </span>
          </div>
          <ShareRevenueButton
            size="sm"
            pendingAmount={revenueShare.summary.totalPending}
          />
          <CreateRentOrderDialog />
        </div>
      </div>

      <RentalCharts orders={orders} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            All Rentals
          </CardTitle>
          <CardDescription>{orders.length} total rentals</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rental ID</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Kiosk</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-mono text-xs">
                    {order.orderId}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {order.shopName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {(order as DashboardOrder & { deviceId?: string }).deviceId || "—"}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    #{(order as DashboardOrder & { slotNum?: number }).slotNum ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {(order as DashboardOrder & { batteryId?: string }).batteryId || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(order.startTime)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getDuration(
                      order.startTime,
                      (order as DashboardOrder & { endTime?: string }).endTime
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ${order.amount}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        order.status === "renting"
                          ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                          : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                      }
                    >
                      {order.status === "renting" ? "Renting" : "Completed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <OrderDetailDialog
                        orderId={order.orderId}
                        deviceId={(order as DashboardOrder & { deviceId?: string }).deviceId || ""}
                      />
                      {order.status === "renting" && (
                        <CloseOrderButton orderId={order.orderId} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No rentals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
