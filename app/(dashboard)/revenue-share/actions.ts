"use server";

import { getOrderList, getShopList } from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import { enrichOrdersForDemo } from "@/lib/dashboard-analytics";
import type { DashboardOrder, DashboardShop } from "@/lib/dashboard-analytics";
import {
  computePartnerRevenue,
  createRevenueSharePartner,
  getAllRevenueSharePayouts,
  getRevenueSharePartners,
  getRevenueSharePayouts,
  recordRevenueSharePayout,
  updateRevenueSharePartner,
} from "@/lib/revenue-share";
import { revalidatePath } from "next/cache";

export async function fetchRevenueShareAction() {
  const token = await getApiToken();
  const [orderRes, shopRes] = await Promise.all([
    getOrderList({}, token),
    getShopList(token),
  ]);
  const shops = ((shopRes as { data?: DashboardShop[] }).data ||
    []) as DashboardShop[];
  const orders = enrichOrdersForDemo(
    ((orderRes as { data?: DashboardOrder[] }).data || []) as DashboardOrder[],
    shops
  );
  const partners = getRevenueSharePartners();
  const payoutHistory = getAllRevenueSharePayouts();

  const rows = partners.map((partner) => ({
    partner,
    revenue: computePartnerRevenue(partner, orders),
    payouts: getRevenueSharePayouts(partner.id),
  }));

  const totalGross = rows.reduce((s, r) => s + r.revenue.gross, 0);
  const totalPartnerShare = rows.reduce((s, r) => s + r.revenue.partnerShare, 0);
  const totalPlatformShare = rows.reduce((s, r) => s + r.revenue.platformShare, 0);
  const totalPending = rows.reduce((s, r) => s + r.revenue.pending, 0);

  return {
    rows,
    shops,
    partners,
    payoutHistory,
    summary: {
      totalGross,
      totalPartnerShare,
      totalPlatformShare,
      totalPending,
      totalPaid: partners.reduce((s, p) => s + p.totalPaidOut, 0),
    },
  };
}

export async function fetchShopsWithoutPartnerAction() {
  const token = await getApiToken();
  const shopRes = await getShopList(token);
  const shops = ((shopRes as { data?: DashboardShop[] }).data ||
    []) as DashboardShop[];
  const partnerShopIds = new Set(getRevenueSharePartners().map((p) => p.shopId));
  return shops.filter((s) => !partnerShopIds.has(s.newID));
}

export async function createPartnerAction(formData: FormData) {
  const partner = createRevenueSharePartner({
    shopId: formData.get("shopId") as string,
    shopName: formData.get("shopName") as string,
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    sharePercent: Number(formData.get("sharePercent")),
    payoutMethod: formData.get("payoutMethod") as "ach" | "wire" | "paypal",
  });
  revalidatePath("/revenue-share");
  return { success: !!partner, partner };
}

export async function updateSharePercentAction(formData: FormData) {
  const id = formData.get("id") as string;
  const sharePercent = Number(formData.get("sharePercent"));

  updateRevenueSharePartner(id, { sharePercent });
  revalidatePath("/revenue-share");
  return { success: true };
}

export async function updatePartnerDetailsAction(formData: FormData) {
  const id = formData.get("id") as string;
  updateRevenueSharePartner(id, {
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    payoutMethod: formData.get("payoutMethod") as "ach" | "wire" | "paypal",
  });
  revalidatePath("/revenue-share");
  return { success: true };
}

export async function payoutPartnerAction(formData: FormData) {
  const partnerId = formData.get("partnerId") as string;
  const amount = Number(formData.get("amount"));
  const note = (formData.get("note") as string) || "Portal payout";

  recordRevenueSharePayout(partnerId, amount, note);
  revalidatePath("/revenue-share");
  revalidatePath("/");
  return { success: true };
}

export async function payAllPendingAction() {
  const token = await getApiToken();
  const orderRes = await getOrderList({}, token);
  const shopRes = await getShopList(token);
  const shops = ((shopRes as { data?: DashboardShop[] }).data ||
    []) as DashboardShop[];
  const orders = enrichOrdersForDemo(
    ((orderRes as { data?: DashboardOrder[] }).data || []) as DashboardOrder[],
    shops
  );
  const partners = getRevenueSharePartners();
  let count = 0;

  for (const partner of partners) {
    const { pending } = computePartnerRevenue(partner, orders);
    if (pending > 0) {
      recordRevenueSharePayout(
        partner.id,
        pending,
        "Bulk revenue share payout from portal"
      );
      count++;
    }
  }

  revalidatePath("/revenue-share");
  revalidatePath("/");
  return { success: true, count };
}
