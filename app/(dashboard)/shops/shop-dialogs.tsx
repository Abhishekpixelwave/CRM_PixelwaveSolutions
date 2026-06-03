"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createShopAction, updateShopAction, deleteShopAction, fetchShopDetailAction } from "./actions";
import type { ShopItem } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const sceneTypes = [
  { value: "0", label: "Other" },
  { value: "1", label: "House" },
  { value: "22", label: "Café" },
  { value: "24", label: "Restaurant" },
  { value: "25", label: "Shopping Centre" },
  { value: "26", label: "Convenience Store" },
  { value: "27", label: "Retail Store" },
  { value: "28", label: "Public Transport" },
  { value: "29", label: "Airport" },
  { value: "30", label: "Stadium" },
  { value: "32", label: "Hospital" },
  { value: "34", label: "University" },
  { value: "21", label: "Bar" },
  { value: "23", label: "Nightclub" },
];

// ─── Create Shop Dialog ──────────────────────────────────────────────
export function CreateShopDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createShopAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Shop</DialogTitle>
          <DialogDescription>
            Add a new merchant location to your network.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-shopName">Shop Name *</Label>
              <Input id="c-shopName" name="shopName" required placeholder="e.g. Downtown Station" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-shopAddress">Address *</Label>
              <Input id="c-shopAddress" name="shopAddress" required placeholder="Full address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-mobile">Mobile</Label>
              <Input id="c-mobile" name="mobile" placeholder="+1 555..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-shopTime">Hours</Label>
              <Input id="c-shopTime" name="shopTime" placeholder="08:00-22:00" defaultValue="08:00-22:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-longitude">Longitude</Label>
              <Input id="c-longitude" name="longitude" placeholder="-73.985130" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-latitude">Latitude</Label>
              <Input id="c-latitude" name="latitude" placeholder="40.758896" />
            </div>
            <div className="space-y-2">
              <Label>Scene Type</Label>
              <Select name="sceneType" defaultValue="0">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sceneTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select name="pCurrency" defaultValue="USD">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="businessStatus" defaultValue="1">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Open</SelectItem>
                  <SelectItem value="0">Not Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-pContent">Description</Label>
              <Textarea id="c-pContent" name="pContent" placeholder="Shop description..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating...</> : "Create Shop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Shop Dialog ────────────────────────────────────────────────
export function EditShopDialog({ shop }: { shop: ShopItem }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateShopAction(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="Edit shop">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Shop</DialogTitle>
          <DialogDescription>Update shop details for {shop.shopName}.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={shop.id} />
          <input type="hidden" name="newID" value={shop.newID} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="e-shopName">Shop Name *</Label>
              <Input id="e-shopName" name="shopName" required defaultValue={shop.shopName} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="e-shopAddress">Address *</Label>
              <Input id="e-shopAddress" name="shopAddress" required defaultValue={shop.shopAddress} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-mobile">Mobile</Label>
              <Input id="e-mobile" name="mobile" defaultValue={shop.mobile} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-shopTime">Hours</Label>
              <Input id="e-shopTime" name="shopTime" defaultValue={shop.shopTime} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-longitude">Longitude</Label>
              <Input id="e-longitude" name="longitude" defaultValue={shop.longitude} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-latitude">Latitude</Label>
              <Input id="e-latitude" name="latitude" defaultValue={shop.latitude} />
            </div>
            <div className="space-y-2">
              <Label>Scene Type</Label>
              <Select name="sceneType" defaultValue={shop.sceneType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sceneTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select name="pCurrency" defaultValue={shop.pCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="businessStatus" defaultValue={String(shop.businessStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Open</SelectItem>
                  <SelectItem value="0">Not Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="e-pContent">Description</Label>
              <Textarea id="e-pContent" name="pContent" defaultValue={shop.pContent} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Shop Button ──────────────────────────────────────────────
export function DeleteShopButton({ shopId, shopName }: { shopId: string; shopName: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deleteShopAction(shopId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" className="text-destructive hover:text-destructive" title="Delete shop">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Shop</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{shopName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Deleting...</> : "Delete Shop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ─── Shop Detail Dialog ────────────────────────────────────────────────
export function ShopDetailDialog({
  shopId,
  shopName,
}: {
  shopId: string;
  shopName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    detail: unknown;
    devices: unknown;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchShopDetailAction(shopId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [open, shopId]);

  const shop = (data?.detail as { data?: Record<string, unknown> })?.data;
  const devices =
    ((data?.devices as { data?: Array<Record<string, unknown>> })?.data) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" title="View shop detail">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{shopName}</DialogTitle>
          <DialogDescription>Shop detail &amp; linked devices</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {shop && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <span className="text-muted-foreground">Address</span>
                  <p>{shop.shopAddress as string}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile</span>
                  <p>{(shop.mobile as string) || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Hours</span>
                  <p>{shop.shopTime as string}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rate</span>
                  <p>
                    ${shop.pJifei as string}/{shop.pJifeiDanwei as string}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Deposit</span>
                  <p>${shop.pYajin as string}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cabinets</span>
                  <p>{shop.cabinetNum as number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="secondary"
                    className={
                      shop.businessStatus === 1
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-destructive/10 text-destructive"
                    }
                  >
                    {shop.businessStatus === 1 ? "Open" : "Closed"}
                  </Badge>
                </div>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-medium">
                Devices at Shop ({devices.length})
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cabinet ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Slots</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((d) => (
                    <TableRow key={d.cabinetId as string}>
                      <TableCell className="font-mono text-xs">
                        {d.cabinetId as string}
                      </TableCell>
                      <TableCell>{d.type as string}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            d.online
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {d.online ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell>{d.slots as number}</TableCell>
                    </TableRow>
                  ))}
                  {devices.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No devices linked
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
