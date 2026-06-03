import {
  MOCK_DEVICES,
  MOCK_DEVICE_INFO,
  MOCK_CABINET_LIST,
  MOCK_CABINET_BATTERIES,
  MOCK_CABINET_SLOTS,
  MOCK_SHOPS,
  MOCK_ORDERS,
  MOCK_PRICE_STRATEGIES,
  MOCK_TOKEN,
} from "./mock-data"
import { isDemoMode } from "./demo-mode"

const useMockData = isDemoMode()
const API_BASE_URL =
  process.env.BAJIE_API_URL || "https://developer.chargenow.top/cdb-open-api/v1"

const DEFAULT_OPEN_DEVICE_LIST_PARAMS = {
  coordType: process.env.BAJIE_COORD_TYPE || "gcj02",
  zoomLevel: process.env.BAJIE_ZOOM_LEVEL || "14",
  lat: process.env.BAJIE_DEFAULT_LAT || "40.758896",
  lng: process.env.BAJIE_DEFAULT_LNG || "-73.985130",
  showPrice: process.env.BAJIE_SHOW_PRICE || "true",
}

export type OpenDeviceListItem = (typeof MOCK_DEVICES.list)[number]
export type OpenDeviceInfo = typeof MOCK_DEVICE_INFO.data

export interface OpenDeviceListParams {
  coordType?: string
  zoomLevel?: string
  lat?: string
  lng?: string
  showPrice?: string
}

// ─── Helper: SHA256 hash for production password ─────────────────────
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// ─── Core fetch wrapper ──────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

// ─── Auth ────────────────────────────────────────────────────────────
export async function loginApi(
  username: string,
  password: string
): Promise<{ token: string; user: { id: string; name: string } }> {
  if (useMockData) {
    // Dev mode: accept any credentials
    return {
      token: MOCK_TOKEN,
      user: { id: "1001", name: username || "Demo Admin" },
    }
  }

  // Prod mode: call real Bajie OAuth2 API
  const hashedPassword = await sha256(password)
  const params = new URLSearchParams({ username, password: hashedPassword })

  const response = await fetch(
    `${API_BASE_URL}/oauth2/login?${params.toString()}`,
    { method: "POST" }
  )

  if (!response.ok) {
    throw new Error("Invalid credentials")
  }

  const data = await response.json()

  if (!data.key) {
    throw new Error("Invalid credentials")
  }

  return {
    token: data.key,
    user: { id: username, name: username },
  }
}

// ─── Devices (Open API) ──────────────────────────────────────────────
export async function getDeviceList(token?: string) {
  return getOpenDeviceList({}, token)
}

export async function getDeviceInfo(deviceId: string, token?: string) {
  return getOpenDeviceInfo(deviceId, token)
}

// ─── Cabinet (Advance API) ───────────────────────────────────────────

export type CabinetItem = (typeof MOCK_CABINET_LIST.data.list)[number]

// In-memory cabinet store for dev mode
let devCabinets = [...MOCK_CABINET_LIST.data.list]

// 1. Get all device list by page
export async function getAllDevicePage(
  params: { page?: number; limit?: number } = {},
  token?: string
) {
  if (useMockData) {
    const page = params.page || 1
    const limit = params.limit || 20
    const start = (page - 1) * limit
    const paged = devCabinets.slice(start, start + limit)
    return {
      msg: "success",
      code: 0,
      data: { total: devCabinets.length, page, limit, list: paged },
    }
  }
  const qs = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
  })
  return apiFetch(`/cabinet/getAllDevicePage?${qs}`, {}, token)
}

// 2. Query details based on Device Id
export async function getCabinetDetail(cabinetId: string, token?: string) {
  if (useMockData) {
    const cab = devCabinets.find((c) => c.cabinetId === cabinetId)
    return { msg: "success", code: 0, data: cab || null }
  }
  return apiFetch(`/cabinet/detail/${cabinetId}`, {}, token)
}

// 3. Get device list by shop id
export async function getDeviceByShopId(shopId: string, token?: string) {
  if (useMockData) {
    const list = devCabinets.filter((c) => c.shopId === shopId)
    return { msg: "success", code: 0, data: list }
  }
  return apiFetch(`/cabinet/getDeviceByShopId?shopid=${shopId}`, {}, token)
}

