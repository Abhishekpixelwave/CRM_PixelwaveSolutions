import { isDemoMode } from "./demo-mode"

export type RevenueSharePartner = {
  id: string
  shopId: string
  shopName: string
  clientName: string
  clientEmail: string
  sharePercent: number
  payoutMethod: "ach" | "wire" | "paypal"
  totalPaidOut: number
}

export type RevenueSharePayout = {
  id: string
  partnerId: string
  amount: number
  paidAt: string
  note: string
}

export const MOCK_REVENUE_SHARE_PARTNERS: RevenueSharePartner[] = [
  {
    id: "rsp-001",
    shopId: "shop-001",
    shopName: "Times Square Station",
    clientName: "Metro Retail Group",
    clientEmail: "billing@metroretail.com",
    sharePercent: 10,
    payoutMethod: "ach",
    totalPaidOut: 0,
  },
  {
    id: "rsp-002",
    shopId: "shop-002",
    shopName: "Ferry Building Station",
    clientName: "Bay Area Hospitality LLC",
    clientEmail: "finance@bayareahosp.com",
    sharePercent: 10,
    payoutMethod: "wire",
    totalPaidOut: 0,
  },
  {
    id: "rsp-003",
    shopId: "shop-003",
    shopName: "O'Hare Terminal 3",
    clientName: "Airport Concessions Inc",
    clientEmail: "ap@airportcon.com",
    sharePercent: 10,
    payoutMethod: "ach",
    totalPaidOut: 0,
  },
  {
    id: "rsp-004",
    shopId: "shop-004",
    shopName: "Bayfront Station",
    clientName: "Coastal Transit Partners",
    clientEmail: "payments@coastaltransit.com",
    sharePercent: 10,
    payoutMethod: "paypal",
    totalPaidOut: 0,
  },
]

let devPartners = [...MOCK_REVENUE_SHARE_PARTNERS]
let devPayouts: RevenueSharePayout[] = []
let devPayoutNextId = 1
let devPartnerNextId = 100

function refreshStaleDevPartners() {
  if (!isDemoMode()) return
  const hasLegacyPaidOut = devPartners.some(
    (p) => p.id === "rsp-001" && p.totalPaidOut >= 420
  )
  const hasLegacyShare = devPartners.some((p) => p.sharePercent > 15)
  if (hasLegacyPaidOut || hasLegacyShare) {
    devPartners = [...MOCK_REVENUE_SHARE_PARTNERS]
    devPayouts = []
    devPayoutNextId = 1
    devPartnerNextId = 100
  }
}

export function getRevenueSharePartners() {
  refreshStaleDevPartners()
  return devPartners
}

export function createRevenueSharePartner(payload: {
  shopId: string
  shopName: string
  clientName: string
  clientEmail: string
  sharePercent: number
  payoutMethod: "ach" | "wire" | "paypal"
}) {
  if (devPartners.some((p) => p.shopId === payload.shopId)) {
    return null
  }
  const partner: RevenueSharePartner = {
    id: `rsp-${devPartnerNextId++}`,
    shopId: payload.shopId,
    shopName: payload.shopName,
    clientName: payload.clientName,
    clientEmail: payload.clientEmail,
    sharePercent: payload.sharePercent,
    payoutMethod: payload.payoutMethod,
    totalPaidOut: 0,
  }
  devPartners = [...devPartners, partner]
  return partner
}

export function getAllRevenueSharePayouts() {
  return devPayouts
}

export function updateRevenueSharePartner(
  id: string,
  updates: Partial<
    Pick<
      RevenueSharePartner,
      "sharePercent" | "clientName" | "clientEmail" | "payoutMethod"
    >
  >
) {
  devPartners = devPartners.map((p) =>
    p.id === id ? { ...p, ...updates } : p
  )
  return devPartners.find((p) => p.id === id)
}

export function recordRevenueSharePayout(
  partnerId: string,
  amount: number,
  note: string
) {
  const partner = devPartners.find((p) => p.id === partnerId)
  if (!partner) return null

  const payout: RevenueSharePayout = {
    id: `pay-${devPayoutNextId++}`,
    partnerId,
    amount,
    paidAt: new Date().toISOString(),
    note,
  }
  devPayouts.unshift(payout)
  devPartners = devPartners.map((p) =>
    p.id === partnerId
      ? { ...p, totalPaidOut: p.totalPaidOut + amount }
      : p
  )
  return payout
}

export function getRevenueSharePayouts(partnerId?: string) {
  if (!partnerId) return devPayouts
  return devPayouts.filter((p) => p.partnerId === partnerId)
}

export function computePartnerRevenue(
  partner: RevenueSharePartner,
  orders: Array<{ shopName: string; amount: string; shopId?: string }>
) {
  const gross = orders
    .filter(
      (o) =>
        o.shopName === partner.shopName ||
        (o.shopId && o.shopId === partner.shopId)
    )
    .reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0)
  const partnerShare = (gross * partner.sharePercent) / 100
  const platformShare = gross - partnerShare
  const pending = Math.max(0, partnerShare - partner.totalPaidOut)

  return {
    gross: Math.round(gross * 100) / 100,
    partnerShare: Math.round(partnerShare * 100) / 100,
    platformShare: Math.round(platformShare * 100) / 100,
    pending: Math.round(pending * 100) / 100,
  }
}
