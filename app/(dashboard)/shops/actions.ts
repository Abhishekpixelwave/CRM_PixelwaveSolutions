"use server";

import { createShop, updateShop, deleteShop, type CreateShopPayload } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function createShopAction(formData: FormData) {
  const payload: CreateShopPayload = {
    pNewid: `shop-${Date.now()}`,
    pName: formData.get("shopName") as string,
    pAddress: formData.get("shopAddress") as string,
    pJingdu: (formData.get("longitude") as string) || "0",
    pWeidu: (formData.get("latitude") as string) || "0",
    pSceneType: Number(formData.get("sceneType")) || 0,
    pContent: formData.get("pContent") as string,
    pCurrency: (formData.get("pCurrency") as string) || "CNY",
    pAuditor: Number(formData.get("businessStatus")) || 1,
    mobile: formData.get("mobile") as string,
    shopTime: formData.get("shopTime") as string,
  };

  await createShop(payload);
  revalidatePath("/shops");
  return { success: true };
}

export async function updateShopAction(formData: FormData) {
  const payload: CreateShopPayload & { id?: number } = {
    id: Number(formData.get("id")),
    pNewid: formData.get("newID") as string,
    pName: formData.get("shopName") as string,
    pAddress: formData.get("shopAddress") as string,
    pJingdu: (formData.get("longitude") as string) || "0",
    pWeidu: (formData.get("latitude") as string) || "0",
    pSceneType: Number(formData.get("sceneType")) || 0,
    pContent: formData.get("pContent") as string,
    pCurrency: (formData.get("pCurrency") as string) || "CNY",
    pAuditor: Number(formData.get("businessStatus")) || 1,
    mobile: formData.get("mobile") as string,
    shopTime: formData.get("shopTime") as string,
  };

  await updateShop(payload);
  revalidatePath("/shops");
  return { success: true };
}

export async function deleteShopAction(shopId: string) {
  await deleteShop(shopId);
  revalidatePath("/shops");
  return { success: true };
}
