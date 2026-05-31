"use server";

import {
  deviceOperation,
  ejectByRepair,
  bindDeviceToShop,
  unbindDeviceFromShop,
} from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function deviceOperationAction(formData: FormData) {
  const cabinetid = formData.get("cabinetid") as string;
  const slotNum = Number(formData.get("slotNum"));
  const operationType = formData.get("operationType") as string;
  const reason = (formData.get("reason") as string) || "";

  await deviceOperation({ cabinetid, slotNum, operationType, reason });
  revalidatePath("/devices");
  return { success: true };
}

export async function ejectByRepairAction(formData: FormData) {
  const cabinetid = formData.get("cabinetid") as string;
  const slotNum = Number(formData.get("slotNum"));

  await ejectByRepair({ cabinetid, slotNum });
  revalidatePath("/devices");
  return { success: true };
}

export async function bindDeviceAction(formData: FormData) {
  const qrcode = formData.get("qrcode") as string;
  const newShopId = formData.get("newShopId") as string;

  await bindDeviceToShop(qrcode, newShopId);
  revalidatePath("/devices");
  return { success: true };
}

export async function unbindDeviceAction(deviceIds: string[]) {
  await unbindDeviceFromShop(deviceIds);
  revalidatePath("/devices");
  return { success: true };
}
