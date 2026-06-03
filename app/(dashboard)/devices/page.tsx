import {
  HardDrive,
  Wifi,
  WifiOff,
  Battery,
  Store,
  Signal,
  Monitor,
  AlertTriangle,
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
import { getAllDevicePage, getOpenDeviceList, getShopList } from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import {
  deriveSlotStatuses,
  estimateBrokenSlots,
  KioskHealthBadge,
  KioskSlotGrid,
} from "@/components/devices/kiosk-slot-grid";
import {
  DeviceOperationDialog,
  EjectRepairDialog,
  EjectRentDialog,
  BindDeviceDialog,
  UnbindDeviceButton,
  DeviceDetailDialog,
  CabinetAdDialog,
} from "./device-dialogs";

export default async function DevicesPage() {
  const token = await getApiToken();
  const [cabinetRes, shopRes, openDeviceRes] = await Promise.all([
    getAllDevicePage({}, token),
    getShopList(token),
    getOpenDeviceList({}, token),
  ]);

  const openDevices =
    (openDeviceRes as { list?: Array<Record<string, unknown>> }).list || [];

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
  const totalAvailable = cabinets.reduce(
    (sum, c) => sum + ((c.emptySlots as number) || 0),
    0
  );

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Kiosks
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage kiosks &amp; slot health — {cabinets.length} kiosks,{" "}
            {totalAvailable} slots available
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kiosks Online
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
              Slots Available
            </CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAvailable}
              <span className="text-sm font-normal text-muted-foreground">
                /{totalSlots}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{totalBusy} in use</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Linked Venues
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4" />
            All Kiosks
          </CardTitle>
          <CardDescription>
            Slot map per machine — green available, amber in use, red broken
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kiosk ID</TableHead>
                  <TableHead>Linked Venue</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Slot map</TableHead>
                  <TableHead className="text-center">Used / Avail</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[280px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cabinets.map((cab) => {
                  const slots = (cab.slots as number) || 0;
                  const busy = (cab.busySlots as number) || 0;
                  const empty = (cab.emptySlots as number) || 0;
                  const broken = estimateBrokenSlots(cab);
                  const slotStatuses = deriveSlotStatuses(slots, busy, broken);
                  const online = cab.online === true;
                  const weakSignal = cab.signal === "weak";

                  return (
                    <TableRow key={cab.cabinetId as string}>
                      <TableCell className="font-mono text-xs font-medium">
                        {cab.cabinetId as string}
                      </TableCell>
                      <TableCell className="text-sm">
                        {(cab.shopName as string) || (
                          <span className="italic text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {cab.type as string}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <KioskSlotGrid slots={slotStatuses} />
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <span className="text-amber-600 dark:text-amber-400">
                          {busy}
                        </span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {empty}
                        </span>
                      </TableCell>
                      <TableCell>
                        <KioskHealthBadge
                          online={online}
                          brokenSlots={broken}
                          weakSignal={weakSignal}
                        />
                        {!online && (
                          <AlertTriangle className="mt-0.5 h-3 w-3 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            online
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {online ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <DeviceDetailDialog
                            cabinetId={cab.cabinetId as string}
                          />
                          <DeviceOperationDialog
                            cabinetId={cab.cabinetId as string}
                          />
                          <EjectRepairDialog
                            cabinetId={cab.cabinetId as string}
                          />
                          <EjectRentDialog
                            cabinetId={cab.cabinetId as string}
                          />
                          <CabinetAdDialog
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
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          View · Ops · Repair · Rent · Ad · Bind · Unbind
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {cabinets.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No kiosks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open API Kiosk List</CardTitle>
          <CardDescription>
            Nearby kiosks from consumer app API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Batteries</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openDevices.map((item, idx) => {
                  const shop = item.shop as Record<string, unknown> | undefined;
                  const cabinet = item.cabinet as Record<string, unknown> | undefined;
                  return (
                    <TableRow key={(shop?.id as string) || idx}>
                      <TableCell className="font-medium">
                        {(shop?.shopName as string) || "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {(shop?.shopAddress as string) || "—"}
                      </TableCell>
                      <TableCell>{cabinet?.batteryNum as string}</TableCell>
                      <TableCell>{cabinet?.freeNum as string}</TableCell>
                      <TableCell>{(shop?.distance as string) || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            cabinet?.infoStatus === "1"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {cabinet?.infoStatus === "1" ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {openDevices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No Open API kiosks returned.
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
