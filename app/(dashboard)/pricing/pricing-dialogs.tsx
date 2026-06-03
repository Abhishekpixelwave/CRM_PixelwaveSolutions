"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Link2, Unplug, Loader2, Eye } from "lucide-react";

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
import type { PriceStrategyItem } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createOrUpdatePriceStrategyAction,
  deletePriceStrategyAction,
  bindShopPriceStrategyAction,
  unbindShopPriceStrategyAction,
  fetchPriceStrategyDetailAction,
} from "./actions";

// ─── Create / Edit Price Strategy ────────────────────────────────────
export function PriceStrategyFormDialog({
  strategy,
}: {
  strategy?: PriceStrategyItem;
}) {
  const isEdit = !!strategy;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createOrUpdatePriceStrategyAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="icon-xs" variant="ghost" title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Strategy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Price Strategy" : "Create Price Strategy"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update "${strategy.name}"`
              : "Define a new pricing plan for shops."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {isEdit && (
            <input
              type="hidden"
              name="priceId"
              value={strategy.priceId}
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ps-name">Strategy Name *</Label>
              <Input
                id="ps-name"
                name="name"
                required
                defaultValue={strategy?.name}
                placeholder="e.g. Standard Plan"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                name="type"
                defaultValue={String(strategy?.type || 1)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Advanced (per hour)</SelectItem>
                  <SelectItem value="2">Timetable</SelectItem>
                  <SelectItem value="3">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Custom Type</Label>
              <Select
                name="customType"
                defaultValue={String(strategy?.customType || 0)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Universal</SelectItem>
                  <SelectItem value="1">POS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ps-price">Unit Price *</Label>
              <Input
                id="ps-price"
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={strategy?.price}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Billing Unit *</Label>
              <Select
                name="priceUnit"
                defaultValue={String(strategy?.priceUnit || 1)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Minute</SelectItem>
                  <SelectItem value="1">Hour</SelectItem>
                  <SelectItem value="2">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ps-priceTime">Billing Time *</Label>
              <Input
                id="ps-priceTime"
                name="priceTime"
                type="number"
                required
                defaultValue={strategy?.priceTime || 1}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ps-dailyMax">Daily Cap *</Label>
              <Input
                id="ps-dailyMax"
                name="dailyMaxPrice"
                type="number"
                step="0.01"
                required
                defaultValue={strategy?.dailyMaxPrice}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ps-deposit">Deposit Amount *</Label>
              <Input
                id="ps-deposit"
                name="depositAmount"
                type="number"
                step="0.01"
                required
                defaultValue={strategy?.depositAmount}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ps-free">Free Minutes *</Label>
              <Input
                id="ps-free"
                name="freeMinutes"
                type="number"
                required
                defaultValue={strategy?.freeMinutes}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ps-timeout">Overdue Amount *</Label>
              <Input
                id="ps-timeout"
                name="timeoutAmount"
                type="number"
                step="0.01"
                required
                defaultValue={strategy?.timeoutAmount}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ps-timeoutDay">Timeout Days *</Label>
              <Input
                id="ps-timeoutDay"
                name="timeoutDay"
                type="number"
                required
                defaultValue={strategy?.timeoutDay}
              />
            </div>
          </div>
          <input type="hidden" name="isDeposit" value="true" />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{" "}
                  Saving...
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Price Strategy ───────────────────────────────────────────
export function DeletePriceStrategyButton({
  priceId,
  name,
}: {
  priceId: number;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deletePriceStrategyAction(priceId);
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
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Price Strategy</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{name}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{" "}
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bind Shop to Price Strategy ─────────────────────────────────────
export function BindShopDialog({
  priceId,
  strategyName,
  shops,
}: {
  priceId: number;
  strategyName: string;
  shops: Array<{ newID: string; shopName: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await bindShopPriceStrategyAction(formData);
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
          <DialogTitle>Bind Shop</DialogTitle>
          <DialogDescription>
            Assign <strong>{strategyName}</strong> to a shop.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="priceId" value={priceId} />
          <input type="hidden" name="customType" value="0" />
          <div className="space-y-2">
            <Label>Select Shop</Label>
            <Select name="shopId" required>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{" "}
                  Binding...
                </>
              ) : (
                "Bind"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Unbind Shop ─────────────────────────────────────────────────────
export function UnbindShopButton({
  shopId,
  strategyName,
}: {
  shopId: string;
  strategyName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleUnbind(formData: FormData) {
    startTransition(async () => {
      await unbindShopPriceStrategyAction(formData);
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
          <DialogTitle>Unbind Shop</DialogTitle>
          <DialogDescription>
            Remove <strong>{strategyName}</strong> from shop{" "}
            <strong>{shopId}</strong>?
          </DialogDescription>
        </DialogHeader>
        <form action={handleUnbind}>
          <input type="hidden" name="shopId" value={shopId} />
          <input type="hidden" name="customType" value="0" />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{" "}
                  Unbinding...
                </>
              ) : (
                "Unbind"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Price Strategy Detail Dialog ──────────────────────────────────────
export function PriceStrategyDetailDialog({
  priceId,
  name,
}: {
  priceId: number;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<PriceStrategyItem | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchPriceStrategyDetailAction(priceId)
      .then((res) => {
        const data = (res as { data?: PriceStrategyItem }).data;
        setStrategy(data || null);
      })
      .finally(() => setLoading(false));
  }, [open, priceId]);

  const details = strategy?.priceStrategyDetailList || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="View details">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Full price strategy configuration</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : strategy ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Type</span>
                <p>{strategy.type === 1 ? "Advanced" : strategy.type === 2 ? "Timetable" : "General"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Deposit</span>
                <p>¥{strategy.depositAmount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Unit Price</span>
                <p>¥{strategy.price}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Daily Cap</span>
                <p>¥{strategy.dailyMaxPrice}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Free Minutes</span>
                <p>{strategy.freeMinutes}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Timeout</span>
                <p>
                  ¥{strategy.timeoutAmount} / {strategy.timeoutDay} days
                </p>
              </div>
            </div>

            {details.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Timetable Tiers</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Minutes</TableHead>
                      <TableHead>Section Fee</TableHead>
                      <TableHead>Total Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.map((tier) => (
                      <TableRow key={tier.seqno}>
                        <TableCell>
                          {tier.startMinute}–{tier.endMinute}
                        </TableCell>
                        <TableCell>¥{tier.setcionFee}</TableCell>
                        <TableCell>¥{tier.totalFee}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No detail available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
