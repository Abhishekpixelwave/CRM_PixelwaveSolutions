import { Monitor } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMarketName } from "@/lib/markets";
import { getScreenPositionLabel } from "@/lib/cabinet-screen-ads";
import { fetchAdCampaignsAction } from "./actions";
import {
  CreateAdCampaignDialog,
  PublishCampaignButton,
  DeleteCampaignButton,
} from "./ad-dialogs";

const STATUS_STYLE: Record<string, string> = {
  live: "bg-boost/10 text-black dark:text-boost",
  scheduled: "bg-blue-500/10 text-blue-600",
  draft: "bg-muted text-muted-foreground",
  ended: "bg-destructive/10 text-destructive",
};

export default async function AdsPage() {
  const { campaigns } = await fetchAdCampaignsAction();

  const liveCount = campaigns.filter((c) => c.status === "live").length;
  const totalScreens = campaigns
    .filter((c) => c.status === "live")
    .reduce((s, c) => s + c.machineCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Monitor className="h-6 w-6" />
            Ads Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Ads Management — publish to kiosk LCD screens by region
          </p>
        </div>
        <CreateAdCampaignDialog />
      </div>

      <Card className="border-boost/20 bg-boost/5">
        <CardContent className="py-4">
          <p className="text-sm">
            <strong>How it works:</strong> When you publish a campaign, the ad
            media is sent to each cabinet&apos;s built-in screen via the Bajie
            ad API. Bay Area machines get Bay Area ads only — other locations
            are unaffected. Cabinets can restart to load the new screen
            content.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Live on screens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveCount}</div>
            <p className="text-xs text-muted-foreground">active campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cabinets displaying ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-boost">
              {totalScreens}
            </div>
            <p className="text-xs text-muted-foreground">machine screens</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(campaigns.map((c) => c.marketId)).size}
            </div>
            <p className="text-xs text-muted-foreground">regions targeted</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Screen campaigns</CardTitle>
          <CardDescription>
            Each row is an ad scheduled or live on cabinet LCDs in the chosen
            market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Advertiser</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Screen zone</TableHead>
                <TableHead>Cabinet screens</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.advertiser}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getMarketName(campaign.marketId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getScreenPositionLabel(campaign.code)}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {campaign.machineCount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {" "}
                      screens
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {campaign.startDate} → {campaign.endDate}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={STATUS_STYLE[campaign.status]}
                    >
                      {campaign.status === "live" ? "On screens" : campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {campaign.status !== "live" && (
                        <PublishCampaignButton
                          campaignId={campaign.id}
                          machineCount={campaign.machineCount}
                        />
                      )}
                      <DeleteCampaignButton campaignId={campaign.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No screen ads yet. Publish an OpenAI ad to Bay Area cabinet
                    screens to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
