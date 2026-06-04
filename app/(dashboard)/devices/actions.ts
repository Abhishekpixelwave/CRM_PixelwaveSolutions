"use server";

import {
  deviceOperation,
  ejectByRepair,
  ejectByRent,
  bindDeviceToShop,
  unbindDeviceFromShop,
  updateCabinetAd,
  publishCabinetAd,
  getCabinetDetail,
  getSlotList,
  getBatteryList,
  getOpenDeviceInfo,
} from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import {
  buildScreenAdCode,
  type CabinetScreenPosition,
} from "@/lib/cabinet-screen-ads";
import { revalidatePath } from "next/cache";

function buildAdPayload(formData: FormData) {
  const cabinetIdList = (formData.get("cabinetIdList") as string)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const slotCount = Number(formData.get("slotCount")) || 8;
  const screenPosition =
    (formData.get("screenPosition") as CabinetScreenPosition) || "0";
  const code = buildScreenAdCode(slotCount, screenPosition);

  return {
    cabinetIdList,
    isRestart: formData.get("isRestart") === "true",
    adConfigList: [
      {
        code,
        mediaType: formData.get("mediaType") as string,
        mediaPath: formData.get("mediaPath") as string,
        startDate: (formData.get("startDate") as string) || undefined,
        endDate: (formData.get("endDate") as string) || undefined,
        startTime: (formData.get("startTime") as string) || undefined,
        endTime: (formData.get("endTime") as string) || undefined,
      },
    ],
  };
}

export async function deviceOperationAction(formData: FormData) {
  const token = await getApiToken();
  const cabinetid = formData.get("cabinetid") as string;
  const slotNum = Number(formData.get("slotNum"));
  const operationType = formData.get("operationType") as string;
  const reason = (formData.get("reason") as string) || "";

  await deviceOperation({ cabinetid, slotNum, operationType, reason }, token);
  revalidatePath("/devices");
  return { success: true };
}

export async function ejectByRepairAction(formData: FormData) {
  const token = await getApiToken();
  const cabinetid = formData.get("cabinetid") as string;
  const slotNum = Number(formData.get("slotNum"));

  await ejectByRepair({ cabinetid, slotNum }, token);
  revalidatePath("/devices");
  return { success: true };
}

export async function ejectByRentAction(formData: FormData) {
  const token = await getApiToken();
  const cabinetid = formData.get("cabinetid") as string;
  const rentOrderId = formData.get("rentOrderId") as string;
  const slotNum = Number(formData.get("slotNum"));

  await ejectByRent({ cabinetid, rentOrderId, slotNum }, token);
  revalidatePath("/devices");
  revalidatePath("/orders");
  return { success: true };
}

export async function bindDeviceAction(formData: FormData) {
  const token = await getApiToken();
  const qrcode = formData.get("qrcode") as string;
  const newShopId = formData.get("newShopId") as string;

  await bindDeviceToShop(qrcode, newShopId, token);
  revalidatePath("/devices");
  revalidatePath("/shops");
  return { success: true };
}

export async function unbindDeviceAction(deviceIds: string[]) {
  const token = await getApiToken();
  await unbindDeviceFromShop(deviceIds, token);
  revalidatePath("/devices");
  revalidatePath("/shops");
  return { success: true };
}

export async function updateCabinetAdAction(formData: FormData) {
  const token = await getApiToken();
  const payload = buildAdPayload(formData);

  await updateCabinetAd(payload, token);
  revalidatePath("/devices");
  return { success: true };
}

export async function publishCabinetAdAction(formData: FormData) {
  const token = await getApiToken();
  const payload = buildAdPayload(formData);

  await publishCabinetAd(payload, token);
  revalidatePath("/devices");
  return { success: true };
}

export async function fetchDeviceDetailAction(cabinetId: string) {
  const token = await getApiToken();
  try {
    const [detail, slots, batteries, openInfo] = await Promise.all([
      getCabinetDetail(cabinetId, token),
      getSlotList(cabinetId, token),
      getBatteryList(cabinetId, token),
      getOpenDeviceInfo(cabinetId, token).catch(() => null),
    ]);
    return { detail, slots, batteries, openInfo };
  } catch {
    return { detail: null, slots: null, batteries: null, openInfo: null };
  }
}
