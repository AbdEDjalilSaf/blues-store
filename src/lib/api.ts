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

  url?: string;

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

  size: string | null;

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



/** Placeholder artwork used only while a product has no image of its own — the

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



/** Deterministic placeholder URL for a product without a loadable image. */

export function fallbackImage(team: string): string {

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

  const resolved = primary?.url?.trim() || (primary ? resolveImageUrl(primary.path) : '');

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

    sizes: raw.size?.trim() ? raw.size : 'M,L,XL',

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

 * Low-level catalog GET. Resolves the raw, unmodified API rows — including

 * inactive products — and throws an {@link ApiError} with a user-facing Arabic

 * message for every failure mode (offline, timeout, non-2xx, bad JSON), so

 * callers only ever have to render `error.message`.

 *

 * The storefront maps these downstream ({@link fetchProducts}); the admin panel

 * consumes the rows as-is so it can also manage inactive products.

 */

export async function fetchProductList(): Promise<ApiProduct[]> {

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

  return rows.filter((row): row is ApiProduct => Boolean(row));

}



/** Active-only, storefront-shaped catalog consumed by the shop components. */

export async function fetchProducts(): Promise<Product[]> {

  const rows = await fetchProductList();

  return rows

    .filter((row) => row.is_active !== false)

    .map((row, index) => mapApiProduct(row, index));

}



/**

 * Fetch a single product by ID or slug. Returns the raw API product with images.

 * Used by the admin dashboard for editing.

 */

export async function fetchProduct(idOrSlug: number | string): Promise<ApiProduct> {

  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);



  let response: Response;

  try {

    response = await fetch(`${PRODUCTS_ENDPOINT}/${encodeURIComponent(String(idOrSlug))}`, {

      headers: { Accept: 'application/json' },

      signal: controller.signal,

    });

  } catch (err) {

    if (err instanceof DOMException && err.name === 'AbortError') {

      throw new ApiError('استغرق تحميل المنتج وقتاً طويلاً. حاول مرة أخرى.');

    }

    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');

  } finally {

    clearTimeout(timer);

  }



  if (!response.ok) {

    if (response.status === 404) {

      throw new ApiError('المنتج غير موجود. ربما تم حذفه من الخادم.', response.status);

    }

    throw new ApiError(`فشل تحميل المنتج (رمز ${response.status}).`, response.status);

  }



  let body: ApiProduct | { data: ApiProduct };

  try {

    body = (await response.json()) as ApiProduct | { data: ApiProduct };

  } catch {

    throw new ApiError('استجابة غير صالحة من الخادم.', response.status);

  }



  const product =

    body && typeof body === 'object' && 'data' in body ? (body as { data: ApiProduct }).data : body;

  if (!product || typeof product !== 'object' || typeof (product as ApiProduct).id !== 'number') {

    throw new ApiError('استجابة غير صالحة من الخادم.', response.status);

  }

  return product as ApiProduct;

}



/* ----------------------------------------------------------- write types */



export interface CreateProductInput {

  name: string;

  slug: string;

  team: string;

  year: number;

  description: string;

  price: number;

  old_price?: number | null;

  stock: number;

  /** Comma-separated list of available sizes, e.g. `S,M,L,XL`. */

  size?: string | null;

  category_id?: number | null;

  is_active: boolean;

  /** New image uploads; existing rows keep their server-side images. */

  images?: File[];

}



/**

 * Pull the most useful message out of a Laravel error response:

 * `{ message, errors: { field: [msg, …] } }`. Falls back to a status-based

 * Arabic message so the UI always has something human to show.

 */

async function readErrorMessage(response: Response, action: string): Promise<string> {

  try {

    const body = (await response.json()) as {

      message?: string;

      errors?: Record<string, string[]>;

    };

    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;

    if (firstFieldError) return firstFieldError;

    if (body?.message) return body.message;

  } catch {

    /* non-JSON error body — fall through to the status-based message */

  }

  if (response.status === 422) return 'بيانات المنتج غير صالحة. تحقّق من الحقول المطلوبة.';

  if (response.status === 404) return 'المنتج غير موجود. ربما تم حذفه من الخادم.';

  if (response.status === 401 || response.status === 403) return 'غير مصرّح لك بتنفيذ هذه العملية.';

  if (response.status === 413) return 'حجم الصور كبير جداً، حاول اختيار ملفات أصغر.';

  return `${action} (رمز ${response.status}).`;

}



/** Shared multipart body for create/update; `images[]` only when files are picked. */

function buildProductForm(input: CreateProductInput): FormData {

  const form = new FormData();

  form.append('name', input.name);

  form.append('slug', input.slug);

  form.append('team', input.team);

  form.append('year', String(input.year));

  form.append('description', input.description);

  form.append('price', String(input.price));

  form.append('stock', String(input.stock));

  form.append('is_active', input.is_active ? '1' : '0');

  if (input.size != null && input.size.trim()) {

    form.append('size', input.size.trim());

  }

  if (input.old_price != null && Number.isFinite(input.old_price)) {

    form.append('old_price', String(input.old_price));

  }

  if (input.category_id != null && Number.isFinite(input.category_id)) {

    form.append('category_id', String(input.category_id));

  }

  for (const file of input.images ?? []) {

    form.append('images[]', file);

  }

  return form;

}



