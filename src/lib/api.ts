export interface Product {
  id: number;
  name_ar: string;
  team: string;
  year: number;
  era: string;
  price: number;
  old_price?: number | null;
  image: string;
  sizes: string;
  condition: string;
  rarity: string;
  stock: number;
  rating: number;
  reviews_count: number;
  description_ar: string;
  category: string;
  featured: boolean;
  badge?: string | null;
  brand?: string | null;
}

export interface CartItem {
  product: Product;
  size: string;
  qty: number;
}

export interface Review {
  id: number;
  product_id: number;
  author: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface OrderLine {
  product_id: number;
  name: string;
  size: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  items: OrderLine[];
  total: number;
  status: string;
  created_at: string;
}

export function parseSizes(s: string): string[] {
  if (!s) return ['M', 'L', 'XL'];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

export function formatPrice(n: number): string {
  return `${Number(n).toLocaleString('en-US')} دج`;
}

/* --------------------------------------------------------------- API types */

export const API_BASE_URL = 'https://bluesstore-backend-2.onrender.com';
export const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products`;

export interface ApiProductImage {
  id: number;
  path: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  team: string;
  year: number;
  description: string;
  price: number;
  old_price: number | null;
  discount_percent: number;
  stock: number;
  in_stock: boolean;
  is_active: boolean;
  images: ApiProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ApiListResponse<T> {
  data: T[];
  links?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

/** Every failed catalog request throws this, so the UI only ever shows `message`. */
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Placeholder artwork used only while a product has no image of its own — the
 * seed catalog ships with an empty `images` array. Picked deterministically
 * from the team name so a grid of image-less products still looks varied.
 */
const PLACEHOLDER_IMAGES = [
  '/images/jersey-brazil.webp',
  '/images/jersey-argentina.webp',
  '/images/jersey-ajax.webp',
  '/images/jersey-milan.webp',
  '/images/jersey-barca.webp',
  '/images/jersey-liverpool.webp',
  '/images/jersey-france.webp',
  '/images/jersey-italy.webp',
];

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

function fallbackImage(team: string): string {
  return PLACEHOLDER_IMAGES[hashString(team || 'jersey') % PLACEHOLDER_IMAGES.length];
}

/** Turn a stored image path into a URL the browser can load. */
export function resolveImageUrl(path: string): string {
  const value = (path ?? '').trim();
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
  const clean = value.replace(/^\/+/, '');
  if (clean.startsWith('storage/')) return `${API_BASE_URL}/${clean}`;
  return `${API_BASE_URL}/storage/${clean}`;
}

function eraFromYear(year: number): string {
  const decade = Math.floor(Number(year) / 10) * 10;
  return Number.isFinite(decade) ? `عقد ${decade}` : 'غير محدّد';
}

/** Map an API row onto the shape the storefront components already speak. */
export function mapApiProduct(raw: ApiProduct, index: number): Product {
  const images = Array.isArray(raw.images) ? raw.images : [];
  const primary =
    images.find((img) => img.is_primary) ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
  const resolved = primary ? resolveImageUrl(primary.path) : '';
  const stock = Number(raw.stock) || 0;

  return {
    id: raw.id,
    name_ar: raw.name,
    team: raw.team,
    year: raw.year,
    era: eraFromYear(raw.year),
    price: Number(raw.price) || 0,
    old_price: raw.old_price != null ? Number(raw.old_price) : null,
    image: resolved || fallbackImage(raw.team),
    sizes: 'M,L,XL',
    condition: 'ممتاز',
    rarity: stock <= 2 ? 'نادر' : stock <= 5 ? 'محدود' : 'متوفر',
    stock,
    rating: 4.8,
    reviews_count: 0,
    description_ar: raw.description,
    category: 'منتخبات',
    featured: index < 4,
    badge: null,
    brand: null,
  };
}

/**
 * Fetch the catalog. Throws an {@link ApiError} with a user-facing Arabic
 * message for every failure mode (offline, timeout, non-2xx, bad JSON) so
 * callers only have to render `error.message`.
 */
export async function fetchProducts(): Promise<Product[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(PRODUCTS_ENDPOINT, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('استغرق تحميل المنتجات وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new ApiError(`فشل تحميل المنتجات من الخادم (رمز ${response.status}).`, response.status);
  }

  let body: ApiListResponse<ApiProduct>;
  try {
    body = (await response.json()) as ApiListResponse<ApiProduct>;
  } catch {
    throw new ApiError('استجابة غير صالحة من الخادم.', response.status);
  }

  const rows = Array.isArray(body.data) ? body.data : [];
  return rows
    .filter((row) => row && row.is_active !== false)
    .map((row, index) => mapApiProduct(row, index));
}
