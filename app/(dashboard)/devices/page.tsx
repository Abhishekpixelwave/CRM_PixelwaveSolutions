import {
  HardDrive,
  Wifi,
  WifiOff,
  Battery,
  Store,
  Signal,
  Monitor,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllDevicePage, getShopList } from "@/lib/api-client";
import {
  DeviceOperationDialog,
  EjectRepairDialog,
  BindDeviceDialog,
  UnbindDeviceButton,
} from "./device-dialogs";

export default async function DevicesPage() {
  const [cabinetRes, shopRes] = await Promise.all([
    getAllDevicePage(),
    getShopList(),
  ]);

  const cabinets =
    (cabinetRes as { data: { list: Array<Record<string, unknown>> } }).data
      ?.list || [];
  const shops =
    (shopRes as { data: Array<{ newID: string; shopName: string }> }).data || [];

  const onlineCount = cabinets.filter((c) => c.online === true).length;
  const offlineCount = cabinets.length - onlineCount;
  const totalSlots = cabinets.reduce(
    (sum, c) => sum + ((c.slots as number) || 0),
    0
  );
  const totalBusy = cabinets.reduce(
    (sum, c) => sum + ((c.busySlots as number) || 0),
    0
  );

  return (
    <div className="min-w-0 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Devices
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage cabinets &amp; device operations — {cabinets.length} devices,{" "}
            {totalSlots} total slots
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
            {onlineCount} online
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5 text-destructive" />
            {offlineCount} offline
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Devices
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cabinets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Online
            </CardTitle>
            <Wifi className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {onlineCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Slots In Use
            </CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBusy}
              <span className="text-sm font-normal text-muted-foreground">
                /{totalSlots}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Linked Shops
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(cabinets.map((c) => c.shopId).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4" />
            All Cabinets
          </CardTitle>
          <CardDescription>
            Full device management with operations, binding, and slot info
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cabinet ID</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Slots</TableHead>
                  <TableHead className="text-center">Busy / Empty</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cabinets.map((cab) => (
                  <TableRow key={cab.cabinetId as string}>
                    <TableCell className="font-mono text-xs font-medium">
                      {cab.cabinetId as string}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(cab.shopName as string) || (
                        <span className="text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {cab.type as string}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {cab.slots as number}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <span className="text-amber-600 dark:text-amber-400">
                          {cab.busySlots as number}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {cab.emptySlots as number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {cab.ip as string}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Signal
                          className={`h-3 w-3 ${
                            cab.signal === "strong"
                              ? "text-emerald-500"
                              : cab.signal === "medium"
                                ? "text-amber-500"
                                : "text-destructive"
                          }`}
                        />
                        <span className="capitalize text-muted-foreground">
                          {cab.signal as string}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          cab.online
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                        }
                      >
                        <span
                          className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                            cab.online ? "bg-emerald-500" : "bg-destructive"
                          }`}
                        />
                        {cab.online ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="max-w-[120px] truncate text-xs text-muted-foreground"
                      title={cab.remark as string}
                    >
                      {(cab.remark as string) || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <DeviceOperationDialog
                          cabinetId={cab.cabinetId as string}
                        />
                        <EjectRepairDialog
                          cabinetId={cab.cabinetId as string}
                        />
                        <BindDeviceDialog
                          cabinetId={cab.cabinetId as string}
                          shops={shops}
                        />
                        <UnbindDeviceButton
                          cabinetId={cab.cabinetId as string}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {cabinets.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No devices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
