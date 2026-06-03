"use server";

import {
  createShop,
  updateShop,
  deleteShop,
  getShopDetail,
  getDeviceByShopId,
  type CreateShopPayload,
} from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import { revalidatePath } from "next/cache";

export async function createShopAction(formData: FormData) {
  const token = await getApiToken();
  const payload: CreateShopPayload = {
    pNewid: `shop-${Date.now()}`,
    pName: formData.get("shopName") as string,
    pAddress: formData.get("shopAddress") as string,
    pJingdu: (formData.get("longitude") as string) || "0",
    pWeidu: (formData.get("latitude") as string) || "0",
    pSceneType: Number(formData.get("sceneType")) || 0,
    pContent: formData.get("pContent") as string,
    pCurrency: (formData.get("pCurrency") as string) || "USD",
    pAuditor: Number(formData.get("businessStatus")) || 1,
    mobile: formData.get("mobile") as string,
    shopTime: formData.get("shopTime") as string,
  };

  await createShop(payload, token);
  revalidatePath("/shops");
  return { success: true };
}

export async function updateShopAction(formData: FormData) {
  const token = await getApiToken();
  const payload: CreateShopPayload & { id?: number } = {
    id: Number(formData.get("id")),
    pNewid: formData.get("newID") as string,
    pName: formData.get("shopName") as string,
    pAddress: formData.get("shopAddress") as string,
    pJingdu: (formData.get("longitude") as string) || "0",
    pWeidu: (formData.get("latitude") as string) || "0",
    pSceneType: Number(formData.get("sceneType")) || 0,
    pContent: formData.get("pContent") as string,
    pCurrency: (formData.get("pCurrency") as string) || "USD",
    pAuditor: Number(formData.get("businessStatus")) || 1,
    mobile: formData.get("mobile") as string,
    shopTime: formData.get("shopTime") as string,
  };

  await updateShop(payload, token);
  revalidatePath("/shops");
  return { success: true };
}

export async function deleteShopAction(shopId: string) {
  const token = await getApiToken();
  await deleteShop(shopId, token);
  revalidatePath("/shops");
  return { success: true };
}

export async function fetchShopDetailAction(shopId: string) {
  const token = await getApiToken();
  const [detail, devices] = await Promise.all([
    getShopDetail(shopId, token),
    getDeviceByShopId(shopId, token),
  ]);
  return { detail, devices };
}
