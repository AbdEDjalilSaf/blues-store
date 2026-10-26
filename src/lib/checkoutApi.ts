import { API_BASE_URL, ApiError } from './api';

/**
 * Storefront checkout API — `POST /api/orders` (verified against the contract:
 * `{ customer_name, phone, wilaya_id, items: [{ product_id }] }` → the full
 * order with `order_number`, totals, items and timeline).
 *
 * Kept in its own module so it is only ever pulled into the lazy
 * `CheckoutModal` chunk — never the entry bundle and never the admin graph
 * (`ordersApi.ts` stays admin-only, and vice versa).
 *
 * Follows the shared fetch conventions of `api.ts`/`ordersApi.ts`: timeboxed
 * AbortController, `ApiError` with a human Arabic message, and Laravel
 * `{ message, errors }` unwrapping — here surfaced per-field so the form can
 * highlight the offending input on a 422.
 */

export const CREATE_ORDER_ENDPOINT = `${API_BASE_URL}/api/orders`;

/** The 69 official Algerian wilayas — `id` is the backend's `wilaya_id`. */
export interface Wilaya {
  id: number;
  name: string;
}

export const WILAYAS: readonly Wilaya[] = [
  { id: 1, name: 'أدرار' },
  { id: 2, name: 'الشلف' },
  { id: 3, name: 'الأغواط' },
  { id: 4, name: 'أم البواقي' },
  { id: 5, name: 'باتنة' },
  { id: 6, name: 'بجاية' },
  { id: 7, name: 'بسكرة' },
  { id: 8, name: 'بشار' },
  { id: 9, name: 'البليدة' },
  { id: 10, name: 'البويرة' },
  { id: 11, name: 'تمنراست' },
  { id: 12, name: 'تبسة' },
  { id: 13, name: 'تلمسان' },
  { id: 14, name: 'تيارت' },
  { id: 15, name: 'تيزي وزو' },
  { id: 16, name: 'الجزائر' },
  { id: 17, name: 'الجلفة' },
  { id: 18, name: 'جيجل' },
  { id: 19, name: 'سطيف' },
  { id: 20, name: 'سعيدة' },
  { id: 21, name: 'سكيكدة' },
  { id: 22, name: 'سيدي بلعباس' },
  { id: 23, name: 'عنابة' },
  { id: 24, name: 'قالمة' },
  { id: 25, name: 'قسنطينة' },
  { id: 26, name: 'المدية' },
  { id: 27, name: 'مستغانم' },
  { id: 28, name: 'المسيلة' },
  { id: 29, name: 'معسكر' },
  { id: 30, name: 'ورقلة' },
  { id: 31, name: 'وهران' },
  { id: 32, name: 'البيض' },
  { id: 33, name: 'إليزي' },
  { id: 34, name: 'برج بوعريريج' },
  { id: 35, name: 'بومرداس' },
  { id: 36, name: 'الطارف' },
  { id: 37, name: 'تندوف' },
  { id: 38, name: 'تيسمسيلت' },
  { id: 39, name: 'الوادي' },
  { id: 40, name: 'خنشلة' },
  { id: 41, name: 'سوق أهراس' },
  { id: 42, name: 'تيبازة' },
  { id: 43, name: 'ميلة' },
  { id: 44, name: 'عين الدفلى' },
  { id: 45, name: 'النعامة' },
  { id: 46, name: 'عين تموشنت' },
  { id: 47, name: 'غرداية' },
  { id: 48, name: 'غليزان' },
  { id: 49, name: 'تيميمون' },
  { id: 50, name: 'برج باجي مختار' },
  { id: 51, name: 'أولاد جلال' },
  { id: 52, name: 'بني عباس' },
  { id: 53, name: 'عين صالح' },
  { id: 54, name: 'عين قزام' },
  { id: 55, name: 'تقرت' },
  { id: 56, name: 'جانت' },
  { id: 57, name: 'المغير' },
  { id: 58, name: 'المنيعة' },
  { id: 59, name: 'آفلو' },
  { id: 60, name: 'بريكة' },
  { id: 61, name: 'قصر الشلالة' },
  { id: 62, name: 'مسعد' },
  { id: 63, name: 'عين وسارة' },
  { id: 64, name: 'بوسعادة' },
  { id: 65, name: 'الأبيض سيدي الشيخ' },
  { id: 66, name: 'القنطرة' },
  { id: 67, name: 'بئر العاتر' },
  { id: 68, name: 'قصر البخاري' },
  { id: 69, name: 'العريشة' },
];

