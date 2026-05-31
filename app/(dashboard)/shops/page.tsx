import {
  Store,
  MapPin,
  Clock,
  Battery,
  HardDrive,
  Phone,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getShopList } from "@/lib/api-client";
import {
  CreateShopDialog,
  EditShopDialog,
  DeleteShopButton,
} from "./shop-dialogs";
import { ShopMiniMap } from "./shop-map-wrapper";

export default async function ShopsPage() {
  const response = await getShopList();
  const shops =
    (response as { data: Array<Record<string, unknown>> }).data || [];

  const openShops = shops.filter((s) => s.businessStatus === 1).length;
  const totalCabinets = shops.reduce(
    (sum, s) => sum + ((s.cabinetNum as number) || 0),
    0
  );

  return (
    <div
      className="flex min-w-0 flex-col"
      style={{ height: "calc(100vh - 7rem)" }}
    >
      {/* Page header */}
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Shops
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage merchant locations — {shops.length} shops, {totalCabinets}{" "}
            cabinets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Store className="h-3.5 w-3.5 text-emerald-500" />
            {openShops} open
          </div>
          <CreateShopDialog />
        </div>
      </div>

      {/* Horizontally scrollable cards filling remaining height */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
        {shops.map((shop) => (
          <Card
            key={shop.newID as string}
            className="relative flex w-[320px] shrink-0 flex-col overflow-hidden transition-shadow hover:shadow-lg"
          >
            {/* Status indicator bar */}
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                shop.businessStatus === 1
                  ? "bg-emerald-500"
                  : "bg-destructive"
              }`}
            />

            <CardHeader className="shrink-0 pb-3 pl-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base">
                    {shop.shopName as string}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-start gap-1 text-xs">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    <span className="line-clamp-2">
                      {shop.shopAddress as string}
                    </span>
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    shop.businessStatus === 1
                      ? "ml-2 shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "ml-2 shrink-0 bg-destructive/10 text-destructive"
                  }
                >
                  <span
                    className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                      shop.businessStatus === 1
                        ? "bg-emerald-500"
                        : "bg-destructive"
                    }`}
                  />
                  {shop.businessStatus === 1 ? "Open" : "Closed"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col space-y-3 pl-5">
              {/* Info rows */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Store className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span>{(shop.sceneTypeDesc as string) || "Other"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span>{(shop.mobile as string) || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span>{shop.shopTime as string}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span>{shop.pCurrency as string}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    {shop.cabinetNum as number}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    cabinets
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <Battery className="h-3.5 w-3.5 text-muted-foreground" />
                  <span
                    className={`text-sm font-semibold ${
                      shop.freeNum === "0"
                        ? "text-destructive"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {shop.freeNum as string}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {shop.batteryNum as string}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Rate </span>
                  <span className="font-semibold">
                    ¥{shop.pJifei as string}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /{shop.pJifeiDanwei as string}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cap </span>
                  <span className="font-semibold">
                    ¥{shop.pFengding as string}
                  </span>
                </div>
              </div>

              {/* Mini Map — fills remaining space */}
              <div className="flex-1 overflow-hidden rounded-lg border" style={{ minHeight: "120px" }}>
                <ShopMiniMap
                  lat={parseFloat(shop.latitude as string)}
                  lng={parseFloat(shop.longitude as string)}
                  shopName={shop.shopName as string}
                />
              </div>

              {/* Actions pinned to bottom */}
              <div className="flex items-center justify-end gap-1 border-t pt-2">
                <EditShopDialog
                  shop={
                    shop as unknown as import("@/lib/api-client").ShopItem
                  }
                />
                <DeleteShopButton
                  shopId={shop.newID as string}
                  shopName={shop.shopName as string}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {shops.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            No shops found. Click &quot;Add Shop&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}
