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
import { getOrderList } from "@/lib/api-client"

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
  const response = await getOrderList()
  const orders = (response as any).data || []

  const activeOrders = orders.filter((o: any) => o.status === "renting").length
  const completedOrders = orders.filter((o: any) => o.status === "completed").length
  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + parseFloat(o.amount || "0"),
    0
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage rental orders
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{activeOrders}</strong> active
          </span>
          <span>
            <strong className="text-foreground">{completedOrders}</strong>{" "}
            completed
          </span>
          <span>
            <strong className="text-foreground">
              ¥{totalRevenue.toFixed(2)}
            </strong>{" "}
            revenue
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            All Orders
          </CardTitle>
          <CardDescription>
            {orders.length} total orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-mono text-xs">
                    {order.orderId}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {order.shopName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.deviceId}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    #{order.slotNum}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.batteryId}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(order.startTime)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getDuration(
                      order.startTime,
                      "endTime" in order ? order.endTime : undefined
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ¥{order.amount}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

