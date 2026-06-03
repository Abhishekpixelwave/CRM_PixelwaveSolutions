"use server";

import {
  saveOrUpdatePriceStrategy,
  deletePriceStrategy,
  bindShopPriceStrategy,
  unbindShopPriceStrategy,
  getPriceStrategyDetail,
} from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import { revalidatePath } from "next/cache";

export async function createOrUpdatePriceStrategyAction(formData: FormData) {
  const token = await getApiToken();
  const priceIdRaw = formData.get("priceId") as string;
  const payload = {
    priceId: priceIdRaw ? Number(priceIdRaw) : null,
    name: formData.get("name") as string,
    type: Number(formData.get("type")),
    customType: Number(formData.get("customType") || 0),
    depositAmount: Number(formData.get("depositAmount")),
    timeoutAmount: Number(formData.get("timeoutAmount")),
    timeoutDay: Number(formData.get("timeoutDay")),
    freeMinutes: Number(formData.get("freeMinutes")),
    price: Number(formData.get("price")),
    priceTime: Number(formData.get("priceTime")),
    priceUnit: Number(formData.get("priceUnit")),
    dailyMaxPrice: Number(formData.get("dailyMaxPrice")),
    isDeposit: formData.get("isDeposit") === "true",
    shopId: (formData.get("shopId") as string) || undefined,
  };
  await saveOrUpdatePriceStrategy(payload, token);
  revalidatePath("/pricing");
  return { success: true };
}

export async function deletePriceStrategyAction(priceId: number) {
  const token = await getApiToken();
  await deletePriceStrategy([priceId], token);
  revalidatePath("/pricing");
  return { success: true };
}

export async function bindShopPriceStrategyAction(formData: FormData) {
  const token = await getApiToken();
  const payload = {
    shopId: formData.get("shopId") as string,
    priceId: Number(formData.get("priceId")),
    customType: Number(formData.get("customType") || 0),
  };
  await bindShopPriceStrategy(payload, token);
  revalidatePath("/pricing");
  return { success: true };
}

export async function unbindShopPriceStrategyAction(formData: FormData) {
  const token = await getApiToken();
  const payload = {
    shopId: formData.get("shopId") as string,
    customType: Number(formData.get("customType") || 0),
  };
  await unbindShopPriceStrategy(payload, token);
  revalidatePath("/pricing");
  return { success: true };
}

export async function fetchPriceStrategyDetailAction(priceId: number) {
  const token = await getApiToken();
  return getPriceStrategyDetail(priceId, token);
}
