"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Banknote, Loader2, Plus, HandCoins } from "lucide-react";

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
import type { RevenueSharePartner } from "@/lib/revenue-share";
import {
  updateSharePercentAction,
  updatePartnerDetailsAction,
  payoutPartnerAction,
  createPartnerAction,
  payAllPendingAction,
} from "./actions";

export function EditShareDialog({
  partner,
}: {
  partner: RevenueSharePartner;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateSharePercentAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="Edit share %">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revenue Share</DialogTitle>
          <DialogDescription>
            Set partner share for {partner.shopName}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={partner.id} />
          <div className="space-y-2">
            <Label htmlFor="sharePercent">Partner share (%)</Label>
            <Input
              id="sharePercent"
              name="sharePercent"
              type="number"
              min={0}
              max={100}
              defaultValue={partner.sharePercent}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your client receives this % of location revenue. Boost keeps the rest.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditPartnerDialog({
  partner,
}: {
  partner: RevenueSharePartner;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updatePartnerDetailsAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Client details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={partner.id} />
          <div className="space-y-2">
            <Label htmlFor="clientName">Client name</Label>
            <Input id="clientName" name="clientName" defaultValue={partner.clientName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input id="clientEmail" name="clientEmail" type="email" defaultValue={partner.clientEmail} required />
          </div>
          <div className="space-y-2">
            <Label>Payout method</Label>
            <Select name="payoutMethod" defaultValue={partner.payoutMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ach">ACH</SelectItem>
                <SelectItem value="wire">Wire</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PayoutDialog({
  partnerId,
  clientName,
  pendingAmount,
}: {
  partnerId: string;
  clientName: string;
  pendingAmount: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await payoutPartnerAction(formData);
        setOpen(false);
        router.refresh();
      } catch {
        // keep dialog open on failure
      }
    });
  }

  if (pendingAmount <= 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-boost text-boost-foreground hover:bg-boost-hover">
          <Banknote className="mr-1.5 h-3.5 w-3.5" />
          Pay ${pendingAmount.toFixed(2)}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Revenue Share</DialogTitle>
          <DialogDescription>
            Pay out partner share to <strong>{clientName}</strong> from the portal.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
          className="space-y-4"
        >
          <input type="hidden" name="partnerId" value={partnerId} />
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min={0.01}
              defaultValue={pendingAmount.toFixed(2)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" name="note" placeholder="June revenue share payout" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                "Confirm payout"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddPartnerDialog({
  shops,
}: {
  shops: Array<{ newID: string; shopName: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedShop, setSelectedShop] = useState(shops[0]?.newID ?? "");
  const router = useRouter();

  const shop = shops.find((s) => s.newID === selectedShop);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createPartnerAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  if (shops.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share revenue with a client</DialogTitle>
          <DialogDescription>
            Link a shop location to a client and set their revenue share percentage.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="shopId" value={shop?.newID ?? ""} />
          <input type="hidden" name="shopName" value={shop?.shopName ?? ""} />
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
              <SelectContent>
                {shops.map((s) => (
                  <SelectItem key={s.newID} value={s.newID}>
                    {s.shopName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientName">Client / business name *</Label>
            <Input id="clientName" name="clientName" required placeholder="Acme Retail LLC" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Payout email *</Label>
            <Input id="clientEmail" name="clientEmail" type="email" required placeholder="billing@client.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newSharePercent">Revenue share (%)</Label>
            <Input
              id="newSharePercent"
              name="sharePercent"
              type="number"
              min={1}
              max={99}
              defaultValue={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              Percent of rental revenue paid to this client. You keep the remainder.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Payout method</Label>
            <Select name="payoutMethod" defaultValue="ach">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ach">ACH bank transfer</SelectItem>
                <SelectItem value="wire">Wire transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !shop}>
              {isPending ? "Adding…" : "Add & start sharing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PayAllPendingButton({
  pendingTotal,
  partnerCount,
}: {
  pendingTotal: number;
  partnerCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handlePayAll() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await payAllPendingAction();
        if (!result.success) {
          setError("Could not process payouts. Try again.");
          return;
        }
        router.refresh();
      } catch {
        setError("Could not process payouts. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handlePayAll}
        disabled={isPending || pendingTotal <= 0}
        className="bg-boost text-boost-foreground hover:bg-boost-hover disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <HandCoins className="mr-1.5 h-4 w-4" />
        )}
        {pendingTotal > 0
          ? `Share revenue ($${pendingTotal.toFixed(2)})`
          : "Share revenue"}
        {partnerCount > 1 && pendingTotal > 0 && (
          <span className="ml-1 text-xs opacity-80">· {partnerCount} clients</span>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
