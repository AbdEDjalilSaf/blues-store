import { API_BASE_URL, ApiError } from './api';

/**
 * Admin orders API layer — `GET /api/admin/orders` (server-paginated) and
 * `PATCH /api/admin/orders/{id}/status` (verified live against the backend).
 *
 * Kept in its own module (not `api.ts`) so the storefront bundle never pulls
 * in admin-only code, and vice versa — Vite splits this into its own chunk
 * together with the lazy OrdersPage.
 *
 * Performance notes:
 * - A small module-level memory cache (30s TTL, 24 entries) makes tab/page
 *   switching instant — flipping back to a visited filter costs zero requests.
 * - Concurrent requests for the same `status|page|perPage` key are de-duped
 *   into a single in-flight promise.
 * - Every request is abortable and timeboxed; callers cancel stale requests
 *   when filters change so slow responses can never clobber fresh ones.
 */

export const ORDERS_ENDPOINT = `${API_BASE_URL}/api/admin/orders`;

/** The exact status enum accepted by the backend (probed via 422 validation). */
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Arabic labels shown in badges, tabs and the timeline. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'جديد',
  confirmed: 'مؤكّد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغى',
};

export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export interface AdminOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
}

export interface AdminOrderTimelineEntry {
  status: OrderStatus;
  changed_at: string;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  items: AdminOrderItem[];
  timeline: AdminOrderTimelineEntry[];
  created_at: string;
}

/** Laravel paginator fields, normalised to camelCase for the UI. */
export interface AdminOrdersMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AdminOrdersPage {
  orders: AdminOrder[];
  meta: AdminOrdersMeta;
}

export interface AdminOrdersQuery {
  /** `null`/omitted = all statuses (no `status` param sent). */
  status?: OrderStatus | null;
  page?: number;
  perPage?: number;
  /** Skip the memory cache and hit the network (refresh button). */
  force?: boolean;
  signal?: AbortSignal;
}

const REQUEST_TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 120_000; // 2 minutes for better perceived performance
const MAX_CACHE_ENTRIES = 50; // More cache entries for better hit rate

/* ------------------------------------------------------------- memory cache */

interface CacheEntry {
  page: AdminOrdersPage;
  expiresAt: number;
}

const pageCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<AdminOrdersPage>>();

function cacheKey(status: OrderStatus | null, page: number, perPage: number): string {
  return `${status ?? 'all'}|${page}|${perPage}`;
}

/** Every cached page is stale after a status change — drop them all. */
export function invalidateAdminOrdersCache(): void {
  pageCache.clear();
}

/* ----------------------------------------------------------- response parse */

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeStatus(value: unknown): OrderStatus {
  return isOrderStatus(value) ? value : 'pending';
}

function parseItem(raw: unknown): AdminOrderItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'number') return null;
  return {
    id: r.id,
    product_id: toNumber(r.product_id),
    product_name: String(r.product_name ?? ''),
    unit_price: toNumber(r.unit_price),
  };
}

function parseTimelineEntry(raw: unknown): AdminOrderTimelineEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.status !== 'string') return null;
  return { status: normalizeStatus(r.status), changed_at: String(r.changed_at ?? '') };
}

/** Defensive row parse — a malformed row never breaks the whole page. */
export function parseOrder(raw: unknown): AdminOrder | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'number') return null;
  return {
    id: r.id,
    order_number: String(r.order_number ?? `#${r.id}`),
    customer_name: String(r.customer_name ?? ''),
    phone: String(r.phone ?? ''),
    wilaya: String(r.wilaya ?? ''),
    subtotal: toNumber(r.subtotal),
    shipping_fee: toNumber(r.shipping_fee),
    total: toNumber(r.total),
    status: normalizeStatus(r.status),
    items: Array.isArray(r.items) ? r.items.map(parseItem).filter((x): x is AdminOrderItem => x !== null) : [],
    timeline: Array.isArray(r.timeline)
      ? r.timeline.map(parseTimelineEntry).filter((x): x is AdminOrderTimelineEntry => x !== null)
      : [],
    created_at: String(r.created_at ?? ''),
  };
}

function parseMeta(raw: unknown, requestedPage: number, requestedPerPage: number): AdminOrdersMeta {
  const m = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    currentPage: Math.max(1, toNumber(m.current_page, requestedPage)),
    lastPage: Math.max(1, toNumber(m.last_page, 1)),
    perPage: Math.max(1, toNumber(m.per_page, requestedPerPage)),
    total: Math.max(0, toNumber(m.total)),
    from: m.from == null ? null : toNumber(m.from),
    to: m.to == null ? null : toNumber(m.to),
  };
}

