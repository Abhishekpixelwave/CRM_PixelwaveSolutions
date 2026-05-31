"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

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
import { createShopAction, updateShopAction, deleteShopAction } from "./actions";
import type { ShopItem } from "@/lib/api-client";

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
              <Input id="c-mobile" name="mobile" placeholder="+86 138..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-shopTime">Hours</Label>
              <Input id="c-shopTime" name="shopTime" placeholder="08:00-22:00" defaultValue="08:00-22:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-longitude">Longitude</Label>
              <Input id="c-longitude" name="longitude" placeholder="113.327761" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-latitude">Latitude</Label>
              <Input id="c-latitude" name="latitude" placeholder="22.989442" />
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
              <Select name="pCurrency" defaultValue="CNY">
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
