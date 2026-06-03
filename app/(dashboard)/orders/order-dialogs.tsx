"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  CheckCircle,
  RefreshCw,
  BatteryCharging,
  Loader2,
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
  fetchOrderDetailAction,
  queryRentOrderStatusAction,
  markOrderCompletedAction,
  createRentOrderAction,
  ejectByRentOrderAction,
  fetchRentCallbackAction,
} from "./actions";

const STATUS_MAP: Record<number, string> = {
  0: "Pending",
  1: "Under lease",
  2: "Returned",
  3: "Closed",
};

const RENT_CALLBACK_MAP: Record<number, string> = {
  0: "Rent failed",
  1: "Rent success",
  2: "Return success",
};

// ─── Create Rent Order ───────────────────────────────────────────────
export function CreateRentOrderDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState("/api/webhooks/rent-callback");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCallbackUrl(`${window.location.origin}/api/webhooks/rent-callback`);
    }
  }, []);

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const res = (await createRentOrderAction(formData)) as {
        data?: { tradeNo?: string };
      };
      setResult(res?.data?.tradeNo || "Order created");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Rent Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Rent Order</DialogTitle>
          <DialogDescription>
            Create a new rental order via the Open API.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cr-deviceId">Device ID *</Label>
            <Input
              id="cr-deviceId"
              name="deviceId"
              required
              placeholder="BJH02347"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cr-callback">Callback URL *</Label>
            <Input
              id="cr-callback"
              name="callbackURL"
              required
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              placeholder="https://your-app.com/api/webhooks/rent-callback"
            />
            <p className="text-xs text-muted-foreground">
              Bajie POSTs rent status here. View received callbacks in Settings → Event Log.
            </p>
          </div>
          {result && (
            <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              Created: <strong>{result}</strong>
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Order Detail Dialog ─────────────────────────────────────────────
export function OrderDetailDialog({
  orderId,
  deviceId,
}: {
  orderId: string;
  deviceId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [statusResult, setStatusResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setStatusResult(null);
    fetchOrderDetailAction(orderId)
      .then((res) => {
        const data = (res as { data?: Record<string, unknown> }).data;
        setDetail(data || null);
      })
      .finally(() => setLoading(false));
  }, [open, orderId]);

  function handleCloseOrder() {
    startTransition(async () => {
      await markOrderCompletedAction(orderId);
      setOpen(false);
      router.refresh();
    });
  }

  function handleQueryStatus() {
    startTransition(async () => {
      const [queryRes, callbackRes] = await Promise.all([
        queryRentOrderStatusAction(orderId),
        fetchRentCallbackAction(orderId),
      ]);
      const res = queryRes as { data?: { status?: number } };
      const status = res?.data?.status;
      const callbackLabel =
        callbackRes &&
        RENT_CALLBACK_MAP[callbackRes.status] !== undefined
          ? ` (callback: ${RENT_CALLBACK_MAP[callbackRes.status]})`
          : "";
      setStatusResult(
        status !== undefined
          ? `${STATUS_MAP[status] || `Status ${status}`}${callbackLabel}`
          : "Unknown"
      );
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="View order detail">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Order Detail</DialogTitle>
          <DialogDescription>
            Open API detail for <strong>{orderId}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : detail ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Cabinet</span>
              <p className="font-mono text-xs">{detail.cabinetId as string}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Battery</span>
              <p className="font-mono text-xs">{detail.batteryId as string}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Borrow Slot</span>
              <p>#{detail.borrowSlot as number}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary">
                {STATUS_MAP[detail.borrowStatus as number] ||
                  String(detail.borrowStatus ?? "Unknown")}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Amount</span>
              <p>
                {detail.currency as string} {detail.orderAmount as number}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Deposit</span>
              <p>{detail.deposit as number}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Borrow Time</span>
              <p className="text-xs">{detail.borrowTime as string}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Return Time</span>
              <p className="text-xs">{(detail.returnTime as string) || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Free Minutes</span>
              <p>{detail.freeMinutes as number}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Daily Max</span>
              <p>{detail.dailyMaxPrice as number}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No Open API detail found for this order ID. Use trade number from rent API.
          </p>
        )}

        {statusResult && (
          <p className="mt-2 text-sm text-muted-foreground">
            Query status: <strong>{statusResult}</strong>
          </p>
        )}

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleQueryStatus}
              disabled={isPending}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Query Status
            </Button>
            {deviceId && (
              <EjectRentFromOrderButton
                orderId={orderId}
                deviceId={deviceId}
                slotNum={Number(detail?.borrowSlot) || 1}
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCloseOrder}
              disabled={isPending}
            >
              <CheckCircle className="mr-1 h-3.5 w-3.5" />
              Close Order
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Eject Rent from Order ───────────────────────────────────────────
function EjectRentFromOrderButton({
  orderId,
  deviceId,
  slotNum,
}: {
  orderId: string;
  deviceId: string;
  slotNum: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await ejectByRentOrderAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <BatteryCharging className="mr-1 h-3.5 w-3.5" />
          Eject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eject Battery (Rent)</DialogTitle>
          <DialogDescription>
            Eject battery for order <strong>{orderId}</strong>
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="cabinetid" value={deviceId} />
          <input type="hidden" name="rentOrderId" value={orderId} />
          <div className="space-y-2">
            <Label htmlFor="oe-slot">Slot Number</Label>
            <Input
              id="oe-slot"
              name="slotNum"
              type="number"
              min={1}
              defaultValue={slotNum}
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
                "Eject Battery"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Close Order Button (inline) ─────────────────────────────────────
export function CloseOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClose() {
    startTransition(async () => {
      await markOrderCompletedAction(orderId);
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
          className="text-emerald-600 hover:text-emerald-600"
          title="Close order"
        >
          <CheckCircle className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close Order</DialogTitle>
          <DialogDescription>
            Mark order <strong>{orderId}</strong> as completed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleClose} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Closing...
              </>
            ) : (
              "Close Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
