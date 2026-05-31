import { DollarSign, ShieldAlert, BadgeInfo } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPriceStrategyPage, getShopList } from "@/lib/api-client";
import {
  PriceStrategyFormDialog,
  DeletePriceStrategyButton,
  BindShopDialog,
  UnbindShopButton,
} from "./pricing-dialogs";

const TYPE_MAP: Record<number, string> = {
  1: "Advanced",
  2: "Timetable",
  3: "General",
};

export default async function PricingPage() {
  const [strategyResponse, shopResponse] = await Promise.all([
    getPriceStrategyPage(),
    getShopList(),
  ]);

  const strategies = ((strategyResponse as any).data as any)?.records || [];
  const shops = ((shopResponse as any).data as any) || [];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Pricing Strategies
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage global and shop-specific billing rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            {strategies.length} active plans
          </div>
          <PriceStrategyFormDialog />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Bound Shop</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead>Base Rate</TableHead>
              <TableHead>Daily Cap</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No pricing strategies found.
                </TableCell>
              </TableRow>
            ) : (
              strategies.map((strategy: any) => {
                const boundShop = shops.find(
                  (s: any) => s.newID === strategy.shopId
                );

                return (
                  <TableRow key={strategy.priceId}>
                    <TableCell className="font-medium">
                      {strategy.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {TYPE_MAP[strategy.type] || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {strategy.shopId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {boundShop ? boundShop.shopName : strategy.shopId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">
                          Global / Unbound
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {strategy.isDeposit ? (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <ShieldAlert className="h-3 w-3" />¥
                          {strategy.depositAmount}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No Deposit
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        ¥{strategy.price} /{" "}
                        {strategy.priceUnit === 0
                          ? "min"
                          : strategy.priceUnit === 1
                          ? "hr"
                          : "day"}
                        <span title={`Billing Time: ${strategy.priceTime}`}>
                          <BadgeInfo className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>¥{strategy.dailyMaxPrice}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {strategy.shopId ? (
                          <UnbindShopButton
                            shopId={strategy.shopId}
                            strategyName={strategy.name}
                          />
                        ) : (
                          <BindShopDialog
                            priceId={strategy.priceId}
                            strategyName={strategy.name}
                            shops={shops}
                          />
                        )}
                        <PriceStrategyFormDialog strategy={strategy} />
                        <DeletePriceStrategyButton
                          priceId={strategy.priceId}
                          name={strategy.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