export interface CreateOrderItemInput {
  product_id: number;
}

export interface CreateOrderInput {
  customer_name: string;
  phone: string;
  wilaya_id: number;
  /** One entry per unit — the contract's items carry no qty field. */
  items: CreateOrderItemInput[];
}

export interface CreatedOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
}

export interface CreatedOrderTimelineEntry {
  status: string;
  changed_at: string;
}

export interface CreatedOrder {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: string;
  items: CreatedOrderItem[];
  timeline: CreatedOrderTimelineEntry[];
  created_at: string;
}

/**
 * 422 with the backend's per-field messages so the checkout form can attach
 * them to the matching input instead of only toasting a generic failure.
 */
export class OrderValidationError extends ApiError {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>, message: string) {
    super(message, 422);
    this.name = 'OrderValidationError';
    this.fields = fields;
  }
}

/** Arabic replacement for the backend's (usually English) validation text. */
const FIELD_MESSAGES: Record<string, string> = {
  customer_name: 'فضلاً أدخل الاسم الكامل',
  phone: 'رقم الجوال غير صالح',
  wilaya_id: 'اختر الولاية',
  items: 'تعذّر معينة المنتجات المطلوبة. حدّث السلة وحاول مجدداً.',
};

const REQUEST_TIMEOUT_MS = 20_000;

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseItem(raw: unknown): CreatedOrderItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    id: toNumber(r.id),
    product_id: toNumber(r.product_id),
    product_name: String(r.product_name ?? ''),
    unit_price: toNumber(r.unit_price),
  };
}

/** Defensive parse of the POST response — a missing field never throws. */
function parseCreatedOrder(raw: unknown): CreatedOrder {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: toNumber(r.id),
    order_number: String(r.order_number ?? ''),
    customer_name: String(r.customer_name ?? ''),
    phone: String(r.phone ?? ''),
    wilaya: String(r.wilaya ?? ''),
    subtotal: toNumber(r.subtotal),
    shipping_fee: toNumber(r.shipping_fee),
    total: toNumber(r.total),
    status: typeof r.status === 'string' ? r.status : 'pending',
    items: Array.isArray(r.items) ? r.items.map(parseItem).filter((x): x is CreatedOrderItem => x !== null) : [],
    timeline: Array.isArray(r.timeline)
      ? r.timeline
          .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
          .map((x) => ({ status: String(x.status ?? ''), changed_at: String(x.changed_at ?? '') }))
      : [],
    created_at: String(r.created_at ?? ''),
  };
}

/**
 * Submit a COD order. Resolves with the server-created order (including the
 * `order_number` shown on the confirmation screen); rejects with
 * `OrderValidationError` on 422 or `ApiError` for everything else.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(CREATE_ORDER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('استغرق إرسال الطلب وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    interface ErrorBody {
      message?: string;
      errors?: Record<string, string[]>;
    }
    let body: ErrorBody | null = null;
    try {
      body = (await response.json()) as ErrorBody;
    } catch {
      /* non-JSON error body — fall through */
    }
    if (response.status === 422 && body?.errors) {
      const fields: Record<string, string> = {};
      for (const [key, messages] of Object.entries(body.errors)) {
        fields[key] = FIELD_MESSAGES[key] ?? messages?.[0] ?? 'قيمة غير صالحة';
      }
      const first = Object.values(fields)[0];
      throw new OrderValidationError(fields, first ?? 'راجع البيانات المدخلة وحاول مجدداً.');
    }
    throw new ApiError(body?.message ?? `فشل إرسال الطلب (رمز ${response.status}).`, response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
  }

  const raw =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;
  return parseCreatedOrder(raw);
}
