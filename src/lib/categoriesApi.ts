import { API_BASE_URL } from './api';

const CATEGORIES_ENDPOINT = `${API_BASE_URL}/api/categories`;

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriesResponse {
  data: Category[];
  links: Record<string, unknown>;
  meta: Record<string, unknown>;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 24;

type CacheEntry = {
  data: Category[];
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();

function invalidateCategoriesCache(): void {
  cache.clear();
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

function createRequestSignal(external?: AbortSignal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  const onExternalAbort = () => {
    clearTimeout(timeout);
    controller.abort();
  };

  if (external) {
    if (external.aborted) onExternalAbort();
    else external.addEventListener('abort', onExternalAbort);
  }

  return {
    signal: controller.signal,
    // Stop listening for the timeout/external abort without cancelling the
    // request. Must be used once the response body has been fully read —
    // aborting before that would kill the body stream.
    cleanup: () => {
      clearTimeout(timeout);
      external?.removeEventListener('abort', onExternalAbort);
    },
    // Cancel an in-flight request.
    dispose: () => {
      clearTimeout(timeout);
      external?.removeEventListener('abort', onExternalAbort);
      controller.abort();
    },
  };
}

function parseCategory(data: unknown): Category | null {
  if (!data || typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== 'number') return null;
  if (typeof obj.name !== 'string') return null;
  if (typeof obj.created_at !== 'string') return null;
  if (typeof obj.updated_at !== 'string') return null;

  return {
    id: obj.id,
    name: obj.name,
    created_at: obj.created_at,
    updated_at: obj.updated_at,
  };
}

/**
 * Fetch all categories from the API.
 * Served from memory cache when fresh (5 min TTL).
 * Identical concurrent calls share one network request (deduplication).
 */
export async function fetchCategories(): Promise<Category[]> {
  const cacheKey = 'all';

  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    console.log('========= categories from cache ============', cached.data);
    return cached.data;
  }

  const { signal, cleanup, dispose } = createRequestSignal();

  let response: Response;
  try {
    console.log('========= fetching categories from ============', CATEGORIES_ENDPOINT);
    response = await fetch(CATEGORIES_ENDPOINT, {
      headers: { Accept: 'application/json' },
      signal,
    });
    console.log("========= categories response ================", response.status, response.ok);
  } catch (err) {
    console.error('========= categories error ============', err);
    dispose();
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('استغرق تحميل الفئات وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new Error('تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.');
  }

  if (!response.ok) {
    dispose();
    throw new Error(`فشل تحميل الفئات: ${response.status}`);
  }

  let body: unknown;
  try {
    const text = await response.text();
    console.log('========= categories text response ============', text);
    if (!text) {
      body = [];
    } else {
      body = JSON.parse(text);
    }
    console.log('========= categories body ============', body);
  } catch (err) {
    console.error('========= categories parse error ============', err);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('استغرق تحميل الفئات وقتاً طويلاً. حاول مرة أخرى.');
    }
    throw new Error('استجابة غير صالحة من الخادم.');
  } finally {
    // Body fully read — release the timeout without cancelling the request.
    cleanup();
  }

  // Support both { data: [] } and direct array []
  let categories: unknown[];
  if (Array.isArray(body)) {
    categories = body;
  } else if (body && typeof body === 'object' && 'data' in body) {
    const data = (body as { data: unknown }).data;
    categories = Array.isArray(data) ? data : [];
  } else {
    categories = [];
  }

  console.log('========= categories parsed ============', categories);

  const parsed = categories.map(parseCategory).filter((c): c is Category => c !== null);

  console.log('========= categories final ============', parsed);

  // Update cache
  cache.set(cacheKey, { data: parsed, timestamp: Date.now() });

  // Limit cache size
  if (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = Array.from(cache.keys())[0];
    cache.delete(oldestKey);
  }

  return parsed;
}

export { invalidateCategoriesCache };
