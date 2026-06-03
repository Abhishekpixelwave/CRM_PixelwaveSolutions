"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Unplug,
  Link2,
  Wrench,
  Loader2,
  Zap,
  Eye,
  BatteryCharging,
  Megaphone,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deviceOperationAction,
  ejectByRepairAction,
  bindDeviceAction,
  unbindDeviceAction,
  fetchDeviceDetailAction,
  ejectByRentAction,
  updateCabinetAdAction,
  publishCabinetAdAction,
} from "./actions";
import {
  CABINET_SCREEN_POSITIONS,
  type CabinetScreenPosition,
} from "@/lib/cabinet-screen-ads";
import { CabinetScreenPreview } from "@/components/ads/cabinet-screen-preview";

// ─── Device Operation Dialog ─────────────────────────────────────────
export function DeviceOperationDialog({ cabinetId }: { cabinetId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await deviceOperationAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="Device operation">
          <Zap className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Device Operation</DialogTitle>
          <DialogDescription>
            Send a command to device <strong>{cabinetId}</strong>
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="cabinetid" value={cabinetId} />
          <div className="space-y-2">
            <Label>Operation Type</Label>
            <Select name="operationType" defaultValue="restart">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restart">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-3 w-3" /> Restart
                  </div>
                </SelectItem>
                <SelectItem value="pop">Pop Battery</SelectItem>
                <SelectItem value="popall">Pop All Batteries</SelectItem>
                <SelectItem value="heartbeat">Heartbeat</SelectItem>
                <SelectItem value="lock">Lock Slot</SelectItem>
                <SelectItem value="unlock">Unlock Slot</SelectItem>
                <SelectItem value="lockStopCharge">Lock &amp; Stop Charge</SelectItem>
                <SelectItem value="report">Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="op-slotNum">Slot Number</Label>
            <Input
              id="op-slotNum"
              name="slotNum"
              type="number"
              min={0}
              defaultValue={0}
              placeholder="0 = all slots"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="op-reason">Reason (optional)</Label>
            <Input id="op-reason" name="reason" placeholder="Lock reason..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send Command"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Eject by Repair Dialog ──────────────────────────────────────────
export function EjectRepairDialog({ cabinetId }: { cabinetId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await ejectByRepairAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="Eject for repair">
          <Wrench className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eject Battery (Repair)</DialogTitle>
          <DialogDescription>
            Eject battery from <strong>{cabinetId}</strong> for repair. Slot 0 = all.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="cabinetid" value={cabinetId} />
          <div className="space-y-2">
            <Label htmlFor="rep-slotNum">Slot Number</Label>
            <Input
              id="rep-slotNum"
              name="slotNum"
              type="number"
              min={0}
              defaultValue={1}
              placeholder="0 = eject all"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Ejecting...
                </>
              ) : (
                "Eject Battery"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Eject by Rent Dialog ────────────────────────────────────────────
export function EjectRentDialog({ cabinetId }: { cabinetId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await ejectByRentAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="Eject for rent">
          <BatteryCharging className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eject Battery (Rent)</DialogTitle>
          <DialogDescription>
            Eject battery from <strong>{cabinetId}</strong> for an active rent order.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="cabinetid" value={cabinetId} />
          <div className="space-y-2">
            <Label htmlFor="rent-orderId">Rent Order ID *</Label>
            <Input
              id="rent-orderId"
              name="rentOrderId"
              required
              placeholder="ORD-20250529-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent-slotNum">Slot Number *</Label>
            <Input
              id="rent-slotNum"
              name="slotNum"
              type="number"
              min={1}
              defaultValue={1}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Ejecting...
                </>
              ) : (
                "Eject for Rent"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bind Device to Shop Dialog ──────────────────────────────────────
export function BindDeviceDialog({
  cabinetId,
  shops,
}: {
  cabinetId: string;
  shops: Array<{ newID: string; shopName: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await bindDeviceAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="Bind to shop">
          <Link2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bind Device to Shop</DialogTitle>
          <DialogDescription>
            Assign <strong>{cabinetId}</strong> to a merchant location.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="qrcode" value={cabinetId} />
          <div className="space-y-2">
            <Label>Select Shop</Label>
            <Select name="newShopId" required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a shop..." />
              </SelectTrigger>
              <SelectContent>
                {shops.map((s) => (
                  <SelectItem key={s.newID} value={s.newID}>
                    {s.shopName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Binding...
                </>
              ) : (
                "Bind Device"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Unbind Device Button ────────────────────────────────────────────
export function UnbindDeviceButton({ cabinetId }: { cabinetId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleUnbind() {
    startTransition(async () => {
      await unbindDeviceAction([cabinetId]);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon-xs"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          title="Unbind from shop"
        >
          <Unplug className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unbind Device</DialogTitle>
          <DialogDescription>
            Remove <strong>{cabinetId}</strong> from its current shop? The device
            will become unassigned.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleUnbind} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Unbinding...
              </>
            ) : (
              "Unbind Device"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Device Detail Dialog ────────────────────────────────────────────
export function DeviceDetailDialog({ cabinetId }: { cabinetId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    detail: unknown;
    slots: unknown;
    batteries: unknown;
    openInfo: unknown;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchDeviceDetailAction(cabinetId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [open, cabinetId]);

  const detail = (data?.detail as { data?: Record<string, unknown> })?.data;
  const openInfo = (data?.openInfo as { data?: Record<string, unknown> })?.data;
  const openShop = openInfo?.shop as Record<string, unknown> | undefined;
  const openCabinet = openInfo?.cabinet as Record<string, unknown> | undefined;
  const openPrice = openInfo?.priceStrategy as Record<string, unknown> | undefined;
  const openBatteries =
    (openInfo?.batteries as Array<Record<string, unknown>>) || [];
  const slots =
    ((data?.slots as { data?: Array<Record<string, unknown>> })?.data) || [];
  const batteries =
    ((data?.batteries as { data?: Array<Record<string, unknown>> })?.data) ||
    [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="View details">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Device Details</DialogTitle>
          <DialogDescription>
            Cabinet <strong>{cabinetId}</strong> — detail, slots &amp; batteries
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="open">Open API</TabsTrigger>
              <TabsTrigger value="slots">Slots ({slots.length})</TabsTrigger>
              <TabsTrigger value="batteries">Batteries ({batteries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-3 pt-4">
              {detail ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Shop</span>
                    <p className="font-medium">{(detail.shopName as string) || "Unassigned"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{detail.type as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IP</span>
                    <p className="font-mono text-xs">{detail.ip as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Signal</span>
                    <p className="capitalize">{detail.signal as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slots</span>
                    <p>
                      {detail.busySlots as number} busy / {detail.emptySlots as number} empty
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className={
                        detail.online
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {detail.online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Remark</span>
                    <p>{(detail.remark as string) || "—"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No detail available.</p>
              )}
            </TabsContent>

            <TabsContent value="open" className="space-y-4 pt-4">
              {openInfo ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Shop</span>
                      <p className="font-medium">{(openShop?.name as string) || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address</span>
                      <p>{(openShop?.address as string) || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cabinet ID</span>
                      <p className="font-mono text-xs">{(openCabinet?.id as string) || cabinetId}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Online</span>
                      <Badge
                        variant="secondary"
                        className={
                          openCabinet?.online
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-destructive/10 text-destructive"
                        }
                      >
                        {openCabinet?.online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Slots</span>
                      <p>
                        {openCabinet?.busySlots as number} busy /{" "}
                        {openCabinet?.emptySlots as number} empty
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price Plan</span>
                      <p>{(openPrice?.name as string) || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate</span>
                      <p>
                        {openPrice?.currencySymbol as string}
                        {openPrice?.price as number} /{" "}
                        {(openPrice?.priceMinute as string) === "1" ? "hr" : "min"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deposit</span>
                      <p>
                        {openPrice?.currencySymbol as string}
                        {(openPrice?.depositAmount as number) ?? (openShop?.deposit as number) ?? "—"}
                      </p>
                    </div>
                  </div>
                  {openBatteries.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Slot</TableHead>
                          <TableHead>Battery ID</TableHead>
                          <TableHead>Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {openBatteries.map((bat) => (
                          <TableRow key={bat.slotNum as number}>
                            <TableCell>#{bat.slotNum as number}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {(bat.batteryId as string) || "Empty"}
                            </TableCell>
                            <TableCell>{bat.vol as number}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No Open API data available for this device.
                </p>
              )}
            </TabsContent>

            <TabsContent value="slots" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Vol</TableHead>
                    <TableHead>Locked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.slotNum as number}>
                      <TableCell>#{slot.slotNum as number}</TableCell>
                      <TableCell className="capitalize">{slot.status as string}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {(slot.batteryId as string) || "—"}
                      </TableCell>
                      <TableCell>{slot.vol as number}%</TableCell>
                      <TableCell>{slot.locked ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                  {slots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No slot data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="batteries" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Battery ID</TableHead>
                    <TableHead>Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batteries.map((bat) => (
                    <TableRow key={bat.slotNum as number}>
                      <TableCell>#{bat.slotNum as number}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {(bat.batteryId as string) || "Empty"}
                      </TableCell>
                      <TableCell>{bat.vol as number}%</TableCell>
                    </TableRow>
                  ))}
                  {batteries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No battery data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Cabinet Ad Dialog ───────────────────────────────────────────────
export function CabinetAdDialog({ cabinetId }: { cabinetId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [mode, setMode] = useState<"bind" | "publish">("publish");
  const [mediaUrl, setMediaUrl] = useState("");
  const [screenPosition, setScreenPosition] =
    useState<CabinetScreenPosition>("0");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (mode === "bind") {
        await updateCabinetAdAction(formData);
      } else {
        await publishCabinetAdAction(formData);
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="Publish screen ad">
          <Megaphone className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Machine screen ad</DialogTitle>
          <DialogDescription>
            Push an ad to the LCD on cabinet <strong>{cabinetId}</strong>
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 sm:grid-cols-2">
          <input type="hidden" name="cabinetIdList" value={cabinetId} />
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === "bind" ? "default" : "outline"}
                onClick={() => setMode("bind")}
              >
                Bind ad
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "publish" ? "default" : "outline"}
                onClick={() => setMode("publish")}
              >
                <Upload className="mr-1 h-3 w-3" /> Publish to screen
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Screen zone *</Label>
              <Select
                name="screenPosition"
                value={screenPosition}
                onValueChange={(v) =>
                  setScreenPosition(v as CabinetScreenPosition)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CABINET_SCREEN_POSITIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cabinet slot count</Label>
              <Select name="slotCount" defaultValue="8">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6-slot</SelectItem>
                  <SelectItem value="8">8-slot</SelectItem>
                  <SelectItem value="12">12-slot</SelectItem>
                  <SelectItem value="48">48-slot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Media type *</Label>
              <Select name="mediaType" defaultValue="image">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="programSheet">Slideshow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-path">Screen media URL *</Label>
              <Input
                id="ad-path"
                name="mediaPath"
                required
                placeholder="https://cdn.example.com/ad.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ad-startDate">Start date</Label>
                <Input id="ad-startDate" name="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-endDate">End date</Label>
                <Input id="ad-endDate" name="endDate" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Restart cabinet after publish</Label>
              <Select name="isRestart" defaultValue="true">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes — refresh screen</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col items-center justify-start pt-2">
            <CabinetScreenPreview
              position={screenPosition}
              mediaUrl={mediaUrl || undefined}
            />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Publishing…
                </>
              ) : mode === "bind" ? (
                "Bind ad"
              ) : (
                "Publish to screen"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