// 4. Query battery list based on Device Id
export async function getBatteryList(cabinetId: string, token?: string) {
  if (useMockData) {
    const batteries = MOCK_CABINET_BATTERIES[cabinetId] || []
    return { msg: "success", code: 0, data: batteries }
  }
  return apiFetch(`/cabinet/batteryListByCabinetId/${cabinetId}`, {}, token)
}

// 5. Query slot list based on Device Id
export async function getSlotList(cabinetId: string, token?: string) {
  if (useMockData) {
    const slots = MOCK_CABINET_SLOTS[cabinetId] || []
    return { msg: "success", code: 0, data: slots }
  }
  return apiFetch(`/cabinet/slotByCabinetId/${cabinetId}`, {}, token)
}

// 6. Device Operation (restart, pop, lock, unlock, etc.)
export async function deviceOperation(
  params: {
    cabinetid: string
    slotNum: number
    operationType: string
    reason?: string
  },
  token?: string
) {
  if (useMockData) {
    return {
      msg: `Operation '${params.operationType}' sent to ${params.cabinetid} slot ${params.slotNum}`,
      code: 0,
    }
  }
  const qs = new URLSearchParams({
    cabinetid: params.cabinetid,
    slotNum: String(params.slotNum),
    operationType: params.operationType,
    reason: params.reason || "",
  })
  return apiFetch(`/cabinet/operation?${qs}`, { method: "POST" }, token)
}

// 7. Rent and eject the battery for the specified device slot
export async function ejectByRent(
  params: { cabinetid: string; rentOrderId: string; slotNum: number },
  token?: string
) {
  if (useMockData) {
    return {
      msg: `Battery ejected from ${params.cabinetid} slot ${params.slotNum} for order ${params.rentOrderId}`,
      code: 0,
    }
  }
  const qs = new URLSearchParams({
    cabinetid: params.cabinetid,
    rentOrderId: params.rentOrderId,
    slotNum: String(params.slotNum),
  })
  return apiFetch(`/cabinet/ejectByRent?${qs}`, { method: "POST" }, token)
}

// 8. Eject the battery for the specified device slot by repair
export async function ejectByRepair(
  params: { cabinetid: string; slotNum: number },
  token?: string
) {
  if (useMockData) {
    return {
      msg: `Repair eject sent to ${params.cabinetid} slot ${params.slotNum}`,
      code: 0,
    }
  }
  const qs = new URLSearchParams({
    cabinetid: params.cabinetid,
    slotNum: String(params.slotNum),
  })
  return apiFetch(`/cabinet/ejectByRepair?${qs}`, { method: "POST" }, token)
}

// 9. Binding device to shop
export async function bindDeviceToShop(
  qrcode: string,
  newShopId: string,
  token?: string
) {
  if (useMockData) {
    devCabinets = devCabinets.map((c) =>
      c.cabinetId === qrcode ? { ...c, shopId: newShopId } : c
    )
    return { msg: "success", code: 0 }
  }
  return apiFetch(
    `/cabinet/bind2shop/${qrcode}/${newShopId}`,
    { method: "POST" },
    token
  )
}

// 10. Device unbound to merchant
export async function unbindDeviceFromShop(
  deviceIds: string[],
  token?: string
) {
  if (useMockData) {
    devCabinets = devCabinets.map((c) =>
      deviceIds.includes(c.cabinetId) ? { ...c, shopId: "", shopName: "" } : c
    )
    return { msg: "success", code: 0 }
  }
  return apiFetch(
    "/cabinet/unbindShop",
    { method: "POST", body: JSON.stringify(deviceIds) },
    token
  )
}

