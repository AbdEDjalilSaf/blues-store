import { API_BASE_URL, ApiError, formatPrice } from './api';

/**
 * Client order tracking API layer — `GET /api/orders/track`.
 *
 * Kept in its own module (not `ordersApi.ts`) so the admin bundle never pulls
 * in client-only code, and vice versa — Vite splits this into its own chunk
 * together with the lazy OrderTracker component.
 *
 * Performance notes:
 * - Small module-level memory cache (5min TTL, 20 entries) for repeated lookups
 * - Concurrent requests for the same phone+order_number are de-duped
 * - Every request is abortable and timeboxed (15s timeout for quick UX)
 */

export const TRACKING_ENDPOINT = `${API_BASE_URL}/api/orders/track`;

/** The exact status enum from the backend. */
export const TRACKING_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export type TrackingStatus = (typeof TRACKING_STATUSES)[number];

/** Arabic labels for tracking UI. */
export const TRACKING_STATUS_LABELS: Record<TrackingStatus, string> = {
  pending: 'جديد',
  confirmed: 'مؤكّد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغى',
};

export interface TrackingItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
}

export interface TrackingTimelineEntry {
  status: TrackingStatus;
  changed_at: string;
}

export interface TrackedOrder {
  order_number: string;
  status: TrackingStatus;
  timeline: TrackingTimelineEntry[];
  items: TrackingItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
}

export interface TrackingQuery {
  phone: string;
  order_number: string;
  signal?: AbortSignal;
}

const REQUEST_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 300_000; // 5 minutes
const MAX_CACHE_ENTRIES = 20;

/* ------------------------------------------------------------- memory cache */

interface CacheEntry {
  order: TrackedOrder;
  expiresAt: number;
}

const trackingCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<TrackedOrder>>();

function cacheKey(phone: string, orderNumber: string): string {
  return `${phone}|${orderNumber}`;
}

export function invalidateTrackingCache(): void {
  trackingCache.clear();
}

/* ----------------------------------------------------------- response parse */

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeStatus(value: unknown): TrackingStatus {
  return TRACKING_STATUSES.includes(value as TrackingStatus) ? (value as TrackingStatus) : 'pending';
}

function parseItem(raw: unknown): TrackingItem | null {
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

function parseTimelineEntry(raw: unknown): TrackingTimelineEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.status !== 'string') return null;
  return { status: normalizeStatus(r.status), changed_at: String(r.changed_at ?? '') };
}

export function parseTrackedOrder(raw: unknown): TrackedOrder | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  // More lenient validation - allow order_number to be any string-like value
  const orderNumber = r.order_number ?? r.orderNumber;
  if (!orderNumber || typeof orderNumber !== 'string') return null;

  return {
    order_number: orderNumber,
    status: normalizeStatus(r.status),
    timeline: Array.isArray(r.timeline)
      ? r.timeline.map(parseTimelineEntry).filter((x): x is TrackingTimelineEntry => x !== null)
      : [],
    items: Array.isArray(r.items) ? r.items.map(parseItem).filter((x): x is TrackingItem => x !== null) : [],
    subtotal: toNumber(r.subtotal),
    shipping_fee: toNumber(r.shipping_fee),
    total: toNumber(r.total),
  };
}

async function readErrorMessage(response: Response, action: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    if (firstFieldError) return firstFieldError;
    if (body?.message) return body.message;
  } catch {
    /* non-JSON error body — fall through */
  }
  if (response.status === 404) return 'لم نجد طلباً بهذه البيانات. تأكد من رقم الجوال ورقم الطلب.';
  if (response.status === 422) return 'بيانات غير صالحة. تأكد من إدخال رقم جوال جزائري صحيح (يبدأ بـ 05، 06، أو 07).';
  if (response.status === 429) return 'طلبات كثيرة جداً. انتظر قليلاً ثم حاول مرة أخرى.';
  return `${action} (رمز ${response.status}).`;
}

/* ----------------------------------------------------------------- fetching */

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

async function requestTracking(phone: string, orderNumber: string, external?: AbortSignal): Promise<TrackedOrder> {
  const { signal, dispose } = createRequestSignal(external);

  const url = new URL(TRACKING_ENDPOINT);
  url.searchParams.set('phone', phone);
  url.searchParams.set('order_number', orderNumber);

  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' }, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (external?.aborted) throw err;
      throw new ApiError('استغرق البحث وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  } finally {
    dispose();
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, 'فشل تتبع الطلب'), response.status);
  }

  try {
    const body = await response.json();
    // Handle both direct response and wrapped response
    const orderData = body && typeof body === 'object' && 'data' in body
      ? (body as { data: unknown }).data
      : body;

    // Log for debugging
    console.log('Tracking API response:', body);

    const order = parseTrackedOrder(orderData);
    if (!order) throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
    return order;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error('Failed to parse tracking response:', err);
    throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
  }
}

/**
 * Track an order by phone number and order number. Served from the memory cache
 * when fresh; identical concurrent calls share one network request.
 */
export function trackOrder(query: TrackingQuery): Promise<TrackedOrder> {
  const phone = query.phone.trim();
  const orderNumber = query.order_number.trim();
  const key = cacheKey(phone, orderNumber);

  const hit = trackingCache.get(key);
  if (hit && hit.expiresAt > Date.now()) return Promise.resolve(hit.order);

  const existing = inflight.get(key);
  if (existing && !query.signal) return existing;

  const request = requestTracking(phone, orderNumber, query.signal).then(
    (order) => {
      trackingCache.set(key, { order, expiresAt: Date.now() + CACHE_TTL_MS });
      while (trackingCache.size > MAX_CACHE_ENTRIES) {
        const oldest = trackingCache.keys().next().value;
        if (oldest === undefined) break;
        trackingCache.delete(oldest);
      }
      return order;
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
