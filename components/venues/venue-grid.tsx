"use client"

import { useMemo, useState } from "react"
import {
  MapPin,
  HardDrive,
  Battery,
  Phone,
  Clock,
  DollarSign,
  ChevronUp,
  Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CreateShopDialog,
  EditShopDialog,
  DeleteShopButton,
  ShopDetailDialog,
} from "@/app/(dashboard)/shops/shop-dialogs"
import { ShopMiniMap } from "@/app/(dashboard)/shops/shop-map-wrapper"
import type { ShopItem } from "@/lib/api-client"

type VenueRecord = Record<string, unknown>

function parseRatePer10Min(pJifei: string, unit?: string) {
  const rate = parseFloat(pJifei || "0")
  if (!unit || unit.includes("10")) return rate
  if (unit.includes("hour")) return Math.round((rate / 6) * 100) / 100
  return rate
}

export function VenueGrid({ shops }: { shops: VenueRecord[] }) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all"
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [preview, setPreview] = useState<
    Record<string, { rate: string; chargers: string; theft: string }>
  >({})

  const filtered = useMemo(() => {
    return shops.filter((shop) => {
      const name = String(shop.shopName || "").toLowerCase()
      const address = String(shop.shopAddress || "").toLowerCase()
      const q = query.toLowerCase()
      const matchesQuery = !q || name.includes(q) || address.includes(q)
      const open = shop.businessStatus === 1
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && open) ||
        (statusFilter === "closed" && !open)
      return matchesQuery && matchesStatus
    })
  }, [shops, query, statusFilter])

  function getPreview(shop: VenueRecord) {
    const id = shop.newID as string
    if (preview[id]) return preview[id]
    return {
      rate: String(
        parseRatePer10Min(
          String(shop.pJifei || "0.50"),
          String(shop.pJifeiDanwei || "")
        )
      ),
      chargers: String(shop.freeNum || "0"),
      theft: String(shop.deposit || "20.00"),
    }
  }

  function updatePreview(
    id: string,
    shop: VenueRecord,
    field: "rate" | "chargers" | "theft",
    value: string
  ) {
    setPreview((prev) => ({
      ...prev,
      [id]: { ...getPreview(shop), [field]: value },
    }))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter venues…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as "all" | "open" | "closed")
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All venues</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <CreateShopDialog />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((shop) => {
            const id = shop.newID as string
            const isOpen = shop.businessStatus === 1
            const isExpanded = expandedId === id
            const p = getPreview(shop)

            return (
              <button
                key={id}
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : id)}
                className={`flex aspect-square flex-col items-start justify-between rounded-2xl border border-border/50 p-3 text-left shadow-sm shadow-black/[0.04] transition-all hover:border-boost/30 hover:shadow-md dark:shadow-black/20 ${
                  isExpanded
                    ? "border-boost/40 ring-1 ring-boost/20"
                    : "bg-card"
                }`}
              >
                <div className="w-full">
                  <div
                    className={`mb-2 h-1.5 w-full rounded-full ${
                      isOpen ? "bg-boost" : "bg-destructive"
                    }`}
                  />
                  <p className="line-clamp-2 text-sm font-semibold leading-tight">
                    {shop.shopName as string}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
                    {shop.shopAddress as string}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <HardDrive className="h-3 w-3" />
                    {shop.cabinetNum as number}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Battery className="h-3 w-3" />
                    {shop.freeNum as string}/{shop.batteryNum as string}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {expandedId && (
          (() => {
            const shop = filtered.find((s) => s.newID === expandedId)
            if (!shop) return null
            const id = shop.newID as string
            const isOpen = shop.businessStatus === 1
            const p = getPreview(shop)
            return (
              <div className="mt-4 rounded-2xl border border-border/50 bg-card p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/20">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {shop.shopName as string}
                    </h3>
                    <p className="flex items-start gap-1 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {shop.shopAddress as string}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        isOpen
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {isOpen ? "Open" : "Closed"}
                    </Badge>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setExpandedId(null)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {(shop.mobile as string) || "—"}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {shop.shopTime as string}
                    </div>
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Venue preview (adjustable)
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor={`rate-${id}`} className="text-xs">
                          Rate per 10 minutes ($)
                        </Label>
                        <Input
                          id={`rate-${id}`}
                          type="number"
                          step="0.01"
                          value={p.rate}
                          onChange={(e) =>
                            updatePreview(id, shop, "rate", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`chargers-${id}`} className="text-xs">
                          Available chargers
                        </Label>
                        <Input
                          id={`chargers-${id}`}
                          type="number"
                          min={0}
                          value={p.chargers}
                          onChange={(e) =>
                            updatePreview(id, shop, "chargers", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`theft-${id}`} className="text-xs">
                          Theft / unreturned cost ($)
                        </Label>
                        <Input
                          id={`theft-${id}`}
                          type="number"
                          step="0.01"
                          value={p.theft}
                          onChange={(e) =>
                            updatePreview(id, shop, "theft", e.target.value)
                          }
                        />
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        Shown to renters on the venue screen
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div
                      className="overflow-hidden rounded-lg border"
                      style={{ minHeight: "160px" }}
                    >
                      <ShopMiniMap
                        lat={parseFloat(shop.latitude as string)}
                        lng={parseFloat(shop.longitude as string)}
                        shopName={shop.shopName as string}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1 border-t pt-2">
                      <ShopDetailDialog
                        shopId={id}
                        shopName={shop.shopName as string}
                      />
                      <EditShopDialog shop={shop as unknown as ShopItem} />
                      <DeleteShopButton
                        shopId={id}
                        shopName={shop.shopName as string}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })()
        )}

        {filtered.length === 0 && (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            No venues match your filter.
          </div>
        )}
      </div>
    </div>
  )
}
