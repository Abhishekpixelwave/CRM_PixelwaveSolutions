import { auth } from "@/auth"

export async function getApiToken(): Promise<string | undefined> {
  const session = await auth()
  return session?.user?.apiToken
}
