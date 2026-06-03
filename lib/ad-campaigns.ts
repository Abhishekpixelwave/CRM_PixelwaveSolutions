export type AdCampaignStatus = "draft" | "scheduled" | "live" | "ended"

export type AdCampaign = {
  id: string
  name: string
  advertiser: string
  marketId: string
  mediaType: "image" | "video" | "programSheet"
  mediaPath: string
  code: string
  slotCount: number
  startDate: string
  endDate: string
  status: AdCampaignStatus
  cabinetIds: string[]
  createdAt: string
  publishedAt?: string
}

export const MOCK_AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: "ad-001",
    name: "OpenAI Bay Area Launch",
    advertiser: "OpenAI",
    marketId: "bay-area",
    mediaType: "image",
    mediaPath: "https://cdn.example.com/ads/openai-bay-area.jpg",
    code: "P_GG_8_TYPE,0",
    slotCount: 8,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "live",
    cabinetIds: [],
    createdAt: "2026-05-28T10:00:00Z",
    publishedAt: "2026-06-01T08:00:00Z",
  },
  {
    id: "ad-002",
    name: "NYC Summer Promo",
    advertiser: "Boost",
    marketId: "new-york",
    mediaType: "image",
    mediaPath: "https://cdn.example.com/ads/boost-nyc-summer.jpg",
    code: "P_GG_8_TYPE,0",
    slotCount: 8,
    startDate: "2026-06-15",
    endDate: "2026-08-31",
    status: "scheduled",
    cabinetIds: [],
    createdAt: "2026-06-01T12:00:00Z",
  },
]

let devCampaigns = [...MOCK_AD_CAMPAIGNS]
let devCampaignNextId = 100

export function getAdCampaigns() {
  return devCampaigns
}

export function getAdCampaign(id: string) {
  return devCampaigns.find((c) => c.id === id)
}

export function createAdCampaign(
  payload: Omit<AdCampaign, "id" | "createdAt" | "status" | "cabinetIds"> & {
    cabinetIds?: string[]
    status?: AdCampaignStatus
  }
) {
  const campaign: AdCampaign = {
    ...payload,
    id: `ad-${devCampaignNextId++}`,
    status: payload.status ?? "draft",
    cabinetIds: payload.cabinetIds ?? [],
    createdAt: new Date().toISOString(),
  }
  devCampaigns = [campaign, ...devCampaigns]
  return campaign
}

export function updateAdCampaign(
  id: string,
  updates: Partial<
    Pick<
      AdCampaign,
      | "name"
      | "advertiser"
      | "marketId"
      | "mediaType"
      | "mediaPath"
      | "code"
      | "startDate"
      | "endDate"
      | "status"
      | "cabinetIds"
      | "publishedAt"
    >
  >
) {
  devCampaigns = devCampaigns.map((c) =>
    c.id === id ? { ...c, ...updates } : c
  )
  return devCampaigns.find((c) => c.id === id)
}

export function deleteAdCampaign(id: string) {
  devCampaigns = devCampaigns.filter((c) => c.id !== id)
}
