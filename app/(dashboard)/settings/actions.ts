"use server"

import { getEventPushConfig, setEventPushConfig } from "@/lib/api-client"
import { revalidatePath } from "next/cache"

export async function fetchEventPushConfigAction() {
  return getEventPushConfig()
}

export async function saveEventPushConfigAction(payload: any) {
  const result = await setEventPushConfig(payload)
  revalidatePath("/settings")
  return result
}
