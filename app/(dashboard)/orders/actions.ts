"use server";

import {
  getOrderDetail,
  queryRentOrderStatus,
  markOrderCompleted,
  createRentOrder,
  ejectByRent,
} from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import { revalidatePath } from "next/cache";

export async function fetchOrderDetailAction(tradeNo: string) {
  const token = await getApiToken();
  return getOrderDetail(tradeNo, token);
}

export async function queryRentOrderStatusAction(tradeNo: string) {
  const token = await getApiToken();
  return queryRentOrderStatus(tradeNo, token);
}

export async function markOrderCompletedAction(tradeNo: string) {
  const token = await getApiToken();
  await markOrderCompleted(tradeNo, token);
  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true };
}

export async function createRentOrderAction(formData: FormData) {
  const token = await getApiToken();
  const deviceId = formData.get("deviceId") as string;
  const callbackURL = formData.get("callbackURL") as string;

  const result = await createRentOrder(deviceId, callbackURL, token);
  revalidatePath("/orders");
  revalidatePath("/");
  return result;
}

export async function ejectByRentOrderAction(formData: FormData) {
  const token = await getApiToken();
  const cabinetid = formData.get("cabinetid") as string;
  const rentOrderId = formData.get("rentOrderId") as string;
  const slotNum = Number(formData.get("slotNum"));

  await ejectByRent({ cabinetid, rentOrderId, slotNum }, token);
  revalidatePath("/orders");
  revalidatePath("/devices");
  return { success: true };
}

export async function fetchRentCallbackAction(tradeNo: string) {
  const { getRentCallbackStatus } = await import("@/lib/webhook-events");
  return getRentCallbackStatus(tradeNo);
}