/** Pull the first usable message out of a Laravel `{ message, errors }` body. */
async function readErrorMessage(response: Response, action: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    if (firstFieldError) return firstFieldError;
    if (body?.message) return body.message;
  } catch {
    /* non-JSON error body — fall through */
  }
  if (response.status === 401 || response.status === 403) return 'غير مصرّح لك بتنفيذ هذه العملية.';
  if (response.status === 404) return 'الطلب غير موجود. ربما تم حذفه.';
  return `${action} (رمز ${response.status}).`;
}

/* ----------------------------------------------------------------- fetching */

/**
 * Timeboxed fetch signal that can also be cancelled from the outside. The
 * timeout always wins eventually; the external signal lets the caller drop a
 * response it no longer needs (filter/page changed mid-flight).
 */
function createRequestSignal(external?: AbortSignal): { signal: AbortSignal; dispose: () => void } {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener('abort', onExternalAbort, { once: true });
  }
  return {
    signal: controller.signal,
    dispose: () => {
      window.clearTimeout(timer);
      external?.removeEventListener('abort', onExternalAbort);
    },
  };
}

async function requestAdminOrders(
  status: OrderStatus | null,
  page: number,
  perPage: number,
  external?: AbortSignal
): Promise<AdminOrdersPage> {
  const { signal, dispose } = createRequestSignal(external);

  const url = new URL(ORDERS_ENDPOINT);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  if (status) url.searchParams.set('status', status);

  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' }, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // A caller-initiated cancel propagates so the UI can ignore it silently.
      if (external?.aborted) throw err;
      throw new ApiError('استغرق تحميل الطلبات وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  } finally {
    dispose();
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, 'فشل تحميل الطلبات'), response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
  }

  // Support both paginated response { data: [], meta: {} } and non-paginated response []
  let rows: unknown[];
  let meta: unknown;

  if (Array.isArray(body)) {
    // Non-paginated response: direct array
    rows = body;
    meta = null;
  } else if (body && typeof body === 'object' && 'data' in body) {
    // Paginated response: { data: [], meta: {} }
    const data = (body as { data: unknown }).data;
    rows = Array.isArray(data) ? data : [];
    meta = (body as { meta?: unknown }).meta;
  } else {
    rows = [];
    meta = null;
  }

  return {
    orders: rows.map(parseOrder).filter((x): x is AdminOrder => x !== null),
    meta: parseMeta(meta, page, perPage),
  };
}

/**
 * Fetch one page of admin orders. Served from the memory cache when fresh;
 * identical concurrent calls share one network request. The resolved page is
 * a frozen-in-time snapshot — mutate nothing, treat it as read-only.
 */
export function fetchAdminOrders(query: AdminOrdersQuery = {}): Promise<AdminOrdersPage> {
  const status = query.status ?? null;
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.max(1, query.perPage ?? 10);
  const key = cacheKey(status, page, perPage);

  if (query.force) {
    pageCache.delete(key);
  } else {
    const hit = pageCache.get(key);
    if (hit && hit.expiresAt > Date.now()) return Promise.resolve(hit.page);
    const existing = inflight.get(key);
    // A caller-provided signal belongs to that caller. Do not hand a
    // second component the same promise when the first caller may abort it
    // during React effect cleanup (StrictMode/navigation), otherwise both
    // callers receive AbortError and the page can remain on its skeleton.
    if (existing && !query.signal) return existing;
  }

  const request = requestAdminOrders(status, page, perPage, query.signal).then(
    (result) => {
      pageCache.set(key, { page: result, expiresAt: Date.now() + CACHE_TTL_MS });
      // Cheap FIFO eviction — LRU bookkeeping isn't worth the effort for 24 entries.
      while (pageCache.size > MAX_CACHE_ENTRIES) {
        const oldest = pageCache.keys().next().value;
        if (oldest === undefined) break;
        pageCache.delete(oldest);
      }
      return result;
    },
    (error) => {
      throw error;
    }
  );

  inflight.set(key, request);
  void request.finally(() => {
    if (inflight.get(key) === request) inflight.delete(key);
  }).catch(() => {
    /* rejection is delivered to the original caller; this is just cleanup */
  });

  return request;
}

