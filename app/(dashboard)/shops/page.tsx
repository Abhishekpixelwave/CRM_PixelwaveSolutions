import { Store } from "lucide-react";
import { getShopList } from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import { ShareRevenueButton } from "@/components/share-revenue-button";
import { fetchRevenueShareAction } from "@/app/(dashboard)/revenue-share/actions";
import { VenueGrid } from "@/components/venues/venue-grid";

export default async function ShopsPage() {
  const token = await getApiToken();
  const [response, revenueShare] = await Promise.all([
    getShopList(token),
    fetchRevenueShareAction(),
  ]);
  const shops =
    (response as { data: Array<Record<string, unknown>> }).data || [];

  const openVenues = shops.filter((s) => s.businessStatus === 1).length;
  const totalKiosks = shops.reduce(
    (sum, s) => sum + ((s.cabinetNum as number) || 0),
    0
  );

  return (
    <div
      className="flex min-w-0 flex-col"
      style={{ height: "calc(100vh - 7rem)" }}
    >
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Venues
          </h1>
          <p className="text-sm text-muted-foreground">
            {shops.length} venues · {totalKiosks} kiosks · {openVenues} open
          </p>
        </div>
        <ShareRevenueButton
          size="sm"
          pendingAmount={revenueShare.summary.totalPending}
        />
      </div>

      <VenueGrid shops={shops} />
    </div>
  );
}
