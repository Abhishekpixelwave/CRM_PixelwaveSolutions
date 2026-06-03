"use server";

import {
  publishCabinetAd,
  getAllDevicePage,
  getShopList,
} from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import {
  createAdCampaign,
  deleteAdCampaign,
  getAdCampaigns,
  updateAdCampaign,
} from "@/lib/ad-campaigns";
import { getCabinetIdsForMarket } from "@/lib/markets";
import {
  buildScreenAdCode,
  type CabinetScreenPosition,
} from "@/lib/cabinet-screen-ads";
import { revalidatePath } from "next/cache";

export async function fetchAdCampaignsAction() {
  const token = await getApiToken();
  const [cabinetRes, shopRes] = await Promise.all([
    getAllDevicePage({}, token),
    getShopList(token),
  ]);

  const cabinets =
    (cabinetRes as { data?: { list?: Array<{ cabinetId: string; shopId: string }> } })
      .data?.list || [];
  const shops =
    (shopRes as { data?: Array<{ newID: string; shopAddress: string; shopName: string }> })
      .data || [];

  const campaigns = getAdCampaigns().map((campaign) => {
    const cabinetIds =
      campaign.cabinetIds.length > 0
        ? campaign.cabinetIds
        : getCabinetIdsForMarket(campaign.marketId, shops, cabinets);
    return { ...campaign, cabinetIds, machineCount: cabinetIds.length };
  });

  return { campaigns, shops, cabinets };
}

export async function createAdCampaignAction(formData: FormData) {
  const token = await getApiToken();
  const marketId = formData.get("marketId") as string;
  const publishNow = formData.get("publishNow") === "true";

  const [cabinetRes, shopRes] = await Promise.all([
    getAllDevicePage({}, token),
    getShopList(token),
  ]);
  const cabinets =
    (cabinetRes as { data?: { list?: Array<{ cabinetId: string; shopId: string }> } })
      .data?.list || [];
  const shops =
    (shopRes as { data?: Array<{ newID: string; shopAddress: string; shopName: string }> })
      .data || [];

  const cabinetIds = getCabinetIdsForMarket(marketId, shops, cabinets);
  const slotCount = Number(formData.get("slotCount")) || 8;
  const screenPosition =
    (formData.get("screenPosition") as CabinetScreenPosition) || "0";
  const code = buildScreenAdCode(slotCount, screenPosition);

  const campaign = createAdCampaign({
    name: formData.get("name") as string,
    advertiser: formData.get("advertiser") as string,
    marketId,
    mediaType: formData.get("mediaType") as "image" | "video" | "programSheet",
    mediaPath: formData.get("mediaPath") as string,
    code,
    slotCount,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    cabinetIds,
    status: publishNow ? "live" : "draft",
    publishedAt: publishNow ? new Date().toISOString() : undefined,
  });

  if (publishNow && cabinetIds.length > 0) {
    await publishCabinetAd(
      {
        cabinetIdList: cabinetIds,
        isRestart: formData.get("isRestart") === "true",
        adConfigList: [
          {
            code: campaign.code,
            mediaType: campaign.mediaType,
            mediaPath: campaign.mediaPath,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
          },
        ],
      },
      token
    );
  }

  revalidatePath("/ads");
  return { success: true, campaign, machineCount: cabinetIds.length };
}

export async function publishAdCampaignAction(campaignId: string) {
  const token = await getApiToken();
  const campaigns = getAdCampaigns();
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) return { success: false, error: "Campaign not found" };

  const [cabinetRes, shopRes] = await Promise.all([
    getAllDevicePage({}, token),
    getShopList(token),
  ]);
  const cabinets =
    (cabinetRes as { data?: { list?: Array<{ cabinetId: string; shopId: string }> } })
      .data?.list || [];
  const shops =
    (shopRes as { data?: Array<{ newID: string; shopAddress: string; shopName: string }> })
      .data || [];

  const cabinetIds = getCabinetIdsForMarket(
    campaign.marketId,
    shops,
    cabinets
  );

  if (cabinetIds.length === 0) {
    return { success: false, error: "No machines in selected market" };
  }

  await publishCabinetAd(
    {
      cabinetIdList: cabinetIds,
      isRestart: true,
      adConfigList: [
        {
          code: campaign.code,
          mediaType: campaign.mediaType,
          mediaPath: campaign.mediaPath,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
        },
      ],
    },
    token
  );

  updateAdCampaign(campaignId, {
    status: "live",
    cabinetIds,
    publishedAt: new Date().toISOString(),
  });

  revalidatePath("/ads");
  return { success: true, machineCount: cabinetIds.length };
}

export async function deleteAdCampaignAction(campaignId: string) {
  deleteAdCampaign(campaignId);
  revalidatePath("/ads");
  return { success: true };
}