// 11. Update cabinet advertising information
export async function updateCabinetAd(
  payload: {
    cabinetIdList: string[]
    isRestart: boolean
    adConfigList: Array<{
      code: string
      mediaType: string
      mediaPath: string
      startDate?: string
      endDate?: string
      startTime?: string
      endTime?: string
    }>
  },
  token?: string
) {
  if (useMockData) {
    return {
      msg: `Ad updated for ${payload.cabinetIdList.length} cabinets`,
      code: 0,
    }
  }
  return apiFetch(
    "/cabinet/bindAd",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
}

// 12. Device advertisement publish
export async function publishCabinetAd(
  payload: {
    cabinetIdList: string[]
    isRestart: boolean
    adConfigList: Array<{
      code: string
      mediaType: string
      mediaPath: string
      startDate?: string
      endDate?: string
      startTime?: string
      endTime?: string
    }>
  },
  token?: string
) {
  if (useMockData) {
    return {
      msg: `Ad published to ${payload.cabinetIdList.length} cabinets`,
      code: 0,
    }
  }
  return apiFetch(
    "/cabinet/publishAd",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
}

// ─── Shops ───────────────────────────────────────────────────────────

// In-memory shop store for dev mode CRUD operations
let devShops = [...MOCK_SHOPS.data]
let devShopNextId = 100

export type ShopItem = (typeof MOCK_SHOPS.data)[number]

export interface CreateShopPayload {
  pNewid: string
  pName: string
  pSceneType?: number
  pStoreType?: number
  pAddress: string
  pJingdu: string
  pWeidu: string
  pAuditor?: number
  pContent?: string
  pCurrency?: string
  mobile?: string
  shopTime?: string
}

export async function getShopList(token?: string) {
  if (useMockData) return { ...MOCK_SHOPS, data: devShops }
  return apiFetch("/shop/getShopList", {}, token)
}

export async function getShopDetail(shopId: string, token?: string) {
  if (useMockData) {
    const shop = devShops.find((s) => s.newID === shopId)
    return { msg: "success", code: "200", data: shop || null }
  }
  return apiFetch(`/shop/detail/${shopId}`, {}, token)
}

export async function createShop(payload: CreateShopPayload, token?: string) {
  if (useMockData) {
    const newShop: ShopItem = {
      id: devShopNextId++,
      newID: payload.pNewid || `shop-${Date.now()}`,
      shopName: payload.pName,
      shopAddress: payload.pAddress,
      mobile: payload.mobile || "",
      batteryNum: "0",
      freeNum: "0",
      cabinetNum: 0,
      longitude: payload.pJingdu,
      latitude: payload.pWeidu,
      shopTime: payload.shopTime || "08:00-22:00",
      sceneType: String(payload.pSceneType || 0),
      sceneTypeDesc: "",
      pStoreType: String(payload.pStoreType || 0),
      pStoreCategory: "",
      infoStatus: "1",
      pMian: "5",
      pJifei: "0.50",
      pJifeiDanwei: "per hour",
      pFengding: "10.00",
      pYajin: "20.00",
      pCurrency: payload.pCurrency || "USD",
      currencyName: payload.pCurrency === "CNY" ? "Chinese Yuan" : "US Dollar",
      businessStatus: payload.pAuditor ?? 1,
      pContent: payload.pContent || "",
      shopBanner: "",
      shopIcon: "",
      cabinetIds: "",
    }
    devShops = [...devShops, newShop]
    return { msg: "success", code: "200", data: newShop }
  }
  return apiFetch(
    "/shop/create",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
}

export async function updateShop(
  payload: CreateShopPayload & { id?: number },
  token?: string
) {
  if (useMockData) {
    devShops = devShops.map((s) =>
      s.newID === payload.pNewid
        ? {
            ...s,
            shopName: payload.pName,
            shopAddress: payload.pAddress,
            longitude: payload.pJingdu,
            latitude: payload.pWeidu,
            pContent: payload.pContent || s.pContent,
            mobile: payload.mobile || s.mobile,
            shopTime: payload.shopTime || s.shopTime,
            sceneType: String(payload.pSceneType ?? s.sceneType),
            pCurrency: payload.pCurrency || s.pCurrency,
            businessStatus: payload.pAuditor ?? s.businessStatus,
          }
        : s
    )
    return { msg: "success", code: "200" }
  }
  return apiFetch(
    "/shop/update",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
}

export async function deleteShop(shopId: string, token?: string) {
  if (useMockData) {
    devShops = devShops.filter((s) => s.newID !== shopId)
    return { msg: "success", code: "200" }
  }
  return apiFetch(`/shop/delete?newID=${shopId}`, { method: "POST" }, token)
}

// ─── Orders ──────────────────────────────────────────────────────────
export async function getOrderList(
  params: {
    page?: number
    limit?: number
    dataLevel?: number
    sTime?: string
    eTime?: string
  } = {},
  token?: string
) {
  if (useMockData) {
    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const paged = MOCK_ORDERS.data.slice(start, start + limit)
    return {
      msg: "success",
      code: 0,
      data: paged,
      total: MOCK_ORDERS.data.length,
    }
  }
  const qs = new URLSearchParams()
  if (params.page) qs.append("page", String(params.page))
  if (params.limit) qs.append("limit", String(params.limit))
  if (params.dataLevel) qs.append("dataLevel", String(params.dataLevel))
  if (params.sTime) qs.append("sTime", params.sTime)
  if (params.eTime) qs.append("eTime", params.eTime)

  return apiFetch(`/order/list?${qs}`, {}, token)
}

// ─── Price Strategy (Advance API) ────────────────────────────────────

export type PriceStrategyItem =
  (typeof MOCK_PRICE_STRATEGIES.data.records)[number]

// In-memory price strategy store for dev mode
let devPriceStrategies = [...MOCK_PRICE_STRATEGIES.data.records]
let devPriceNextId = 100

// 1. Get Price Strategy Page
export async function getPriceStrategyPage(
  params: {
    size?: number
    current?: number
    shopId?: string
    priceId?: number
    name?: string
  } = {},
  token?: string
) {
  if (useMockData) {
    let filtered = [...devPriceStrategies]
    if (params.shopId)
      filtered = filtered.filter((p) => p.shopId === params.shopId)
    if (params.priceId)
      filtered = filtered.filter((p) => p.priceId === params.priceId)
    if (params.name)
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(params.name!.toLowerCase())
      )

    const size = params.size || 10
    const current = params.current || 1
    const start = (current - 1) * size
    const paged = filtered.slice(start, start + size)

    return {
      msg: "success",
      code: 0,
      data: { total: filtered.length, size, current, records: paged },
    }
  }
  return apiFetch(
    "/shop/priceStrategy/page",
    { method: "POST", body: JSON.stringify(params) },
    token
  )
}

// 2. Get Price Strategy Detail
export async function getPriceStrategyDetail(priceId: number, token?: string) {
  if (useMockData) {
    const found = devPriceStrategies.find((p) => p.priceId === priceId)
    return { msg: "success", code: 0, data: found || null }
  }
  return apiFetch(`/shop/priceStrategy/detail/${priceId}`, {}, token)
}

// 3. Create Or Update Price Strategy
export async function saveOrUpdatePriceStrategy(
  payload: {
    priceId?: number | null
    name: string
    type: number
    customType: number
    depositAmount: number
    timeoutAmount: number
    timeoutDay: number
    freeMinutes: number
    price: number
    priceTime: number
    priceUnit: number
    dailyMaxPrice: number
    shopId?: string
    priority?: number
    isDeposit?: boolean
    dayUseFreeCount?: number
    priceStrategyDetailList?: Array<{
      startMinute: number
      endMinute: number
      setcionFee: number
      totalFee: number
      seqno: number
    }>
  },
  token?: string
) {
  if (useMockData) {
    if (payload.priceId) {
      // Update
      devPriceStrategies = devPriceStrategies.map((p) =>
        p.priceId === payload.priceId
          ? { ...p, ...payload, priceId: payload.priceId }
          : p
      )
    } else {
      // Create
      const newStrategy = {
        ...payload,
        priceId: devPriceNextId++,
        shopId: payload.shopId || "",
        priority: payload.priority || 1,
        isDeposit: payload.isDeposit ?? true,
        dayUseFreeCount: payload.dayUseFreeCount || 1,
        priceStrategyDetailList: payload.priceStrategyDetailList || [],
      }
      devPriceStrategies.push(newStrategy as PriceStrategyItem)
    }
    return { msg: "success", code: 0 }
  }
  return apiFetch(
    "/shop/priceStrategy/saveOrUpdate",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
}

// 4. Delete Price Strategy
export async function deletePriceStrategy(priceIds: number[], token?: string) {
  if (useMockData) {
    devPriceStrategies = devPriceStrategies.filter(
      (p) => !priceIds.includes(p.priceId)
    )
    return { msg: "success", code: 0 }
  }
  return apiFetch(
    "/shop/priceStrategy/delete",
    { method: "POST", body: JSON.stringify(priceIds) },
    token
  )
}

// 5. Shop Bind Price Strategy
export async function bindShopPriceStrategy(
  payload: { shopId: string; priceId: number; customType: number },
  token?: string
) {
  if (useMockData) {
    devPriceStrategies = devPriceStrategies.map((p) =>
      p.priceId === payload.priceId ? { ...p, shopId: payload.shopId } : p
    )
    return { msg: "success", code: 0 }
  }
  return apiFetch(
    "/shop/priceStrategy/bindShop",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
}

// 6. Shop Unbind Price Strategy
export async function unbindShopPriceStrategy(
  payload: { shopId: string; customType: number },
  token?: string
) {
  if (useMockData) {
    devPriceStrategies = devPriceStrategies.map((p) =>
      p.shopId === payload.shopId ? { ...p, shopId: "" } : p
    )
    return { msg: "success", code: 0 }
  }
  return apiFetch(
    "/shop/priceStrategy/unbindShop",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
}

// ─── Open API ────────────────────────────────────────────────

// export async function oauth2Login(username: string, passwordHash: string) {
//   if (useMockData) {
//     return { key: { access_token: MOCK_TOKEN } };
//   }
//   return apiFetch(`/oauth2/login?username=${username}&password=${passwordHash}`, {
//     method: "POST"
//   });
// }

export async function getOpenDeviceList(
  params: OpenDeviceListParams = {},
  token?: string
) {
  if (useMockData) return MOCK_DEVICES

  const qs = new URLSearchParams({
    ...DEFAULT_OPEN_DEVICE_LIST_PARAMS,
    ...params,
  }).toString()
  return apiFetch(`/rent/cabinet/list?${qs}`, { method: "POST" }, token)
}

export async function getOpenDeviceInfo(deviceId: string, token?: string) {
  if (useMockData) return MOCK_DEVICE_INFO

  return apiFetch(
    `/rent/cabinet/query?deviceId=${deviceId}`,
    { method: "GET" },
    token
  )
}

export async function createRentOrder(
  deviceId: string,
  callbackURL: string,
  token?: string
) {
  if (useMockData) {
    return { msg: "success", code: 0, data: { tradeNo: `TRADE-${Date.now()}` } }
  }
  return apiFetch(
    `/rent/order/create?deviceId=${deviceId}&callbackURL=${encodeURIComponent(callbackURL)}`,
    { method: "POST" },
    token
  )
}

export async function queryRentOrderStatus(tradeNo: string, token?: string) {
  if (useMockData) {
    const { getRentCallbackStatus } = await import("./webhook-events")
    const callback = getRentCallbackStatus(tradeNo)
    return {
      msg: "success",
      code: 0,
      data: { status: callback?.status ?? 1 },
    }
  }
  return apiFetch(
    `/rent/order/query?tradeNo=${tradeNo}`,
    { method: "POST" },
    token
  )
}

export async function markOrderCompleted(tradeNo: string, token?: string) {
  if (useMockData) {
    return { msg: "success", code: 0 }
  }
  return apiFetch(
    `/rent/order/close?tradeNo=${tradeNo}`,
    { method: "POST" },
    token
  )
}

export async function getOrderDetail(tradeNo: string, token?: string) {
  if (useMockData) {
    return {
      msg: "success",
      code: 0,
      data: {
        cabinetId: "BJH02347",
        orderId: tradeNo,
        batteryId: "BAT-001",
        dailyMaxPrice: 10,
        freeMinutes: 5,
        orderAmount: 2,
        borrowTime: new Date().toISOString(),
        price: 0.5,
        currency: "USD",
        deviceType: "8-slot",
        priceMinute: "1",
        borrowSlot: 1,
        returnTime: "",
        borrowStatus: 1, // 1 = Under lease
        deposit: 20,
      },
    }
  }
  return apiFetch(
    `/rent/order/detail?tradeNo=${tradeNo}`,
    { method: "GET" },
    token
  )
}

// ─── Cabinet Event Push ──────────────────────────────────────

let devEventPushConfig = {
  pushUrl: "https://example.com/webhook",
  eventSubscriptions: [
    { event: "CABINET_ONLINE", pushUrl: "", enable: true },
    { event: "CABINET_OFFLINE", pushUrl: "", enable: true },
    { event: "CABINET_STATUS", pushUrl: "", enable: true },
    { event: "BATTERY_IN", pushUrl: "", enable: true },
    { event: "BATTERY_BORROW_OUT", pushUrl: "", enable: true },
    { event: "BATTERY_ABNORMAL_WARNING", pushUrl: "", enable: true },
    { event: "BATTERY_POPUP", pushUrl: "", enable: true },
    { event: "POS_INFO_STATUS", pushUrl: "", enable: true },
  ],
}

export async function getEventPushConfig(token?: string) {
  if (useMockData) {
    return { code: 0, msg: "success", data: devEventPushConfig }
  }
  return apiFetch("/cabinet/eventPush/config/get", { method: "GET" }, token)
}

export async function setEventPushConfig(
  payload: typeof devEventPushConfig,
  token?: string
) {
  if (useMockData) {
    devEventPushConfig = payload
    return { code: 0, msg: "success", data: devEventPushConfig }
  }
  return apiFetch(
    "/cabinet/eventPush/config",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
}