/**
 * Change an order's status via `PATCH /api/admin/orders/{id}/status`.
 * Returns the refreshed order when the server sends one back, otherwise
 * `null` — callers should treat the update as done either way and refresh.
 * Invalidates the page cache on success so no page shows a stale status.
 */
export async function updateAdminOrderStatus(id: number, status: OrderStatus): Promise<AdminOrder | null> {
  const { signal, dispose } = createRequestSignal();

  let response: Response;
  try {
    response = await fetch(`${ORDERS_ENDPOINT}/${encodeURIComponent(String(id))}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ status }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('استغرق تحديث حالة الطلبات وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  } finally {
    dispose();
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, 'فشل تحديث حالة الطلب'), response.status);
  }

  invalidateAdminOrdersCache();

  try {
    const body = (await response.json()) as unknown;
    const raw =
      body && typeof body === 'object' && 'data' in body
        ? (body as { data: unknown }).data
        : body;
    return parseOrder(raw);
  } catch {
    // 204/empty body is fine — the caller refetches anyway.
    return null;
  }
}

/**
 * Ship an order via `POST /api/admin/orders/{id}/ship`.
 * Changes the order status from "confirmed" to "shipped".
 * Returns the updated order. Throws `ApiError` with Arabic messages
 * for 404 (order not found) and 422 (only confirmed orders can be shipped).
 * Invalidates the page cache on success so no page shows a stale order.
 */
export async function shipAdminOrder(id: number): Promise<AdminOrder> {
  const { signal, dispose } = createRequestSignal();

  let response: Response;
  try {
    response = await fetch(`${ORDERS_ENDPOINT}/${encodeURIComponent(String(id))}/ship`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('استغرق شحن الطلب وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  } finally {
    dispose();
  }

  if (response.status === 404) {
    throw new ApiError('الطلب غير موجود. ربما تم حذفه بالفعل.', response.status);
  }

  if (response.status === 422) {
    throw new ApiError('يمكن شحن الطلبات المؤكدة فقط.', response.status);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, 'فشل شحن الطلب'), response.status);
  }

  try {
    const body = await response.json();
    const order = parseOrder(body);
    if (!order) throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
    invalidateAdminOrdersCache();
    return order;
  } catch {
    throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
  }
}

/**
 * Deliver an order via `POST /api/admin/orders/{id}/deliver`.
 * Changes the order status from "shipped" to "delivered".
 * Returns the updated order. Throws `ApiError` with Arabic messages
 * for 404 (order not found) and 422 (only shipped orders can be delivered).
 * Invalidates the page cache on success so no page shows a stale order.
 */
export async function deliverAdminOrder(id: number): Promise<AdminOrder> {
  const { signal, dispose } = createRequestSignal();

  let response: Response;
  try {
    response = await fetch(`${ORDERS_ENDPOINT}/${encodeURIComponent(String(id))}/deliver`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('استغرق توصيل الطلب وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  } finally {
    dispose();
  }

  if (response.status === 404) {
    throw new ApiError('الطلب غير موجود. ربما تم حذفه بالفعل.', response.status);
  }

  if (response.status === 422) {
    throw new ApiError('يمكن توصيل الطلبات المشحونة فقط.', response.status);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, 'فشل توصيل الطلب'), response.status);
  }

  try {
    const body = await response.json();
    const order = parseOrder(body);
    if (!order) throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
    invalidateAdminOrdersCache();
    return order;
  } catch {
    throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
  }
}

/**
 * Delete an order via `DELETE /api/admin/orders/{id}`.
 * Returns `true` on success (204). Throws `ApiError` with Arabic messages
 * for 404 (order not found) and 422 (cannot delete shipped/delivered orders).
 * Invalidates the page cache on success so no page shows a stale order.
 */
export async function deleteAdminOrder(id: number): Promise<void> {
  const { signal, dispose } = createRequestSignal();

  let response: Response;
  try {
    response = await fetch(`${ORDERS_ENDPOINT}/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('استغرق حذف الطلب وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  } finally {
    dispose();
  }

  if (response.status === 404) {
    throw new ApiError('الطلب غير موجود. ربما تم حذفه بالفعل.', response.status);
  }

  if (response.status === 422) {
    throw new ApiError('لا يمكن حذف الطلبات التي تم شحنها أو توصيلها.', response.status);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, 'فشل حذف الطلب'), response.status);
  }

  invalidateAdminOrdersCache();
}
