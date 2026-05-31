"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Unplug, Link2, Wrench, Loader2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  deviceOperationAction,
  ejectByRepairAction,
  bindDeviceAction,
  unbindDeviceAction,
} from "./actions";

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
                  <div className="flex items-center gap-2"><RotateCcw className="h-3 w-3" /> Restart</div>
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
export function UnbindDeviceButton({
  cabinetId,
}: {
  cabinetId: string;
}) {
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
