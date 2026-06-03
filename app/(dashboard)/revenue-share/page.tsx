import { HandCoins } from "lucide-react";
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
import {
  fetchRevenueShareAction,
  fetchShopsWithoutPartnerAction,
} from "./actions";
import {
  EditShareDialog,
  EditPartnerDialog,
  PayoutDialog,
  AddPartnerDialog,
  PayAllPendingButton,
} from "./revenue-share-dialogs";

export default async function RevenueSharePage() {
  const { rows, summary, payoutHistory } = await fetchRevenueShareAction();
  const shopsWithoutPartner = await fetchShopsWithoutPartnerAction();

  const pendingPartners = rows.filter((r) => r.revenue.pending > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <HandCoins className="h-6 w-6" />
            Revenue Share
          </h1>
          <p className="text-sm text-muted-foreground">
            Venue partners receive 10% of rental revenue — Boost keeps 90%. Payouts via Stripe Connect (coming soon).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddPartnerDialog shops={shopsWithoutPartner} />
          <PayAllPendingButton
            pendingTotal={summary.totalPending}
            partnerCount={pendingPartners.length}
          />
        </div>
      </div>

      <Card className="border-boost/20 bg-boost/5">
        <CardContent className="py-4">
          <p className="text-sm">
            <strong>Stripe Connect:</strong> Partner payouts will be sent directly to venue clients through Stripe. Connect your Stripe account in Settings to enable automated revenue share transfers.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalGross.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shared with clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-boost">
              ${summary.totalPartnerShare.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Boost keeps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalPlatformShare.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${summary.totalPending.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              ${summary.totalPaid.toFixed(2)} already paid out
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How revenue is shared</CardTitle>
          <CardDescription>
            Each venue partner earns <strong>10%</strong> of rental revenue. Boost retains 90%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-4 overflow-hidden rounded-full">
            <div
              className="bg-boost"
              style={{
                width:
                  summary.totalGross > 0
                    ? `${(summary.totalPartnerShare / summary.totalGross) * 100}%`
                    : "50%",
              }}
              title="Client share"
            />
            <div
              className="bg-muted-foreground/30"
              style={{
                width:
                  summary.totalGross > 0
                    ? `${(summary.totalPlatformShare / summary.totalGross) * 100}%`
                    : "50%",
              }}
              title="Boost share"
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-boost" />
              Clients (${summary.totalPartnerShare.toFixed(2)})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
              Boost (${summary.totalPlatformShare.toFixed(2)})
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client partners</CardTitle>
          <CardDescription>
            Set each client&apos;s share % and send their portion of revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Their share</TableHead>
                <TableHead>You keep</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Owed to client</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ partner, revenue }) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{partner.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {partner.clientEmail} · {partner.payoutMethod.toUpperCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{partner.shopName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-boost">
                        {partner.sharePercent}%
                      </span>
                      <EditShareDialog partner={partner} />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {100 - partner.sharePercent}%
                  </TableCell>
                  <TableCell>${revenue.gross.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">
                    ${revenue.partnerShare.toFixed(2)}
                  </TableCell>
                  <TableCell>${partner.totalPaidOut.toFixed(2)}</TableCell>
                  <TableCell>
                    {revenue.pending > 0 ? (
                      <Badge className="bg-amber-500/10 text-amber-600">
                        ${revenue.pending.toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Settled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditPartnerDialog partner={partner} />
                      <PayoutDialog
                        partnerId={partner.id}
                        clientName={partner.clientName}
                        pendingAmount={revenue.pending}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    No clients yet. Click &quot;Add client&quot; to start sharing revenue with a location partner.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {payoutHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payout history</CardTitle>
            <CardDescription>Revenue share sent to clients from this portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutHistory.slice(0, 10).map((payout) => {
                  const partner = rows.find((r) => r.partner.id === payout.partnerId)?.partner;
                  return (
                    <TableRow key={payout.id}>
                      <TableCell className="text-sm">
                        {new Date(payout.paidAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{partner?.clientName ?? payout.partnerId}</TableCell>
                      <TableCell className="font-medium text-boost">
                        ${payout.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payout.note}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
