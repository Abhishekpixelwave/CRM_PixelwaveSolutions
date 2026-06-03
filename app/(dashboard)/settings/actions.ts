"use server";

import { getEventPushConfig, setEventPushConfig } from "@/lib/api-client";
import { getApiToken } from "@/lib/get-api-token";
import {
  clearWebhookEvents,
  getCabinetEvents,
  getRentCallbacks,
} from "@/lib/webhook-events";
import { revalidatePath } from "next/cache";

export async function fetchEventPushConfigAction() {
  const token = await getApiToken();
  return getEventPushConfig(token);
}

export async function saveEventPushConfigAction(payload: {
  pushUrl: string;
  eventSubscriptions: Array<{
    event: string;
    pushUrl: string;
    enable: boolean;
  }>;
}) {
  const token = await getApiToken();
  const result = await setEventPushConfig(payload, token);
  revalidatePath("/settings");
  return result;
}

export async function fetchWebhookEventsAction() {
  return {
    cabinet: getCabinetEvents(),
    rent: getRentCallbacks(),
  };
}

export async function clearWebhookEventsAction(type?: "cabinet" | "rent") {
  clearWebhookEvents(type);
  revalidatePath("/settings");
  return { success: true };
}