/** POST/PATCH shared fetch: multipart body, timeout, envelope, Arabic errors. */

async function sendProductForm(

  url: string,

  method: 'POST' | 'PATCH',

  form: FormData,

  opts: { timeoutLabel: string; failureAction: string; parseError: string; invalidError: string }

): Promise<ApiProduct> {

  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);



  let response: Response;

  try {

    response = await fetch(url, {

      method,

      // NB: no Content-Type — the browser sets the multipart boundary itself.

      headers: { Accept: 'application/json' },

      body: form,

      signal: controller.signal,

    });

  } catch (err) {

    if (err instanceof DOMException && err.name === 'AbortError') {

      throw new ApiError(`استغرق ${opts.timeoutLabel} وقتاً طويلاً. حاول مرة أخرى.`);

    }

    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');

  } finally {

    clearTimeout(timer);

  }



  if (!response.ok) {

    throw new ApiError(await readErrorMessage(response, opts.failureAction), response.status);

  }



  let body: ApiProduct | { data: ApiProduct };

  try {

    body = (await response.json()) as ApiProduct | { data: ApiProduct };

  } catch {

    throw new ApiError(opts.parseError, response.status);

  }



  // Accept both a bare product object and a `{ data: {...} }` envelope.

  const product =

    body && typeof body === 'object' && 'data' in body ? (body as { data: ApiProduct }).data : body;

  if (!product || typeof product !== 'object' || typeof (product as ApiProduct).id !== 'number') {

    throw new ApiError(opts.invalidError, response.status);

  }

  return product as ApiProduct;

}



/**

 * Create a product via `POST /api/products` (multipart/form-data). Image files

 * are sent under `images[]`, which is how Laravel parses an array of uploads.

 * Throws {@link ApiError} with a user-facing Arabic message on any failure.

 */

export async function createProduct(input: CreateProductInput): Promise<ApiProduct> {

  const form = buildProductForm(input);

  try {

    return await sendProductForm(

      PRODUCTS_ENDPOINT,

      'POST',

      form,

      {

        timeoutLabel: 'إنشاء المنتج',

        failureAction: 'فشل إنشاء المنتج',

        parseError: 'تم إنشاء المنتج لكن تعذّرت قراءة استجابة الخادم.',

        invalidError: 'استجابة غير صالحة من الخادم بعد إنشاء المنتج.'

      }

    );

  } catch (err) {

    throw err;

  }

}



/**

 * Update a product via `PATCH /api/products/{idOrSlug}` (multipart/form-data).

 * `images[]` is only appended when new files are picked, so the server keeps

 * existing images otherwise (replace semantics when files are sent).

 * Throws {@link ApiError} with a user-facing Arabic message on any failure.

 */

export async function updateProduct(

  idOrSlug: number | string,

  input: CreateProductInput

): Promise<ApiProduct> {

  const form = buildProductForm(input);

  return sendProductForm(

    `${PRODUCTS_ENDPOINT}/${encodeURIComponent(String(idOrSlug))}`,

    'PATCH',

    form,

    {

      timeoutLabel: 'حفظ المنتج',

      failureAction: 'فشل تحديث المنتج',

      parseError: 'تم تحديث المنتج لكن تعذّرت قراءة استجابة الخادم.',

      invalidError: 'استجابة غير صالحة من الخادم بعد تحديث المنتج.'

    }

  );

}



/**

 * Delete a product by ID or slug via `DELETE /api/products/{idOrSlug}`.

 * Removes the product row, its image rows, and the stored image files.

 * Throws {@link ApiError} with a user-facing Arabic message on any failure.

 */

export async function deleteProduct(idOrSlug: number | string): Promise<void> {

  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);



  let response: Response;

  try {

    response = await fetch(`${PRODUCTS_ENDPOINT}/${encodeURIComponent(String(idOrSlug))}`, {

      method: 'DELETE',

      headers: { Accept: 'application/json' },

      signal: controller.signal,

    });

  } catch (err) {

    if (err instanceof DOMException && err.name === 'AbortError') {

      throw new ApiError('استغرق حذف المنتج وقتاً طويلاً. حاول مرة أخرى.');

    }

    throw new ApiError('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');

  } finally {

    clearTimeout(timer);

  }



  if (response.status === 404) {

    throw new ApiError('المنتج غير موجود. ربما تم حذفه بالفعل.', response.status);

  }



  if (!response.ok) {

    throw new ApiError(`فشل حذف المنتج (رمز ${response.status}).`, response.status);

  }



  // 204 No Content is the expected success response.

}
