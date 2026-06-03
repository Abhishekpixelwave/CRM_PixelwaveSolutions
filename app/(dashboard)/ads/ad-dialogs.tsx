"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Monitor, Trash2, Upload, Loader2 } from "lucide-react";

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
import { MARKETS } from "@/lib/markets";
import {
  CABINET_SCREEN_POSITIONS,
  type CabinetScreenPosition,
} from "@/lib/cabinet-screen-ads";
import { CabinetScreenPreview } from "@/components/ads/cabinet-screen-preview";
import {
  createAdCampaignAction,
  publishAdCampaignAction,
  deleteAdCampaignAction,
} from "./actions";

export function CreateAdCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [screenPosition, setScreenPosition] =
    useState<CabinetScreenPosition>("0");
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const res = (await createAdCampaignAction(formData)) as {
        machineCount?: number;
      };
      setResult(
        res.machineCount !== undefined
          ? `Published to ${res.machineCount} machine screen(s) in selected market`
          : "Campaign saved"
      );
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-boost text-boost-foreground hover:bg-boost-hover">
          <Plus className="mr-1.5 h-4 w-4" />
          Publish to screens
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publish ad to machine screens</DialogTitle>
          <DialogDescription>
            Push an image or video to the LCD on your charging cabinets. Only
            machines in the selected market will show this ad.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ad-name">Campaign name *</Label>
              <Input
                id="ad-name"
                name="name"
                required
                placeholder="OpenAI Bay Area Screen Ad"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-advertiser">Advertiser *</Label>
              <Input id="ad-advertiser" name="advertiser" required placeholder="OpenAI" />
            </div>
            <div className="space-y-2">
              <Label>Target market *</Label>
              <Select name="marketId" defaultValue="bay-area" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                e.g. Bay Area machines only — other regions keep their current
                screen content.
              </p>
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
              <p className="text-xs text-muted-foreground">
                {
                  CABINET_SCREEN_POSITIONS.find((p) => p.value === screenPosition)
                    ?.description
                }
              </p>
            </div>
            <div className="space-y-2">
              <Label>Cabinet slot count</Label>
              <Select name="slotCount" defaultValue="8">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6-slot cabinet</SelectItem>
                  <SelectItem value="8">8-slot cabinet</SelectItem>
                  <SelectItem value="12">12-slot cabinet</SelectItem>
                  <SelectItem value="48">48-slot cabinet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Media type</Label>
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
              <Label htmlFor="ad-media">Screen media URL *</Label>
              <Input
                id="ad-media"
                name="mediaPath"
                required
                placeholder="https://cdn.example.com/ads/openai.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ad-start">Start date</Label>
                <Input id="ad-start" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-end">End date</Label>
                <Input id="ad-end" name="endDate" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Push to machine screens</Label>
              <Select name="publishNow" defaultValue="true">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    Now — update cabinet screens immediately
                  </SelectItem>
                  <SelectItem value="false">Save draft (don&apos;t push yet)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Restart cabinets after publish</Label>
              <Select name="isRestart" defaultValue="true">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    Yes — recommended so screens refresh the ad
                  </SelectItem>
                  <SelectItem value="false">No restart</SelectItem>
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

          {result && (
            <p className="sm:col-span-2 rounded-md bg-boost/10 px-3 py-2 text-sm text-black dark:text-boost">
              {result}
            </p>
          )}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Publishing…" : "Publish to screens"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PublishCampaignButton({
  campaignId,
  machineCount,
}: {
  campaignId: string;
  machineCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      await publishAdCampaignAction(campaignId);
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={handlePublish} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : (
        <Monitor className="mr-1 h-3.5 w-3.5" />
      )}
      Push to {machineCount} screen{machineCount !== 1 ? "s" : ""}
    </Button>
  );
}

export function DeleteCampaignButton({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deleteAdCampaignAction(campaignId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-xs" variant="ghost" className="text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove campaign?</DialogTitle>
          <DialogDescription>
            This removes the campaign from the portal. Already-published screen
            content may remain until replaced.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
