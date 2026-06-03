import { parseStateFromAddress } from "./shop-location"

export type Market = {
  id: string
  name: string
  states: string[]
  cityKeywords: string[]
}

export const MARKETS: Market[] = [
  {
    id: "bay-area",
    name: "Bay Area",
    states: ["CA"],
    cityKeywords: [
      "San Francisco",
      "Oakland",
      "San Jose",
      "Berkeley",
      "Palo Alto",
      "Fremont",
      "Bay Area",
    ],
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    states: ["CA"],
    cityKeywords: ["Los Angeles", "Hollywood", "Santa Monica", "Pasadena"],
  },
  {
    id: "new-york",
    name: "New York Metro",
    states: ["NY", "NJ"],
    cityKeywords: ["New York", "Manhattan", "Brooklyn", "Queens", "Times Square"],
  },
  {
    id: "chicago",
    name: "Chicago",
    states: ["IL"],
    cityKeywords: ["Chicago", "O'Hare"],
  },
  {
    id: "miami",
    name: "Miami",
    states: ["FL"],
    cityKeywords: ["Miami", "Bayfront", "Biscayne"],
  },
  {
    id: "midwest",
    name: "Midwest",
    states: ["IL", "OH", "MI", "WI", "MN"],
    cityKeywords: [],
  },
  {
    id: "south",
    name: "South",
    states: ["FL", "TX", "GA", "NC", "LA"],
    cityKeywords: [],
  },
]

export function shopMatchesMarket(
  shopAddress: string,
  marketId: string
): boolean {
  const market = MARKETS.find((m) => m.id === marketId)
  if (!market) return false

  const state = parseStateFromAddress(shopAddress)
  if (!market.states.includes(state)) return false

  if (market.cityKeywords.length === 0) return true

  const lower = shopAddress.toLowerCase()
  return market.cityKeywords.some((kw) => lower.includes(kw.toLowerCase()))
}

export function getMarketName(marketId: string): string {
  return MARKETS.find((m) => m.id === marketId)?.name ?? marketId
}

export type ShopLike = { newID: string; shopAddress: string; shopName: string }

export type CabinetLike = { cabinetId: string; shopId: string; shopName?: string }

export function getCabinetIdsForMarket(
  marketId: string,
  shops: ShopLike[],
  cabinets: CabinetLike[]
): string[] {
  const shopIds = new Set(
    shops
      .filter((s) => shopMatchesMarket(s.shopAddress, marketId))
      .map((s) => s.newID)
  )
  return cabinets
    .filter((c) => shopIds.has(c.shopId))
    .map((c) => c.cabinetId)
}

export function getShopsForMarket(marketId: string, shops: ShopLike[]) {
  return shops.filter((s) => shopMatchesMarket(s.shopAddress, marketId))
}
